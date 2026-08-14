import * as adminDashboardService from "../services/adminDashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getDashboard = asyncHandler(async (_req, res) => {
  const dashboard = await adminDashboardService.getAdminDashboard();
  return success(res, dashboard);
});
