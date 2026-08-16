import axiosClient from "./axiosClient.js";

export async function submitContact(payload) {
  const { data } = await axiosClient.post("/contact", payload);
  return data.data;
}
