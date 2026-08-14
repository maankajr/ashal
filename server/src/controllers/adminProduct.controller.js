import * as adminProductService from "../services/adminProduct.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listProducts = asyncHandler(async (req, res) => {
  const result = await adminProductService.listProducts(req.query);
  return success(res, result.items, result.meta);
});

export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await adminProductService.updateProductStatus(req.params.id, req.body.status);
  return success(res, product);
});
