import axiosClient from "./axiosClient.js";

export async function listProducts(params = {}) {
  const { data } = await axiosClient.get("/products", { params });
  return { items: data.data, meta: data.meta };
}

export async function getProduct(slugOrId) {
  const { data } = await axiosClient.get(`/products/${slugOrId}`);
  return data.data;
}

export async function getStoreDetails(slugOrId, params = {}) {
  const { data } = await axiosClient.get(`/stores/${slugOrId}`, { params });
  return data.data;
}

export function mapProductForCard(product) {
  return {
    id: product._id,
    _id: product._id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    rating: product.ratingAvg ?? 0,
    category: product.categoryId?.name || "",
    stock: product.stock ?? 0,
    storeId: product.storeId?.slug || product.storeId?._id,
    storeName: product.storeId?.name || "Ashal Store",
    image: product.images?.[0]?.url || "",
    description: product.description || "",
  };
}
