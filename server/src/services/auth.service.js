import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Store } from "../models/Store.js";
import { AppError } from "../utils/AppError.js";
import { uniqueSlug } from "../utils/slugify.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

export async function registerCustomer({ name, email, password, phone = "" }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new AppError("Email already exists", {
      status: 409,
      code: "CONFLICT",
      details: [{ field: "email", message: "Email already exists" }],
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone,
    role: "customer",
  });

  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

export async function registerVendor({
  name,
  email,
  password,
  phone = "",
  storeName,
  storeDescription = "",
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new AppError("Email already exists", {
      status: 409,
      code: "CONFLICT",
      details: [{ field: "email", message: "Email already exists" }],
    });
  }

  if (!storeName || String(storeName).trim().length < 2) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "storeName", message: "Store name is required" }],
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone,
    role: "vendor",
  });

  const slug = await uniqueSlug(Store, storeName);
  const store = await Store.create({
    vendorId: user._id,
    name: storeName.trim(),
    slug,
    description: storeDescription,
    status: "active",
  });

  user.storeId = store._id;
  await user.save();

  const token = signToken(user);
  return {
    token,
    user: sanitizeUser(user),
    store,
  };
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!user) {
    throw new AppError("Invalid email or password", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (user.status !== "active") {
    throw new AppError("Account is disabled", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}
