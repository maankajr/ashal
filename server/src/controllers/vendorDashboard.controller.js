import * as vendorDashboardService from "../services/vendorDashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await vendorDashboardService.getVendorDashboard(req.user);
  return success(res, dashboard);
});
