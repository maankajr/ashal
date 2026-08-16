import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";
import { uniqueSlug } from "../utils/slugify.js";

export async function listCategories(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });
  const filter = {};

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate("parentId", "name slug")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.countDocuments(filter),
  ]);

  // Aggregate product counts for each category
  const categoryIds = categories.map((c) => c._id);
  const productCounts = await Product.aggregate([
    {
      $match: {
        categoryId: { $in: categoryIds },
        status: { $ne: "deleted" },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(productCounts.map((item) => [item._id.toString(), item.count]));

  const items = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function createCategory(payload = {}) {
  const name = String(payload.name || "").trim();
  if (!name || name.length < 2) {
    throw new AppError("Category name must be at least 2 characters", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "name", message: "Category name is required (min 2 characters)" }],
    });
  }

  let parentId = null;
  if (payload.parentId) {
    if (!mongoose.isValidObjectId(payload.parentId)) {
      throw new AppError("Invalid parent category ID", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: [{ field: "parentId", message: "Parent category ID is invalid" }],
      });
    }
    const parentExists = await Category.findById(payload.parentId);
    if (!parentExists) {
      throw new AppError("Parent category not found", {
        status: 404,
        code: "PARENT_NOT_FOUND",
      });
    }
    parentId = parentExists._id;
  }

  const slug = await uniqueSlug(Category, name);
  const category = await Category.create({
    name,
    slug,
    parentId,
    imageUrl: String(payload.imageUrl || "").trim(),
  });

  return category.populate("parentId", "name slug");
}

export async function updateCategory(categoryId, payload = {}) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError("Category not found", { status: 404, code: "NOT_FOUND" });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", { status: 404, code: "NOT_FOUND" });
  }

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name || name.length < 2) {
      throw new AppError("Category name must be at least 2 characters", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: [{ field: "name", message: "Category name must be at least 2 characters" }],
      });
    }
    if (name !== category.name) {
      category.name = name;
      category.slug = await uniqueSlug(Category, name, "slug", category._id);
    }
  }

  if (payload.imageUrl !== undefined) {
    category.imageUrl = String(payload.imageUrl).trim();
  }

  if (payload.parentId !== undefined) {
    if (payload.parentId === null || payload.parentId === "") {
      category.parentId = null;
    } else {
      if (!mongoose.isValidObjectId(payload.parentId)) {
        throw new AppError("Invalid parent category ID", {
          status: 422,
          code: "VALIDATION_ERROR",
          details: [{ field: "parentId", message: "Parent category ID is invalid" }],
        });
      }
      if (String(payload.parentId) === String(category._id)) {
        throw new AppError("Category cannot be its own parent", {
          status: 422,
          code: "CIRCULAR_PARENT",
          details: [{ field: "parentId", message: "A category cannot be its own parent" }],
        });
      }
      const parentExists = await Category.findById(payload.parentId);
      if (!parentExists) {
        throw new AppError("Parent category not found", {
          status: 404,
          code: "PARENT_NOT_FOUND",
        });
      }
      category.parentId = parentExists._id;
    }
  }

  await category.save();
  return category.populate("parentId", "name slug");
}

export async function deleteCategory(categoryId) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError("Category not found", { status: 404, code: "NOT_FOUND" });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", { status: 404, code: "NOT_FOUND" });
  }

  // Block deletion if products are assigned to this category
  const productCount = await Product.countDocuments({
    categoryId: category._id,
    status: { $ne: "deleted" },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete category "${category.name}". It currently has ${productCount} active product${
        productCount === 1 ? "" : "s"
      }.`,
      {
        status: 409,
        code: "CATEGORY_IN_USE",
        details: [
          {
            field: "category",
            message: `Please reassign or delete the ${productCount} product${
              productCount === 1 ? "" : "s"
            } in this category first.`,
          },
        ],
      }
    );
  }

  // Block deletion if subcategories exist
  const childCount = await Category.countDocuments({ parentId: category._id });
  if (childCount > 0) {
    throw new AppError(
      `Cannot delete category "${category.name}". It currently has ${childCount} subcategor${
        childCount === 1 ? "y" : "ies"
      }.`,
      {
        status: 409,
        code: "CATEGORY_HAS_CHILDREN",
        details: [
          {
            field: "parentId",
            message: "Please reassign or delete its subcategories first.",
          },
        ],
      }
    );
  }

  await Category.findByIdAndDelete(categoryId);
  return { deleted: true, id: categoryId };
}
