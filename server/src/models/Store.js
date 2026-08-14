import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Store = mongoose.model("Store", storeSchema);
