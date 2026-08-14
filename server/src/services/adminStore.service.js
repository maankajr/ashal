import mongoose from "mongoose";
import { Store } from "../models/Store.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const STORE_STATUSES = ["pending", "active", "suspended", "rejected"];

export async function listStores(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });
  const filter = {};

  if (STORE_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Store.find(filter)
      .populate("vendorId", "name email status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Store.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function updateStoreStatus(storeId, status) {
  if (!mongoose.isValidObjectId(storeId)) {
    throw new AppError("Store not found", { status: 404, code: "NOT_FOUND" });
  }

  if (!STORE_STATUSES.includes(status)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "status", message: `Status must be one of: ${STORE_STATUSES.join(", ")}` }],
    });
  }

  const store = await Store.findById(storeId);

  if (!store) {
    throw new AppError("Store not found", { status: 404, code: "NOT_FOUND" });
  }

  store.status = status;
  await store.save();

  return store.populate("vendorId", "name email status");
}
