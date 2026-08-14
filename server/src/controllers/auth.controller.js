import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.body);
  return success(res, result, undefined, 201);
});

export const registerVendor = asyncHandler(async (req, res) => {
  const result = await authService.registerVendor(req.body);
  return success(res, result, undefined, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, result);
});

export const logout = asyncHandler(async (_req, res) => {
  return success(res, { message: "Logged out successfully" });
});
