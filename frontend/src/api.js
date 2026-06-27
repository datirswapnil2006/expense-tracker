// src/api.js
//
// Thin wrapper around fetch. Every transaction route on the backend gets
// a matching function here, so components never call fetch() directly.

const BASE_URL = "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---- Auth ----
export const signup = (email, password, name) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) });

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

// ---- Transactions ----
export const fetchTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/transactions${query ? `?${query}` : ""}`);
};

export const createTransaction = (tx) =>
  request("/transactions", { method: "POST", body: JSON.stringify(tx) });

export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: "DELETE" });

export const fetchSummary = () => request("/transactions/summary");

export const fetchByCategory = (type = "expense") =>
  request(`/transactions/by-category?type=${type}`);

export const fetchTrend = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/transactions/trend${query ? `?${query}` : ""}`);
};
