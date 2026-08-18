import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    region: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    phone: { type: String, trim: true, default: "" },
    avatarUrl: { type: String, trim: true, default: "" },
    addresses: { type: [addressSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    refreshTokenExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
