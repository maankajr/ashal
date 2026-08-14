import axiosClient from "./axiosClient.js";

export async function getMyOrders(params = {}) {
  const { data } = await axiosClient.get("/orders", { params });
  return { items: data.data, meta: data.meta };
}

export async function getOrderById(id) {
  const { data } = await axiosClient.get(`/orders/${id}`);
  return data.data;
}

export async function checkout(payload) {
  const { data } = await axiosClient.post("/orders/checkout", payload);
  return data.data;
}
