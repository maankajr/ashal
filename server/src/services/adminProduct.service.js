import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const PRODUCT_STATUSES = ["pending", "active", "rejected", "deleted"];

export async function listProducts(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });
  const filter = {};

  if (PRODUCT_STATUSES.includes(query.status)) {
    filter.status = query.status;
  } else {
    filter.status = { $ne: "deleted" };
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("storeId", "name slug status")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function updateProductStatus(productId, status) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError("Product not found", { status: 404, code: "NOT_FOUND" });
  }

  if (!PRODUCT_STATUSES.includes(status)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "status", message: `Status must be one of: ${PRODUCT_STATUSES.join(", ")}` }],
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", { status: 404, code: "NOT_FOUND" });
  }

  product.status = status;
  await product.save();

  return product.populate([
    { path: "storeId", select: "name slug status" },
    { path: "categoryId", select: "name slug" },
  ]);
}
