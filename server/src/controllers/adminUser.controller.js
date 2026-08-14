import * as adminUserService from "../services/adminUser.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminUserService.listUsers(req.query);
  return success(res, result.items, result.meta);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUserStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );
  return success(res, user);
});
