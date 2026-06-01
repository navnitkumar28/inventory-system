/**
 * api.js
 * ------
 * Centralised Axios instance.
 * All API calls go through this file so the base URL is configured once.
 */

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor ─────────────────────────────────────────────────
// Extract a human-readable error message from FastAPI's error shape:
//   { detail: "…" }  or  { detail: [{ msg: "…" }] }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = "An unexpected error occurred.";

    if (data?.detail) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation errors → join all messages
        message = data.detail.map((e) => e.msg).join("; ");
      }
    }

    return Promise.reject(new Error(message));
  }
);

// ── Products ─────────────────────────────────────────────────────────────
export const getProducts    = ()         => api.get("/products");
export const getProduct     = (id)       => api.get(`/products/${id}`);
export const createProduct  = (data)     => api.post("/products", data);
export const updateProduct  = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct  = (id)       => api.delete(`/products/${id}`);

// ── Customers ────────────────────────────────────────────────────────────
export const getCustomers   = ()         => api.get("/customers");
export const getCustomer    = (id)       => api.get(`/customers/${id}`);
export const createCustomer = (data)     => api.post("/customers", data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id)       => api.delete(`/customers/${id}`);

// ── Orders ───────────────────────────────────────────────────────────────
export const getOrders  = ()     => api.get("/orders");
export const getOrder   = (id)   => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post("/orders", data);

export default api;
