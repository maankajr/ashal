import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const getMe = asyncHandler(async (req, res) => {
  const profile = await userService.getMyProfile(req.user._id);
  return success(res, profile);
});

export const updateMe = asyncHandler(async (req, res) => {
  const profile = await userService.updateMyProfile(req.user._id, req.body);
  return success(res, profile);
});
