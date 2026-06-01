/**
 * ProductsPage.jsx
 * ----------------
 * Full CRUD for products.
 * State management is local (useState + useEffect).
 * API calls go through services/api.js.
 */

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from "../services/api";

// ── Empty form state ──────────────────────────────────────────────────────
const emptyForm = { name: "", sku: "", price: "", stock: "" };

export default function ProductsPage() {
  const [products, setProducts]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing,  setEditing]      = useState(null);   // product object | null
  const [form,     setForm]         = useState(emptyForm);
  const [errors,   setErrors]       = useState({});
  const [saving,   setSaving]       = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Open modal ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name:  product.name,
      sku:   product.sku,
      price: product.price,
      stock: product.stock,
    });
    setErrors({});
    setShowModal(true);
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())               errs.name  = "Name is required.";
    if (!form.sku.trim())                errs.sku   = "SKU is required.";
    if (!form.price || form.price <= 0)  errs.price = "Price must be greater than 0.";
    if (form.stock === "" || form.stock < 0) errs.stock = "Stock must be 0 or more.";
    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      name:  form.name.trim(),
      sku:   form.sku.trim().toUpperCase(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    };

    try {
      setSaving(true);
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Product updated!");
      } else {
        await createProduct(payload);
        toast.success("Product created!");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted.");
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Input helper ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // ── Badge for stock level ────────────────────────────────────────────────
  const stockBadge = (stock) => {
    if (stock === 0)   return <span className="badge badge-red">Out of stock</span>;
    if (stock <= 10)   return <span className="badge badge-yellow">{stock} low</span>;
    return <span className="badge badge-green">{stock}</span>;
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalProducts   = products.length;
  const outOfStock      = products.filter((p) => p.stock === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value" style={{ color: outOfStock ? "var(--danger)" : "var(--accent)" }}>
            {outOfStock}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value">${totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalogue and stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Product</button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="card">
        {loading ? (
          <div className="loading"><div className="loading-spinner" /><p>Loading products…</p></div>
        ) : products.length === 0 ? (
          <div className="empty">No products yet. Click "New Product" to add one.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{stockBadge(p.stock)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {showModal && (
        <Modal title={editing ? "Edit Product" : "New Product"} onClose={() => setShowModal(false)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className={`form-input ${errors.name ? "error" : ""}`} name="name" value={form.name} onChange={handleChange} placeholder="Laptop Pro" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className={`form-input ${errors.sku ? "error" : ""}`} name="sku" value={form.sku} onChange={handleChange} placeholder="LP-001" />
              {errors.sku && <p className="form-error">{errors.sku}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (USD) *</label>
              <input className={`form-input ${errors.price ? "error" : ""}`} name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} placeholder="999.99" />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className={`form-input ${errors.stock ? "error" : ""}`} name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="50" />
              {errors.stock && <p className="form-error">{errors.stock}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
