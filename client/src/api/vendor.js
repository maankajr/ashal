import axiosClient from "./axiosClient.js";

export async function getMyStore() {
  const { data } = await axiosClient.get("/vendor/store");
  return data.data;
}

export async function createStore(payload) {
  const { data } = await axiosClient.post("/vendor/store", payload);
  return data.data;
}

export async function updateStore(payload) {
  const { data } = await axiosClient.patch("/vendor/store", payload);
  return data.data;
}

export async function getVendorProducts() {
  const { data } = await axiosClient.get("/vendor/products");
  return data.data;
}

export async function getVendorProduct(id) {
  const { data } = await axiosClient.get(`/vendor/products/${id}`);
  return data.data;
}

export async function createProduct(payload) {
  const { data } = await axiosClient.post("/vendor/products", payload);
  return data.data;
}

export async function updateProduct(id, payload) {
  const { data } = await axiosClient.patch(`/vendor/products/${id}`, payload);
  return data.data;
}

export async function uploadProductImages(id, files, { replace = false } = {}) {
  const formData = new FormData();
  const list = Array.isArray(files) ? files : [files];

  for (const file of list) {
    if (file) formData.append("images", file);
  }

  if (replace) {
    formData.append("replace", "true");
  }

  const { data } = await axiosClient.post(`/vendor/products/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateProductStock(id, stock) {
  const { data } = await axiosClient.patch(`/vendor/products/${id}/stock`, { stock });
  return data.data;
}

export async function deleteProduct(id) {
  const { data } = await axiosClient.delete(`/vendor/products/${id}`);
  return data.data;
}

export async function getVendorOrders() {
  const { data } = await axiosClient.get("/vendor/orders");
  return data.data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await axiosClient.patch(`/vendor/orders/${id}/status`, { status });
  return data.data;
}

export async function getVendorDashboard() {
  const { data } = await axiosClient.get("/vendor/dashboard");
  return data.data;
}

export const VENDOR_STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Completed",
];

export function getNextVendorStatus(current) {
  const index = VENDOR_STATUS_FLOW.indexOf(current);
  if (index === -1 || index === VENDOR_STATUS_FLOW.length - 1) return null;
  return VENDOR_STATUS_FLOW[index + 1];
}
