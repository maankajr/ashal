import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

function computeCartTotals(items) {
  const grouped = {};

  for (const item of items) {
    const product = item.productId;
    if (!product || typeof product !== "object") continue;

    const store = product.storeId;
    const storeKey =
      store && typeof store === "object"
        ? String(store._id)
        : String(store || "unknown");

    if (!grouped[storeKey]) {
      grouped[storeKey] = {
        store:
          store && typeof store === "object"
            ? {
                _id: store._id,
                name: store.name,
                slug: store.slug,
                logoUrl: store.logoUrl,
              }
            : { _id: storeKey, name: "Unknown store" },
        items: [],
        subtotal: 0,
      };
    }

    const lineTotal = item.priceSnapshot * item.quantity;
    grouped[storeKey].items.push({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url || "",
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      lineTotal,
      stock: product.stock,
      storeId: store?._id || store,
    });
    grouped[storeKey].subtotal += lineTotal;
  }

  const byStore = Object.values(grouped);
  const grandTotal = byStore.reduce((sum, group) => sum + group.subtotal, 0);

  return { byStore, grandTotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
}

export async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: "items.productId",
    select: "name slug price stock images status storeId",
    populate: { path: "storeId", select: "name slug logoUrl" },
  });

  const activeItems = cart.items.filter(
    (item) => item.productId && item.productId.status === "active"
  );

  return {
    _id: cart._id,
    userId: cart.userId,
    items: activeItems,
    totals: computeCartTotals(activeItems),
  };
}

export async function addCartItem(userId, { productId, quantity = 1 }) {
  const qty = Math.max(1, Number(quantity) || 1);

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError("Invalid productId", {
      status: 400,
      code: "BAD_REQUEST",
    });
  }

  const product = await Product.findById(productId);
  if (!product || product.status !== "active") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (product.stock < qty) {
    throw new AppError("Insufficient stock", {
      status: 400,
      code: "OUT_OF_STOCK",
      details: [
        {
          field: "quantity",
          message:
            product.stock <= 0
              ? "This product is out of stock"
              : `Only ${product.stock} left in stock`,
        },
      ],
    });
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find(
    (item) => String(item.productId) === String(productId)
  );

  if (existing) {
    const nextQty = existing.quantity + qty;
    if (product.stock < nextQty) {
      const remaining = Math.max(0, product.stock - existing.quantity);
      throw new AppError("Insufficient stock", {
        status: 400,
        code: "OUT_OF_STOCK",
        details: [
          {
            field: "quantity",
            message:
              remaining <= 0
                ? `You already have the maximum available (${product.stock}) in your cart`
                : `Only ${remaining} more can be added (${product.stock} in stock, ${existing.quantity} already in cart)`,
          },
        ],
      });
    }
    existing.quantity = nextQty;
    existing.priceSnapshot = product.price;
  } else {
    cart.items.push({
      productId: product._id,
      quantity: qty,
      priceSnapshot: product.price,
    });
  }

  await cart.save();
  return getCart(userId);
}

export async function updateCartItem(userId, productId, quantity) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "quantity", message: "quantity must be at least 1" }],
    });
  }

  const product = await Product.findById(productId);
  if (!product || product.status !== "active") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (product.stock < qty) {
    throw new AppError("Insufficient stock", {
      status: 400,
      code: "OUT_OF_STOCK",
      details: [{ field: "quantity", message: `Only ${product.stock} in stock` }],
    });
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => String(entry.productId) === String(productId));

  if (!item) {
    throw new AppError("Cart item not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  item.quantity = qty;
  item.priceSnapshot = product.price;
  await cart.save();
  return getCart(userId);
}

export async function removeCartItem(userId, productId) {
  const cart = await getOrCreateCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));

  if (cart.items.length === before) {
    throw new AppError("Cart item not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await cart.save();
  return getCart(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return getCart(userId);
}
