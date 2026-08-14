import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authentication required", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", {
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

  req.user = user;
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
