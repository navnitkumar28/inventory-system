/**
 * App.js
 * -------
 * Root component: handles routing and renders the sidebar layout shell.
 */

import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";

import ProductsPage  from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage    from "./pages/OrdersPage";

// ── Sidebar navigation icons (inline SVG, no extra library needed) ────────
const IconBox    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconUsers  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;

export default function App() {
  return (
    <div className="app-shell">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          INVENTORY<br />
          <span>&amp; ORDER MGMT</span>
        </div>

        <nav>
          <NavLink to="/products"  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <IconBox />  Products
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <IconUsers /> Customers
          </NavLink>
          <NavLink to="/orders"    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <IconOrders /> Orders
          </NavLink>
        </nav>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="main-content">
        <Routes>
          <Route path="/"          element={<Navigate to="/products" replace />} />
          <Route path="/products"  element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders"    element={<OrdersPage />} />
        </Routes>
      </main>
    </div>
  );
}
