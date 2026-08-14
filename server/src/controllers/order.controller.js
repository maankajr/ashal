import * as orderService from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const checkout = asyncHandler(async (req, res) => {
  const result = await orderService.checkout(req.user._id, req.body);
  return success(res, result, undefined, 201);
});

export const listOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listCustomerOrders(req.user._id, req.query);
  return success(res, result.items, result.meta);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getCustomerOrder(req.user._id, req.params.id);
  return success(res, order);
});
