import axiosClient from "./axiosClient.js";

export async function getCart() {
  const { data } = await axiosClient.get("/cart");
  return data.data;
}

export async function addCartItem(productId, quantity = 1) {
  const { data } = await axiosClient.post("/cart/items", { productId, quantity });
  return data.data;
}

export async function updateCartItem(productId, quantity) {
  const { data } = await axiosClient.patch(`/cart/items/${productId}`, { quantity });
  return data.data;
}

export async function removeCartItem(productId) {
  const { data } = await axiosClient.delete(`/cart/items/${productId}`);
  return data.data;
}

export async function clearCart() {
  const { data } = await axiosClient.delete("/cart");
  return data.data;
}

export function mapCartToItems(cart) {
  if (!cart?.totals?.byStore) return [];

  return cart.totals.byStore.flatMap((group) =>
    group.items.map((item) => ({
      id: item.productId,
      productId: item.productId,
      storeName: group.store?.name || "Ashal Store",
      productName: item.name,
      price: item.priceSnapshot,
      quantity: item.quantity,
      image: item.image || "",
    }))
  );
}
