import axiosClient from "./axiosClient.js";

export async function getAdminDashboard() {
  const { data } = await axiosClient.get("/admin/dashboard");
  return data.data;
}

export async function getAdminUsers(params = {}) {
  const { data } = await axiosClient.get("/admin/users", { params });
  return { items: data.data, meta: data.meta };
}

export async function updateUserStatus(id, status) {
  const { data } = await axiosClient.patch(`/admin/users/${id}/status`, { status });
  return data.data;
}

export async function getAdminStores(params = {}) {
  const { data } = await axiosClient.get("/admin/stores", { params });
  return { items: data.data, meta: data.meta };
}

export async function updateStoreStatus(id, status) {
  const { data } = await axiosClient.patch(`/admin/stores/${id}/status`, { status });
  return data.data;
}

export async function getAdminProducts(params = {}) {
  const { data } = await axiosClient.get("/admin/products", { params });
  return { items: data.data, meta: data.meta };
}

export async function updateProductStatus(id, status) {
  const { data } = await axiosClient.patch(`/admin/products/${id}/status`, { status });
  return data.data;
}

export async function getAdminOrders(params = {}) {
  const { data } = await axiosClient.get("/admin/orders", { params });
  return { items: data.data, meta: data.meta };
}

export async function getAdminOrder(id) {
  const { data } = await axiosClient.get(`/admin/orders/${id}`);
  return data.data;
}

export async function updateSubOrderStatus(id, status) {
  const { data } = await axiosClient.patch(`/admin/sub-orders/${id}/status`, { status });
  return data.data;
}

export const STORE_STATUSES = ["pending", "active", "suspended", "rejected"];
export const PRODUCT_STATUSES = ["pending", "active", "rejected", "deleted"];
export const USER_STATUSES = ["active", "disabled"];
export const USER_ROLES = ["customer", "vendor", "admin"];
export const SUBORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Completed",
  "Cancelled",
  "Rejected",
];
