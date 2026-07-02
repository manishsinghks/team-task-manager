import axios from "axios";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
// Normalize so the base always ends in exactly one "/api", regardless of how
// the env var is set (with or without a trailing slash or "/api" suffix).
const API_URL = `${RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      const base = API_URL.replace(/\/api$/, "");
      return Promise.reject(
        new Error(
          `Cannot reach API at ${API_URL}. Start the backend (npm run dev in /backend) and ensure it is running on ${base}.`,
        ),
      );
    }
    const message = error.response?.data?.message ?? error.message ?? "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
