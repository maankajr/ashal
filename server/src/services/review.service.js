import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { SubOrder } from "../models/SubOrder.js";
import { AppError } from "../utils/AppError.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

const ELIGIBLE_ORDER_STATUSES = ["Delivered", "Completed"];
const MIN_COMMENT_LENGTH = 5;
const MAX_COMMENT_LENGTH = 1000;

async function resolveProduct(slugOrId) {
  const filter = mongoose.isValidObjectId(slugOrId)
    ? { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    : { slug: slugOrId };

  const product = await Product.findOne({ ...filter, status: "active" });
  if (!product) {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }
  return product;
}

function validateReviewInput({ rating, comment }, { partial = false } = {}) {
  const errors = [];

  if (!partial || rating !== undefined) {
    const value = Number(rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors.push({ field: "rating", message: "rating must be an integer from 1 to 5" });
    }
  }

  if (!partial || comment !== undefined) {
    const text = String(comment ?? "").trim();
    if (text.length < MIN_COMMENT_LENGTH) {
      errors.push({
        field: "comment",
        message: `comment must be at least ${MIN_COMMENT_LENGTH} characters`,
      });
    } else if (text.length > MAX_COMMENT_LENGTH) {
      errors.push({
        field: "comment",
        message: `comment must be at most ${MAX_COMMENT_LENGTH} characters`,
      });
    }
  }

  if (errors.length) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: errors,
    });
  }
}

export async function hasReceivedProduct(userId, productId) {
  const orders = await Order.find({ customerId: userId }).select("_id").lean();
  if (!orders.length) return false;

  const match = await SubOrder.exists({
    parentOrderId: { $in: orders.map((order) => order._id) },
    status: { $in: ELIGIBLE_ORDER_STATUSES },
    "items.productId": productId,
  });

  return Boolean(match);
}

async function recalculateProductRating(productId) {
  const [stats] = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(String(productId)),
        status: "visible",
      },
    },
    {
      $group: {
        _id: "$productId",
        ratingAvg: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAvg: stats ? Math.round(stats.ratingAvg * 10) / 10 : 0,
    ratingCount: stats?.ratingCount || 0,
  });
}

function serializeReview(review, currentUserId = null) {
  const obj = review.toObject ? review.toObject() : review;
  const populatedUser =
    obj.userId &&
    typeof obj.userId === "object" &&
    obj.userId._id &&
    typeof obj.userId.name === "string"
      ? obj.userId
      : null;

  const ownerId = populatedUser?._id || obj.userId;

  return {
    _id: obj._id,
    productId: obj.productId?._id || obj.productId,
    rating: obj.rating,
    comment: obj.comment,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    user: populatedUser
      ? {
          _id: populatedUser._id,
          name: populatedUser.name,
        }
      : null,
    isOwner: currentUserId ? String(ownerId) === String(currentUserId) : false,
  };
}

export async function listProductReviews(slugOrId, query = {}, currentUserId = null) {
  const product = await resolveProduct(slugOrId);
  const { page, limit, skip } = getPagination(query);

  const filter = { productId: product._id, status: "visible" };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name")
      .lean(),
    Review.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => serializeReview(item, currentUserId)),
    meta: buildPaginationMeta({ total, page, limit }),
    productId: product._id,
  };
}

export async function getReviewEligibility(userId, slugOrId) {
  const product = await resolveProduct(slugOrId);
  const existing = await Review.findOne({
    productId: product._id,
    userId,
  }).lean();

  const canReview = await hasReceivedProduct(userId, product._id);

  return {
    productId: product._id,
    canReview: canReview && !existing,
    hasPurchased: canReview,
    existingReview: existing ? serializeReview(existing, userId) : null,
  };
}

export async function createReview(userId, slugOrId, payload) {
  const product = await resolveProduct(slugOrId);
  validateReviewInput(payload);

  const eligible = await hasReceivedProduct(userId, product._id);
  if (!eligible) {
    throw new AppError("You can only review products you have received", {
      status: 403,
      code: "NOT_ELIGIBLE",
      details: [
        {
          field: "productId",
          message: "Purchase and receive this product (Delivered or Completed) before reviewing",
        },
      ],
    });
  }

  const duplicate = await Review.findOne({ productId: product._id, userId });
  if (duplicate) {
    throw new AppError("You have already reviewed this product", {
      status: 409,
      code: "CONFLICT",
      details: [{ field: "productId", message: "Only one review per product is allowed" }],
    });
  }

  try {
    const review = await Review.create({
      productId: product._id,
      userId,
      rating: Number(payload.rating),
      comment: String(payload.comment).trim(),
      status: "visible",
    });

    await recalculateProductRating(product._id);
    await review.populate("userId", "name");
    return serializeReview(review, userId);
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("You have already reviewed this product", {
        status: 409,
        code: "CONFLICT",
        details: [{ field: "productId", message: "Only one review per product is allowed" }],
      });
    }
    throw error;
  }
}

export async function updateOwnReview(userId, reviewId, payload) {
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new AppError("Invalid review id", { status: 400, code: "BAD_REQUEST" });
  }

  validateReviewInput(payload, { partial: true });

  const review = await Review.findById(reviewId);
  if (!review || review.status === "hidden") {
    throw new AppError("Review not found", { status: 404, code: "NOT_FOUND" });
  }

  if (String(review.userId) !== String(userId)) {
    throw new AppError("You can only edit your own review", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  if (payload.rating !== undefined) review.rating = Number(payload.rating);
  if (payload.comment !== undefined) review.comment = String(payload.comment).trim();

  await review.save();
  await recalculateProductRating(review.productId);
  await review.populate("userId", "name");
  return serializeReview(review, userId);
}

export async function deleteOwnReview(userId, reviewId) {
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new AppError("Invalid review id", { status: 400, code: "BAD_REQUEST" });
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", { status: 404, code: "NOT_FOUND" });
  }

  if (String(review.userId) !== String(userId)) {
    throw new AppError("You can only delete your own review", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const productId = review.productId;
  await review.deleteOne();
  await recalculateProductRating(productId);
  return { deleted: true };
}
