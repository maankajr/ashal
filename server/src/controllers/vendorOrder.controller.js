import * as vendorOrderService from "../services/vendorOrder.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await vendorOrderService.listVendorOrders(req.user);
  return success(res, orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await vendorOrderService.updateSubOrderStatus(
    req.user,
    req.params.id,
    req.body.status
  );
  return success(res, order);
});

export const getNextStatuses = asyncHandler(async (req, res) => {
  const next = vendorOrderService.getNextStatuses(req.params.status || req.query.status);
  return success(res, { nextStatuses: next });
});
