/**
 * CustomersPage.jsx
 * -----------------
 * Full CRUD for customers.
 */

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
} from "../services/api";

const emptyForm = { name: "", email: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit   = (c)  => { setEditing(c); setForm({ name: c.name, email: c.email }); setErrors({}); setShowModal(true); };

  // ── Basic email format check ────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = { name: form.name.trim(), email: form.email.trim().toLowerCase() };
    try {
      setSaving(true);
      if (editing) {
        await updateCustomer(editing.id, payload);
        toast.success("Customer updated!");
      } else {
        await createCustomer(payload);
        toast.success("Customer created!");
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.name}"? Their orders will also be removed.`)) return;
    try {
      await deleteCustomer(c.id);
      toast.success("Customer deleted.");
      loadCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // ── Avatar initials ─────────────────────────────────────────────────────
  const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarColor = (name) => {
    const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 55%, 35%)`;
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Registered Emails</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Since</div>
          <div className="stat-value" style={{ fontSize: 18, paddingTop: 4 }}>
            {customers.length ? new Date().getFullYear() : "—"}
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage registered customers and their contact info.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Customer</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="loading-spinner" /><p>Loading customers…</p></div>
        ) : customers.length === 0 ? (
          <div className="empty">No customers yet. Click "New Customer" to add one.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>#{c.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: avatarColor(c.name),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {initials(c.name)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{c.email}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Customer" : "New Customer"} onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className={`form-input ${errors.name ? "error" : ""}`} name="name" value={form.name} onChange={handleChange} placeholder="Alice Smith" />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className={`form-input ${errors.email ? "error" : ""}`} name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@example.com" />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
