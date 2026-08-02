"use client";

import React, { useState } from "react";
import { Upload, Save, RotateCcw } from "lucide-react";

export default function SettingsView() {
  const [form, setForm] = useState({
    storeName: "Mellosoft",
    email: "admin@mellosoft.in",
    phone: "+91 98765 43210",
    gst: "07AABCM1234A1Z5",
    address: "42, MG Road, Bengaluru, Karnataka 560001",
    freeShippingAmount: "150",
    shippingCharge: "30",
    razorpay: true,
    stripe: false,
    cod: true,
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved (mock). Connect to API for persistence.");
  };

  const handleReset = () => {
    setForm({
      storeName: "Mellosoft", email: "admin@mellosoft.in", phone: "+91 98765 43210",
      gst: "07AABCM1234A1Z5", address: "42, MG Road, Bengaluru, Karnataka 560001",
      freeShippingAmount: "150", shippingCharge: "30", razorpay: true, stripe: false, cod: true,
    });
  };

  return (
    <div className="admin-fade-in">
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Store Information */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Store Information</h3>
          <div className="admin-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <Field label="Store Name" value={form.storeName} onChange={(v) => updateField("storeName", v)} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <Field label="GST Number" value={form.gst} onChange={(v) => updateField("gst", v)} />
          </div>
          <div style={{ marginTop: "18px" }}>
            <Field label="Address" value={form.address} onChange={(v) => updateField("address", v)} isTextarea />
          </div>
        </div>

        {/* Website */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Website</h3>
          <div className="admin-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <UploadZone label="Logo Upload" accept="PNG, SVG" />
            <UploadZone label="Banner Upload" accept="JPG, PNG (1920×600)" />
          </div>
        </div>

        {/* Shipping */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Shipping</h3>
          <div className="admin-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <Field label="Free Shipping Threshold (₹)" type="number" value={form.freeShippingAmount} onChange={(v) => updateField("freeShippingAmount", v)} />
            <Field label="Shipping Charge (₹)" type="number" value={form.shippingCharge} onChange={(v) => updateField("shippingCharge", v)} />
          </div>
        </div>

        {/* Payment */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Payment Methods</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ToggleRow label="Razorpay" description="Accept UPI, Cards, Net Banking" checked={form.razorpay} onChange={(v) => updateField("razorpay", v)} />
            <ToggleRow label="Stripe" description="International card payments" checked={form.stripe} onChange={(v) => updateField("stripe", v)} />
            <ToggleRow label="Cash on Delivery" description="Pay when product is delivered" checked={form.cod} onChange={(v) => updateField("cod", v)} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button type="button" onClick={handleReset} style={resetBtnStyle}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="submit" className="admin-btn-hover" style={saveBtnStyle}>
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </form>


    </div>
  );
}

function Field({ label, value, onChange, type = "text", isTextarea = false }) {
  const Component = isTextarea ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#6B6B75" }}>{label}</label>
      <Component
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={isTextarea ? 3 : undefined}
        style={{
          height: isTextarea ? "auto" : "42px",
          padding: isTextarea ? "12px 14px" : "0 14px",
          border: "1px solid #E7E7E2",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#14151A",
          backgroundColor: "#FFFFFF",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          resize: isTextarea ? "vertical" : "none",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#1B1F8C"; }}
        onBlur={(e) => { e.target.style.borderColor = "#E7E7E2"; }}
      />
    </div>
  );
}

function UploadZone({ label, accept }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#6B6B75" }}>{label}</label>
      <div style={{
        border: "2px dashed #E7E7E2", borderRadius: "10px", padding: "28px 16px",
        textAlign: "center", backgroundColor: "#FAFAF7", cursor: "pointer", transition: "border-color 0.2s ease",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1B1F8C"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E7E2"; }}
      >
        <Upload size={24} color="#C0C0BA" style={{ marginBottom: "8px" }} />
        <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>Click to upload ({accept})</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
      backgroundColor: "#FAFAF7", borderRadius: "10px", border: "1px solid #F0F0EC",
    }}>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#14151A", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px" }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: "48px", height: "26px", borderRadius: "999px", border: "none",
          backgroundColor: checked ? "#1B1F8C" : "#E7E7E2", cursor: "pointer",
          position: "relative", transition: "background-color 0.2s ease", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: "3px", left: checked ? "25px" : "3px",
          width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "left 0.2s ease",
        }} />
      </button>
    </div>
  );
}

const sectionStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "24px",
};
const sectionTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: "0 0 18px 0" };
const resetBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 24px",
  border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A",
  fontSize: "14px", fontWeight: 600, cursor: "pointer",
};
const saveBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 24px",
  border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF",
  fontSize: "14px", fontWeight: 600, cursor: "pointer",
};
