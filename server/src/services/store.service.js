import mongoose from "mongoose";
import { Store } from "../models/Store.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

export async function getPublicStoreBySlug(slugOrId, query = {}) {
  const storeFilter = [{ slug: String(slugOrId).toLowerCase() }];
  if (mongoose.isValidObjectId(slugOrId)) {
    storeFilter.push({ _id: slugOrId });
  }

  const store = await Store.findOne({
    $or: storeFilter,
    status: { $in: ["active", "pending"] },
  }).lean();

  if (!store) {
    throw new AppError("Store not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const { page, limit, skip } = getPagination(query);
  const productFilter = {
    storeId: store._id,
    status: "active",
  };

  const [products, total] = await Promise.all([
    Product.find(productFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .populate("storeId", "name slug logoUrl bannerUrl status")
      .lean(),
    Product.countDocuments(productFilter),
  ]);

  const reviewedProducts = products.filter((p) => (p.ratingCount || 0) > 0);
  const averageRating =
    reviewedProducts.length > 0
      ? reviewedProducts.reduce((sum, p) => sum + (p.ratingAvg || 0), 0) / reviewedProducts.length
      : 5.0;

  return {
    store: {
      _id: store._id,
      name: store.name,
      slug: store.slug,
      description: store.description || "",
      logoUrl: store.logoUrl || "",
      bannerUrl: store.bannerUrl || "",
      contactEmail: store.contactEmail || "",
      contactPhone: store.contactPhone || "",
      status: store.status,
      createdAt: store.createdAt,
      rating: Number(averageRating.toFixed(1)),
      productCount: total,
    },
    products,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}
