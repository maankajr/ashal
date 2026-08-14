import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import mongoose from "mongoose";

export async function listProducts(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { status: "active" };

  if (query.q) {
    filter.$text = { $search: String(query.q) };
  }

  if (query.category) {
    const categoryFilter = [{ slug: query.category }];
    if (mongoose.isValidObjectId(query.category)) {
      categoryFilter.push({ _id: query.category });
    }

    const category = await Category.findOne({ $or: categoryFilter });

    if (category) {
      filter.categoryId = category._id;
    } else {
      return {
        items: [],
        meta: buildPaginationMeta({ total: 0, page, limit }),
      };
    }
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
  }

  let sort = { createdAt: -1 };
  switch (query.sort) {
    case "price_asc":
      sort = { price: 1 };
      break;
    case "price_desc":
      sort = { price: -1 };
      break;
    case "rating":
      sort = { ratingAvg: -1, ratingCount: -1 };
      break;
    case "newest":
    default:
      sort = { createdAt: -1 };
      break;
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .populate("storeId", "name slug logoUrl status")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function getProductBySlug(slug) {
  const product = await Product.findOne({ slug, status: "active" })
    .populate("categoryId", "name slug imageUrl")
    .populate("storeId", "name slug logoUrl bannerUrl description status")
    .lean();

  if (!product) {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return product;
}

export async function listCategories() {
  return Category.find().sort({ name: 1 }).lean();
}
