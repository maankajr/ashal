import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Store } from "../models/Store.js";
import { AppError } from "../utils/AppError.js";
import { uniqueSlug } from "../utils/slugify.js";
import { hashToken, parseDurationToMs } from "../utils/authCookies.js";

function getAccessSecret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT is not configured", {
      status: 500,
      code: "AUTH_MISCONFIGURED",
    });
  }
  return process.env.JWT_SECRET;
}

function getRefreshSecret() {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError("JWT refresh is not configured", {
      status: 500,
      code: "AUTH_MISCONFIGURED",
    });
  }
  return process.env.JWT_REFRESH_SECRET;
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      typ: "access",
    },
    getAccessSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      typ: "refresh",
    },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
}

export function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.refreshTokenExpiresAt;
  return obj;
}

async function persistRefreshToken(userId, refreshToken) {
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpiresAt = new Date(
    Date.now() + parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 86_400_000)
  );

  await User.findByIdAndUpdate(userId, {
    refreshTokenHash,
    refreshTokenExpiresAt,
  });
}

export async function issueAuthSession(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(user._id, refreshToken);
  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

export async function clearRefreshSession(userId) {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
  });
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

  const session = await issueAuthSession(user);
  return session;
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

  const session = await issueAuthSession(user);
  return {
    ...session,
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

  return issueAuthSession(user);
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token required", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshSecret());
  } catch {
    throw new AppError("Invalid or expired refresh token", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (decoded.typ && decoded.typ !== "refresh") {
    throw new AppError("Invalid refresh token", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  const user = await User.findById(decoded.sub).select(
    "+refreshTokenHash +refreshTokenExpiresAt"
  );

  if (!user || user.status !== "active") {
    throw new AppError("User not found or disabled", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
    throw new AppError("Refresh session is not active", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
    await clearRefreshSession(user._id);
    throw new AppError("Refresh token expired", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  if (user.refreshTokenHash !== hashToken(refreshToken)) {
    await clearRefreshSession(user._id);
    throw new AppError("Refresh token revoked", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  return issueAuthSession(user);
}

export async function logout(userId) {
  await clearRefreshSession(userId);
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user || user.status !== "active") {
    throw new AppError("User not found or disabled", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return sanitizeUser(user);
}
