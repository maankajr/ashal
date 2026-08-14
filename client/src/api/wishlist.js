import axiosClient from "./axiosClient.js";
import { mapProductForCard } from "./products.js";

export async function getMyWishlist() {
  const { data } = await axiosClient.get("/wishlist");
  return data.data;
}

export async function addToWishlist(productId) {
  const { data } = await axiosClient.post(`/wishlist/${productId}`);
  return data.data;
}

export async function removeFromWishlist(productId) {
  const { data } = await axiosClient.delete(`/wishlist/${productId}`);
  return data.data;
}

export async function moveToCart(productId) {
  const { data } = await axiosClient.post(`/wishlist/${productId}/move-to-cart`);
  return data.data;
}

export function mapWishlistItems(wishlist) {
  return (wishlist?.items || []).map((product) => mapProductForCard(product));
}
