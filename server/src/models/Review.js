import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
