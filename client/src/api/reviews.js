import axiosClient from "./axiosClient.js";

export async function listProductReviews(slugOrId, params = {}) {
  const { data } = await axiosClient.get(`/products/${slugOrId}/reviews`, { params });
  return { items: data.data, meta: data.meta };
}

export async function getReviewEligibility(slugOrId) {
  const { data } = await axiosClient.get(`/products/${slugOrId}/reviews/eligibility`);
  return data.data;
}

export async function createReview(slugOrId, payload) {
  const { data } = await axiosClient.post(`/products/${slugOrId}/reviews`, payload);
  return data.data;
}

export async function updateReview(reviewId, payload) {
  const { data } = await axiosClient.patch(`/reviews/${reviewId}`, payload);
  return data.data;
}

export async function deleteReview(reviewId) {
  const { data } = await axiosClient.delete(`/reviews/${reviewId}`);
  return data.data;
}
