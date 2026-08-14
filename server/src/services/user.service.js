import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

function normalizeAddresses(addresses) {
  if (!Array.isArray(addresses)) return addresses;

  let hasDefault = addresses.some((address) => address.isDefault);

  return addresses.map((address, index) => ({
    label: String(address.label || "").trim(),
    line1: String(address.line1 || "").trim(),
    line2: String(address.line2 || "").trim(),
    city: String(address.city || "").trim(),
    region: String(address.region || "").trim(),
    country: String(address.country || "").trim(),
    phone: String(address.phone || "").trim(),
    isDefault: hasDefault ? Boolean(address.isDefault) : index === 0,
    ...(address._id ? { _id: address._id } : {}),
  }));
}

export async function getMyProfile(userId) {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return sanitizeUser(user);
}

export async function updateMyProfile(userId, payload) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (payload.name !== undefined) {
    user.name = String(payload.name).trim();
  }

  if (payload.phone !== undefined) {
    user.phone = String(payload.phone || "").trim();
  }

  if (payload.addresses !== undefined) {
    user.addresses = normalizeAddresses(payload.addresses);
  }

  await user.save();
  return sanitizeUser(user);
}
