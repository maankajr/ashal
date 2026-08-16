import * as storeService from "../services/store.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getStoreBySlug = asyncHandler(async (req, res) => {
  const data = await storeService.getPublicStoreBySlug(req.params.slug, req.query);
  return success(res, data);
});
