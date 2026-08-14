import * as adminStoreService from "../services/adminStore.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listStores = asyncHandler(async (req, res) => {
  const result = await adminStoreService.listStores(req.query);
  return success(res, result.items, result.meta);
});

export const updateStoreStatus = asyncHandler(async (req, res) => {
  const store = await adminStoreService.updateStoreStatus(req.params.id, req.body.status);
  return success(res, store);
});
