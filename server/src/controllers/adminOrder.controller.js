import * as adminOrderService from "../services/adminOrder.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listOrders = asyncHandler(async (req, res) => {
  const result = await adminOrderService.listOrders(req.query);
  return success(res, result.items, result.meta);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await adminOrderService.getOrder(req.params.id);
  return success(res, order);
});

export const updateSubOrderStatus = asyncHandler(async (req, res) => {
  const subOrder = await adminOrderService.updateSubOrderStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );
  return success(res, subOrder);
});
