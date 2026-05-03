import API_BASE_URL from "@/config/api";
import axios from "axios";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEV_DELAY_MS = 3000;

httpClient.interceptors.response.use(
  (response) =>
    import.meta.env.DEV
      ? new Promise((resolve) => setTimeout(() => resolve(response), DEV_DELAY_MS))
      : response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default httpClient;
