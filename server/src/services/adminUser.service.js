import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const USER_STATUSES = ["active", "disabled"];
const USER_ROLES = ["customer", "vendor", "admin"];

export async function listUsers(query = {}) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 20 });
  const filter = {};

  if (USER_ROLES.includes(query.role)) {
    filter.role = query.role;
  }

  if (USER_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

export async function updateUserStatus(adminId, userId, status) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("User not found", { status: 404, code: "NOT_FOUND" });
  }

  if (!USER_STATUSES.includes(status)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "status", message: "Status must be active or disabled" }],
    });
  }

  if (String(adminId) === String(userId)) {
    throw new AppError("You cannot change your own account status", {
      status: 400,
      code: "FORBIDDEN",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", { status: 404, code: "NOT_FOUND" });
  }

  if (user.role === "admin") {
    throw new AppError("Admin accounts cannot be disabled from here", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  user.status = status;
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.passwordHash;
  return safeUser;
}
