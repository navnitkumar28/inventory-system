/**
 * OrdersPage.jsx
 * --------------
 * Create new orders and view the full order history.
 * The "place order" form dynamically loads customers and products
 * from the API so the user can select from dropdowns.
 */

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { getOrders, createOrder, getCustomers, getProducts } from "../services/api";

const emptyForm = { customer_id: "", product_id: "", quantity: "" };

export default function OrdersPage() {
  const [orders,    setOrders]    = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);

  // ── Selected product details (for stock hint) ───────────────────────────
  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id, 10));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [o, c, p] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(o.data);
      setCustomers(c.data);
      setProducts(p.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setShowModal(true); };

  const validate = () => {
    const errs = {};
    if (!form.customer_id)                         errs.customer_id = "Select a customer.";
    if (!form.product_id)                          errs.product_id  = "Select a product.";
    if (!form.quantity || parseInt(form.quantity) < 1) errs.quantity = "Quantity must be at least 1.";
    if (selectedProduct && parseInt(form.quantity) > selectedProduct.stock)
      errs.quantity = `Only ${selectedProduct.stock} in stock.`;
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      product_id:  parseInt(form.product_id,  10),
      quantity:    parseInt(form.quantity,     10),
    };

    try {
      setSaving(true);
      await createOrder(payload);
      toast.success("Order placed successfully!");
      setShowModal(false);
      loadData(); // refresh orders + product stock
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // ── Format date ─────────────────────────────────────────────────────────
  const fmtDate = (iso) => new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short",
  });

  const totalRevenue = orders.reduce((s, o) => s + o.product.price * o.quantity, 0);

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unique Customers</div>
          <div className="stat-value">{new Set(orders.map((o) => o.customer.id)).size}</div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Place new orders and review order history.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openCreate}
          disabled={customers.length === 0 || products.length === 0}
          title={customers.length === 0 || products.length === 0 ? "Add customers and products first" : ""}
        >
          + Place Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="loading-spinner" /><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet. Click "Place Order" to create one.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.customer.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.product.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{o.product.sku}</div>
                    </td>
                    <td><span className="badge badge-green">× {o.quantity}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                      ${(o.product.price * o.quantity).toFixed(2)}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Place New Order" onClose={() => setShowModal(false)}>
          {/* Customer select */}
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className={`form-input ${errors.customer_id ? "error" : ""}`}
              name="customer_id" value={form.customer_id} onChange={handleChange}
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            {errors.customer_id && <p className="form-error">{errors.customer_id}</p>}
          </div>

          {/* Product select */}
          <div className="form-group">
            <label className="form-label">Product *</label>
            <select
              className={`form-input ${errors.product_id ? "error" : ""}`}
              name="product_id" value={form.product_id} onChange={handleChange}
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} — ${p.price.toFixed(2)} {p.stock === 0 ? "(out of stock)" : `(${p.stock} in stock)`}
                </option>
              ))}
            </select>
            {errors.product_id && <p className="form-error">{errors.product_id}</p>}
          </div>

          {/* Stock hint */}
          {selectedProduct && (
            <div style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 18, fontSize: 13,
            }}>
              <span style={{ color: "var(--text-muted)" }}>Available stock: </span>
              <strong style={{ color: selectedProduct.stock > 0 ? "var(--accent)" : "var(--danger)" }}>
                {selectedProduct.stock}
              </strong>
              <span style={{ color: "var(--text-muted)" }}>  ·  Unit price: </span>
              <strong>${selectedProduct.price.toFixed(2)}</strong>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              className={`form-input ${errors.quantity ? "error" : ""}`}
              name="quantity" type="number" min="1"
              max={selectedProduct?.stock || undefined}
              value={form.quantity} onChange={handleChange}
              placeholder="1"
            />
            {errors.quantity && <p className="form-error">{errors.quantity}</p>}
          </div>

          {/* Order total preview */}
          {selectedProduct && form.quantity > 0 && !errors.quantity && (
            <div style={{
              background: "var(--accent-dim)", border: "1px solid var(--accent)",
              borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 18, fontSize: 14,
              color: "var(--accent)", fontWeight: 600,
            }}>
              Order Total: ${(selectedProduct.price * parseInt(form.quantity || 0)).toFixed(2)}
            </div>
          )}

          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Placing…" : "Place Order"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
