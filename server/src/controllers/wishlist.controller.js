import * as wishlistService from "../services/wishlist.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getMyWishlist(req.user._id);
  return success(res, wishlist);
});

export const addProduct = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addToWishlist(req.user._id, req.params.productId);
  return success(res, wishlist, undefined, 201);
});

export const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(
    req.user._id,
    req.params.productId
  );
  return success(res, wishlist);
});

export const moveProductToCart = asyncHandler(async (req, res) => {
  const result = await wishlistService.moveToCart(req.user._id, req.params.productId);
  return success(res, result);
});
