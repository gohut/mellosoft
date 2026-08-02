"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { Upload, X } from "lucide-react";

const categoryOptions = ["mattress", "pillows", "bed frames", "protectors", "accessories"];
const sizeOptions = ["Twin", "Full", "Queen", "King", "Standard"];
const firmnessOptions = ["Soft", "Medium", "Firm"];

export default function AddProductView() {
  const { navigateTo } = useAdmin();
  const [form, setForm] = useState({
    name: "", description: "", category: "mattress", price: "", discountPrice: "",
    sizes: ["Queen"], firmness: ["Medium"], stock: "", warranty: "10 Years",
    trialDays: "100", material: "", specs: "",
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleChip = (key, value) => {
    setForm((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Product saved (mock). Connect to API for persistence.");
  };

  return (
    <div className="admin-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="admin-add-product-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Basic Information</h4>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Mellosoft Classic Mattress" style={inputStyle} required />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Description *</label>
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the product features and benefits..." rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} required />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Category *</label>
                <select value={form.category} onChange={(e) => updateField("category", e.target.value)} style={inputStyle}>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Pricing & Stock</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Base Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="899" style={inputStyle} required />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Discount Price (₹)</label>
                  <input type="number" value={form.discountPrice} onChange={(e) => updateField("discountPrice", e.target.value)} placeholder="799" style={inputStyle} />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Stock Quantity *</label>
                <input type="number" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} placeholder="50" style={inputStyle} required />
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Options</h4>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Available Sizes</label>
                <div style={chipGroupStyle}>
                  {sizeOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleChip("sizes", s)} style={{ ...chipStyle, backgroundColor: form.sizes.includes(s) ? "#1B1F8C" : "#FFFFFF", color: form.sizes.includes(s) ? "#FFFFFF" : "#14151A", borderColor: form.sizes.includes(s) ? "#1B1F8C" : "#E7E7E2" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Firmness Options</label>
                <div style={chipGroupStyle}>
                  {firmnessOptions.map((f) => (
                    <button key={f} type="button" onClick={() => toggleChip("firmness", f)} style={{ ...chipStyle, backgroundColor: form.firmness.includes(f) ? "#1B1F8C" : "#FFFFFF", color: form.firmness.includes(f) ? "#FFFFFF" : "#14151A", borderColor: form.firmness.includes(f) ? "#1B1F8C" : "#E7E7E2" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Product Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Warranty</label>
                  <input value={form.warranty} onChange={(e) => updateField("warranty", e.target.value)} placeholder="10 Years" style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Trial Days</label>
                  <input value={form.trialDays} onChange={(e) => updateField("trialDays", e.target.value)} placeholder="100" style={inputStyle} />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Material</label>
                <input value={form.material} onChange={(e) => updateField("material", e.target.value)} placeholder="e.g. Memory Foam, Organic Cotton" style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Product Specifications</label>
                <textarea value={form.specs} onChange={(e) => updateField("specs", e.target.value)} placeholder='e.g. 10" Height • 3 Foam Layers • Cool-to-the-touch Cover' rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Product Images</h4>
              <div style={{
                border: "2px dashed #E7E7E2",
                borderRadius: "12px",
                padding: "40px 24px",
                textAlign: "center",
                backgroundColor: "#FAFAF7",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1B1F8C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E7E2"; }}
              >
                <Upload size={36} color="#C0C0BA" style={{ marginBottom: "12px" }} />
                <p style={{ fontSize: "14px", color: "#14151A", fontWeight: 600, marginBottom: "4px" }}>
                  Drag and drop images here
                </p>
                <p style={{ fontSize: "13px", color: "#6B6B75" }}>
                  or click to browse (PNG, JPG up to 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button type="button" onClick={() => navigateTo("products")} style={cancelBtnStyle}>
            Cancel
          </button>
          <button type="submit" className="admin-btn-hover" style={saveBtnStyle}>
            Save Product
          </button>
        </div>
      </form>


    </div>
  );
}

const cardStyle = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" };
const cardTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 };
const fieldGroupStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const inputStyle = { height: "42px", padding: "0 14px", border: "1px solid #E7E7E2", borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease", width: "100%" };
const chipGroupStyle = { display: "flex", gap: "8px", flexWrap: "wrap" };
const chipStyle = { height: "36px", padding: "0 16px", border: "1px solid #E7E7E2", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit" };
const cancelBtnStyle = { height: "44px", padding: "0 28px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer" };
const saveBtnStyle = { height: "44px", padding: "0 28px", border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer" };
