import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ashal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
