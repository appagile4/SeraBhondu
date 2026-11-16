import axios from "axios";

// Strictly read API URL from environment variable NEXT_PUBLIC_API_URL
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.serabondhu.net/api";
export const API_URL = rawApiUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("khojobangla_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("khojobangla_token");
        localStorage.removeItem("khojobangla_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
