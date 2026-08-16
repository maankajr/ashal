import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "../utils/authCookies.js";

function attachSessionCookies(res, session) {
  setAuthCookies(res, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
}

function sessionResponse(session) {
  const { user, store } = session;
  return store ? { user, store } : { user };
}

export const register = asyncHandler(async (req, res) => {
  const session = await authService.registerCustomer(req.body);
  attachSessionCookies(res, session);
  return success(res, sessionResponse(session), undefined, 201);
});

export const registerVendor = asyncHandler(async (req, res) => {
  const session = await authService.registerVendor(req.body);
  attachSessionCookies(res, session);
  return success(res, sessionResponse(session), undefined, 201);
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);
  attachSessionCookies(res, session);
  return success(res, sessionResponse(session));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  const session = await authService.refreshSession(refreshToken);
  attachSessionCookies(res, session);
  return success(res, sessionResponse(session));
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  return success(res, { user });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await authService.logout(req.user._id);
  }
  clearAuthCookies(res);
  return success(res, { message: "Logged out successfully" });
});
