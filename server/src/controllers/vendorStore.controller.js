import * as vendorStoreService from "../services/vendorStore.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import { resolveVendorStore } from "../middleware/vendor.js";

export const getStore = asyncHandler(async (req, res) => {
  try {
    const store = await vendorStoreService.getMyStore(req.user);
    return success(res, store);
  } catch (error) {
    if (error.status === 404) {
      return success(res, null);
    }
    throw error;
  }
});

export const createStore = asyncHandler(async (req, res) => {
  const store = await vendorStoreService.createStore(req.user, req.body);
  return success(res, store, undefined, 201);
});

export const updateStore = asyncHandler(async (req, res) => {
  const store = await vendorStoreService.updateStore(req.user, req.body);
  return success(res, store);
});

export const getStoreOrNull = asyncHandler(async (req, res) => {
  const store = await resolveVendorStore(req.user);
  return success(res, store);
});
