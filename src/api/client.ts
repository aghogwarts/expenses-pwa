import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const auth = {
  login: (password: string) =>
    api.post<{ access_token: string }>("/api/auth/login", { password }),
};

export const transactions = {
  list: (params?: {
    category?: string;
    wallet_id?: number;
    from?: string;
    to?: string;
  }) => api.get("/api/transactions", { params }),
  create: (data: {
    amount: number;
    description: string;
    category: string;
    wallet_id: number;
    payment_method: string;
    date: string;
  }) => api.post("/api/transactions", data),
  delete: (id: number) => api.delete(`/api/transactions/${id}`),
};

export const wallets = {
  list: () => api.get("/api/wallets"),
  cycles: () => api.get("/api/wallets/cycles"),
  fund: (
    wallet_id: number,
    data: { amount: number; date: string; note?: string },
  ) => api.post(`/api/wallets/${wallet_id}/fund`, data),
};

export const dashboard = {
  get: (month?: string) => api.get("/api/dashboard", { params: { month } }),
};

export const exportData = {
  csv: (from?: string, to?: string) =>
    api.get("/api/export/csv", { params: { from, to }, responseType: "blob" }),
};
