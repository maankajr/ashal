import * as cartService from "../services/cart.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  return success(res, cart);
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addCartItem(req.user._id, req.body);
  return success(res, cart, undefined, 201);
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(
    req.user._id,
    req.params.productId,
    req.body.quantity
  );
  return success(res, cart);
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCartItem(req.user._id, req.params.productId);
  return success(res, cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  return success(res, cart);
});
