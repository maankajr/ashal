import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ACCESS_COOKIE } from "../utils/authCookies.js";

function extractAccessToken(req) {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization || "";
  const [scheme, bearerToken] = header.split(" ");
  if (scheme === "Bearer" && bearerToken) return bearerToken;

  return null;
}

async function loadActiveUserFromAccessToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (decoded.typ && decoded.typ !== "access") {
    throw new AppError("Invalid access token", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  const user = await User.findById(decoded.sub).select("-passwordHash");

  if (!user || user.status !== "active") {
    throw new AppError("User not found or disabled", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  return user;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    throw new AppError("Authentication required", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  req.user = await loadActiveUserFromAccessToken(token);
  next();
});

/** Best-effort auth for logout: identify user if possible, otherwise continue. */
export const optionalProtect = asyncHandler(async (req, _res, next) => {
  const token = extractAccessToken(req);
  if (!token) return next();

  try {
    req.user = await loadActiveUserFromAccessToken(token);
  } catch {
    // Ignore — logout still clears cookies.
  }

  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", {
          status: 403,
          code: "FORBIDDEN",
        })
      );
    }

    return next();
  };
}
