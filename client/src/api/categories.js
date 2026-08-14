import axiosClient from "./axiosClient.js";

export async function listCategories() {
  const { data } = await axiosClient.get("/categories");
  return data.data;
}
