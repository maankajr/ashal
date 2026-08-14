import axiosClient from "./axiosClient.js";

export function parseApiError(error) {
  const apiError = error.response?.data?.error;

  if (!apiError) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return {
        message:
          "Cannot reach the server. Make sure the backend is running on http://localhost:5000 and try again.",
        fieldErrors: {},
      };
    }

    return {
      message: error.message || "Something went wrong. Please try again.",
      fieldErrors: {},
    };
  }

  const fieldErrors = {};
  for (const detail of apiError.details || []) {
    if (detail?.field) {
      fieldErrors[detail.field] = detail.message;
    }
  }

  return {
    message: apiError.message,
    fieldErrors,
    code: apiError.code,
  };
}

export async function register(userData) {
  const { data } = await axiosClient.post("/auth/register", userData);
  return data.data;
}

export async function registerVendor(userData) {
  const { data } = await axiosClient.post("/auth/register/vendor", userData);
  return data.data;
}

export async function login(credentials) {
  const { data } = await axiosClient.post("/auth/login", credentials);
  return data.data;
}
