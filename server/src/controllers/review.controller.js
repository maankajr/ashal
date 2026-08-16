import * as reviewService from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listForProduct = asyncHandler(async (req, res) => {
  const result = await reviewService.listProductReviews(
    req.params.slug,
    req.query,
    req.user?._id || null
  );
  return success(res, result.items, result.meta);
});

export const getEligibility = asyncHandler(async (req, res) => {
  const result = await reviewService.getReviewEligibility(req.user._id, req.params.slug);
  return success(res, result);
});

export const createForProduct = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.params.slug, req.body);
  return success(res, review, undefined, 201);
});

export const updateOwn = asyncHandler(async (req, res) => {
  const review = await reviewService.updateOwnReview(req.user._id, req.params.id, req.body);
  return success(res, review);
});

export const deleteOwn = asyncHandler(async (req, res) => {
  const result = await reviewService.deleteOwnReview(req.user._id, req.params.id);
  return success(res, result);
});
