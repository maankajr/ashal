import mongoose from "mongoose";
import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { addCartItem } from "./cart.service.js";

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, productIds: [] });
  }
  return wishlist;
}

async function populateWishlist(wishlist) {
  if (!wishlist) {
    return { items: [] };
  }

  await wishlist.populate({
    path: "productIds",
    match: { status: "active" },
    select: "name slug price images ratingAvg ratingCount stock storeId status",
    populate: { path: "storeId", select: "name slug logoUrl" },
  });

  const items = (wishlist.productIds || []).filter(Boolean);

  if (items.length !== wishlist.productIds.length) {
    wishlist.productIds = items.map((product) => product._id);
    await wishlist.save();
  }

  return { items, wishlistId: wishlist._id };
}

export async function getMyWishlist(userId) {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return { items: [] };
  }
  return populateWishlist(wishlist);
}

export async function addToWishlist(userId, productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError("Invalid productId", {
      status: 400,
      code: "BAD_REQUEST",
    });
  }

  const product = await Product.findOne({ _id: productId, status: "active" });
  if (!product) {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const wishlist = await getOrCreateWishlist(userId);
  const alreadySaved = wishlist.productIds.some(
    (id) => String(id) === String(productId)
  );

  if (!alreadySaved) {
    wishlist.productIds.push(product._id);
    await wishlist.save();
  }

  return getMyWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return { items: [] };
  }

  wishlist.productIds = wishlist.productIds.filter(
    (id) => String(id) !== String(productId)
  );
  await wishlist.save();

  return getMyWishlist(userId);
}

export async function moveToCart(userId, productId) {
  const cart = await addCartItem(userId, { productId, quantity: 1 });
  const wishlist = await removeFromWishlist(userId, productId);
  return { wishlist, cart };
}
