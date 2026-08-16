import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { uniqueSlug } from "../utils/slugify.js";
import { uploadImageBuffers } from "../utils/imagekit.js";
import { resolveVendorStore } from "../middleware/vendor.js";

async function getVendorStore(user) {
  const store = await resolveVendorStore(user);

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 400,
      code: "STORE_REQUIRED",
    });
  }

  return store;
}

export async function listVendorProducts(user) {
  const store = await getVendorStore(user);
  return Product.find({
    storeId: store._id,
    status: { $ne: "deleted" },
  })
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 });
}

export async function getVendorProduct(user, productId) {
  const store = await getVendorStore(user);
  const product = await Product.findOne({
    _id: productId,
    storeId: store._id,
    status: { $ne: "deleted" },
  }).populate("categoryId", "name slug");

  if (!product) {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return product;
}

export async function createVendorProduct(user, payload) {
  const store = await getVendorStore(user);
  const {
    name,
    description = "",
    price,
    compareAtPrice,
    stock = 0,
    categoryId,
    images = [],
    tags = [],
  } = payload;

  const errors = [];
  if (!name || String(name).trim().length < 2) {
    errors.push({ field: "name", message: "name is required (min 2 characters)" });
  }
  if (price === undefined || Number(price) < 0) {
    errors.push({ field: "price", message: "price is required and must be >= 0" });
  }
  if (!categoryId) {
    errors.push({ field: "categoryId", message: "categoryId is required" });
  }
  if (stock === undefined || Number(stock) < 0) {
    errors.push({ field: "stock", message: "stock is required and must be >= 0" });
  }

  if (errors.length) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: errors,
    });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const slug = await uniqueSlug(Product, name);
  const product = await Product.create({
    storeId: store._id,
    categoryId,
    name: name.trim(),
    slug,
    description,
    price: Number(price),
    compareAtPrice: compareAtPrice !== undefined ? Number(compareAtPrice) : null,
    stock: Number(stock) || 0,
    images,
    tags,
    status: "active",
  });

  return product.populate("categoryId", "name slug");
}

export async function updateVendorProduct(user, productId, payload) {
  const store = await getVendorStore(user);
  const product = await Product.findById(productId);

  if (!product || product.status === "deleted") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(product.storeId) !== String(store._id)) {
    throw new AppError("You do not own this product", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const allowed = [
    "name",
    "description",
    "price",
    "compareAtPrice",
    "stock",
    "categoryId",
    "images",
    "tags",
  ];

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      product[key] = payload[key];
    }
  }

  if (payload.categoryId) {
    const category = await Category.findById(payload.categoryId);
    if (!category) {
      throw new AppError("Category not found", {
        status: 404,
        code: "NOT_FOUND",
      });
    }
  }

  if (payload.name && payload.name.trim() !== product.name) {
    product.slug = await uniqueSlug(Product, payload.name, "slug", product._id);
  }

  await product.save();
  return product.populate("categoryId", "name slug");
}

export async function updateVendorProductStock(user, productId, stock) {
  const store = await getVendorStore(user);
  const product = await Product.findById(productId);

  if (!product || product.status === "deleted") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(product.storeId) !== String(store._id)) {
    throw new AppError("You do not own this product", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const qty = Number(stock);
  if (!Number.isFinite(qty) || qty < 0) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "stock", message: "stock must be a number >= 0" }],
    });
  }

  product.stock = qty;
  await product.save();
  return product;
}

export async function deleteVendorProduct(user, productId) {
  const store = await getVendorStore(user);
  const product = await Product.findById(productId);

  if (!product || product.status === "deleted") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(product.storeId) !== String(store._id)) {
    throw new AppError("You do not own this product", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  product.status = "deleted";
  await product.save();
  return product;
}

export async function uploadVendorProductImages(user, productId, files, { replace = false } = {}) {
  if (!files?.length) {
    throw new AppError("No images uploaded", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "images", message: "At least one image file is required" }],
    });
  }

  const product = await getVendorProduct(user, productId);
  const uploaded = await uploadImageBuffers(files, {
    folder: `/ashal/products/${product._id}`,
  });

  if (replace) {
    product.images = uploaded;
  } else {
    product.images = [...(product.images || []), ...uploaded];
  }

  await product.save();
  return product.populate("categoryId", "name slug");
}
