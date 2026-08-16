import axiosClient from "./axiosClient.js";

export async function getStoreDetails(slugOrId, params = {}) {
  const { data } = await axiosClient.get(`/stores/${slugOrId}`, { params });
  return data.data;
}
