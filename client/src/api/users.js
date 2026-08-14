import axiosClient from "./axiosClient.js";

export async function getMyProfile() {
  const { data } = await axiosClient.get("/users/me");
  return data.data;
}

export async function updateMyProfile(payload) {
  const { data } = await axiosClient.patch("/users/me", payload);
  return data.data;
}
