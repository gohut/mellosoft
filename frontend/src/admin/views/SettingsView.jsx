"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import { Upload, Save, RotateCcw, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { DEFAULT_SETTINGS, validateSettings } from "../../utils/settingsHelpers";
import { saveImageBlob, getResolvedImageUrlSync } from "../../utils/imageStorage";

export default function SettingsView() {
  const { hasPermission, settings, updateSettings } = useAdmin();

  const [form, setForm] = useState({
    storeName: settings?.store?.name || DEFAULT_SETTINGS.store.name,
    email: settings?.store?.email || DEFAULT_SETTINGS.store.email,
    phone: settings?.store?.phone || DEFAULT_SETTINGS.store.phone,
    gst: settings?.store?.gstNumber || DEFAULT_SETTINGS.store.gstNumber,
    address: settings?.store?.address || DEFAULT_SETTINGS.store.address,
    logo: settings?.website?.logo || DEFAULT_SETTINGS.website.logo,
    banner: settings?.website?.banner || DEFAULT_SETTINGS.website.banner,
    freeShippingAmount: String(settings?.shipping?.freeShippingAmount ?? DEFAULT_SETTINGS.shipping.freeShippingAmount),
    shippingCharge: String(settings?.shipping?.shippingCharge ?? DEFAULT_SETTINGS.shipping.shippingCharge),
    razorpay: settings?.payment?.razorpay ?? DEFAULT_SETTINGS.payment.razorpay,
    stripe: settings?.payment?.stripe ?? DEFAULT_SETTINGS.payment.stripe,
    cod: settings?.payment?.cod ?? DEFAULT_SETTINGS.payment.cod,
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success | error
  const [statusMessage, setStatusMessage] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Sync form when settings change from external updates
  useEffect(() => {
    if (settings) {
      setForm((prev) => {
        // Only update if not dirty to avoid overwriting user edits
        if (isDirty) return prev;
        return {
          storeName: settings.store?.name || DEFAULT_SETTINGS.store.name,
          email: settings.store?.email || DEFAULT_SETTINGS.store.email,
          phone: settings.store?.phone || DEFAULT_SETTINGS.store.phone,
          gst: settings.store?.gstNumber || DEFAULT_SETTINGS.store.gstNumber,
          address: settings.store?.address || DEFAULT_SETTINGS.store.address,
          logo: settings.website?.logo || DEFAULT_SETTINGS.website.logo,
          banner: settings.website?.banner || DEFAULT_SETTINGS.website.banner,
          freeShippingAmount: String(settings.shipping?.freeShippingAmount ?? DEFAULT_SETTINGS.shipping.freeShippingAmount),
          shippingCharge: String(settings.shipping?.shippingCharge ?? DEFAULT_SETTINGS.shipping.shippingCharge),
          razorpay: settings.payment?.razorpay ?? DEFAULT_SETTINGS.payment.razorpay,
          stripe: settings.payment?.stripe ?? DEFAULT_SETTINGS.payment.stripe,
          cod: settings.payment?.cod ?? DEFAULT_SETTINGS.payment.cod,
        };
      });
    }
  }, [settings, isDirty]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (saveStatus !== "idle") {
      setSaveStatus("idle");
      setStatusMessage("");
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [type]: "File size exceeds 5MB limit. Please choose a smaller image."
      }));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        const blobKey = `idb:setting-${type}-${Date.now()}`;
        await saveImageBlob(blobKey, dataUrl);
        updateField(type, blobKey);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error("Image upload failed:", e);
      setErrors((prev) => ({
        ...prev,
        [type]: "Failed to process image file. Please try again."
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const payload = {
      store: {
        name: form.storeName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gstNumber: form.gst.trim(),
        address: form.address.trim()
      },
      website: {
        logo: form.logo || DEFAULT_SETTINGS.website.logo,
        banner: form.banner || ""
      },
      shipping: {
        freeShippingAmount: Number(form.freeShippingAmount) || DEFAULT_SETTINGS.shipping.freeShippingAmount,
        shippingCharge: Number(form.shippingCharge) || DEFAULT_SETTINGS.shipping.shippingCharge
      },
      payment: {
        razorpay: Boolean(form.razorpay),
        stripe: Boolean(form.stripe),
        cod: Boolean(form.cod)
      }
    };

    const validation = validateSettings(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSaveStatus("error");
      setStatusMessage("Please fix the errors in the form before saving.");
      return;
    }

    setSaveStatus("saving");
    setStatusMessage("Saving store settings...");

    setTimeout(() => {
      try {
        const success = updateSettings(payload);
        if (success !== false) {
          setSaveStatus("success");
          setStatusMessage("Store settings saved successfully across the entire site!");
          setIsDirty(false);
          setErrors({});
          setTimeout(() => {
            setSaveStatus("idle");
            setStatusMessage("");
          }, 4000);
        } else {
          setSaveStatus("error");
          setStatusMessage("Unable to save settings. Please try again.");
        }
      } catch (err) {
        console.error("Save settings error:", err);
        setSaveStatus("error");
        setStatusMessage("Unable to save settings. Please try again.");
      }
    }, 300);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default configuration?")) {
      const defaultForm = {
        storeName: DEFAULT_SETTINGS.store.name,
        email: DEFAULT_SETTINGS.store.email,
        phone: DEFAULT_SETTINGS.store.phone,
        gst: DEFAULT_SETTINGS.store.gstNumber,
        address: DEFAULT_SETTINGS.store.address,
        logo: DEFAULT_SETTINGS.website.logo,
        banner: DEFAULT_SETTINGS.website.banner,
        freeShippingAmount: String(DEFAULT_SETTINGS.shipping.freeShippingAmount),
        shippingCharge: String(DEFAULT_SETTINGS.shipping.shippingCharge),
        razorpay: DEFAULT_SETTINGS.payment.razorpay,
        stripe: DEFAULT_SETTINGS.payment.stripe,
        cod: DEFAULT_SETTINGS.payment.cod,
      };
      setForm(defaultForm);
      setIsDirty(true);
      setErrors({});
      setSaveStatus("idle");
      setStatusMessage("");
    }
  };

  const canEdit = hasPermission("settings", "edit");

  return (
    <div className="admin-fade-in" style={{ paddingBottom: "40px" }}>
      {/* Alert / Toast Messages */}
      {!canEdit && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: "10px",
          color: "#92400E",
          fontSize: "14px",
          marginBottom: "16px"
        }}>
          <AlertCircle size={18} color="#D97706" />
          <span><strong>View-Only Mode:</strong> You have permission to view store settings, but saving changes is disabled. Contact your Super Admin to edit.</span>
        </div>
      )}

      {saveStatus === "success" && (
        <div style={successAlertStyle}>
          <CheckCircle2 size={18} color="#16A34A" />
          <span style={{ fontWeight: 600 }}>{statusMessage}</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div style={errorAlertStyle}>
          <AlertCircle size={18} color="#DC2626" />
          <span style={{ fontWeight: 600 }}>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* 1. Store Information */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Store Information</h3>
            <p style={sectionSubtitleStyle}>Manage your business name, contact details, GST and official address shown to customers.</p>
          </div>

          <div className="admin-settings-grid" style={gridTwoColStyle}>
            <Field
              label="Store Name *"
              value={form.storeName}
              onChange={(v) => updateField("storeName", v)}
              error={errors.storeName}
              placeholder="e.g. Mellosoft"
              disabled={!canEdit}
            />
            <Field
              label="Contact Email *"
              type="email"
              value={form.email}
              onChange={(v) => updateField("email", v)}
              error={errors.email}
              placeholder="e.g. admin@mellosoft.in"
              disabled={!canEdit}
            />
            <Field
              label="Customer Phone *"
              value={form.phone}
              onChange={(v) => updateField("phone", v)}
              error={errors.phone}
              placeholder="e.g. +91 98765 43210"
              disabled={!canEdit}
            />
            <Field
              label="GST Number"
              value={form.gst}
              onChange={(v) => updateField("gst", v)}
              error={errors.gst}
              placeholder="e.g. 07AABCM1234A1Z5"
              disabled={!canEdit}
            />
          </div>

          <div style={{ marginTop: "18px" }}>
            <Field
              label="Registered Store Address *"
              value={form.address}
              onChange={(v) => updateField("address", v)}
              error={errors.address}
              placeholder="Full official business address"
              isTextarea
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* 2. Website & Branding */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Website Branding</h3>
            <p style={sectionSubtitleStyle}>Upload your brand logo and global website banner.</p>
          </div>

          <div className="admin-settings-grid" style={gridTwoColStyle}>
            {/* Logo Upload Zone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={fieldLabelStyle}>Store Logo</label>
              
              <div style={previewBoxStyle}>
                <div style={logoPreviewInnerStyle}>
                  <img
                    src={getResolvedImageUrlSync(form.logo, "/asset/logo.png")}
                    alt="Logo Preview"
                    style={{ maxHeight: "46px", maxWidth: "100%", objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
                  />
                </div>

                {canEdit && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      style={uploadActionBtnStyle}
                    >
                      <Upload size={14} />
                      {form.logo && form.logo !== DEFAULT_SETTINGS.website.logo ? "Change Logo" : "Upload Logo"}
                    </button>

                    {form.logo && form.logo !== DEFAULT_SETTINGS.website.logo && (
                      <button
                        type="button"
                        onClick={() => updateField("logo", DEFAULT_SETTINGS.website.logo)}
                        style={removeActionBtnStyle}
                        title="Reset to default Mellosoft logo"
                      >
                        <Trash2 size={14} />
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/png, image/svg+xml, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "logo");
                  e.target.value = "";
                }}
              />
              <span style={helperTextStyle}>Recommended format: Transparent PNG or SVG (height ~40px). Max 5MB.</span>
              {errors.logo && <span style={errorTextStyle}>{errors.logo}</span>}
            </div>

            {/* Banner Upload Zone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={fieldLabelStyle}>Default Website Banner</label>
              
              <div style={previewBoxStyle}>
                {form.banner ? (
                  <div style={bannerPreviewInnerStyle}>
                    <img
                      src={getResolvedImageUrlSync(form.banner, "/asset/img2.jpg")}
                      alt="Banner Preview"
                      style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  </div>
                ) : (
                  <div style={bannerPlaceholderStyle}>
                    <ImageIcon size={24} color="#9CA3AF" />
                    <span style={{ fontSize: "12px", color: "#6B6B75" }}>No custom global banner uploaded</span>
                  </div>
                )}

                {canEdit && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      style={uploadActionBtnStyle}
                    >
                      <Upload size={14} />
                      {form.banner ? "Change Banner" : "Upload Banner"}
                    </button>

                    {form.banner && (
                      <button
                        type="button"
                        onClick={() => updateField("banner", "")}
                        style={removeActionBtnStyle}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "banner");
                  e.target.value = "";
                }}
              />
              <span style={helperTextStyle}>Recommended: JPG or PNG (1920×600 px). Max 5MB.</span>
              {errors.banner && <span style={errorTextStyle}>{errors.banner}</span>}
            </div>
          </div>
        </div>

        {/* 3. Shipping Configuration */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Shipping Configuration</h3>
            <p style={sectionSubtitleStyle}>Set the delivery charges and free shipping order threshold used at checkout.</p>
          </div>

          <div className="admin-settings-grid" style={gridTwoColStyle}>
            <Field
              label="Free Shipping Threshold (₹)"
              type="number"
              value={form.freeShippingAmount}
              onChange={(v) => updateField("freeShippingAmount", v)}
              error={errors.freeShippingAmount}
              placeholder="e.g. 5000"
              disabled={!canEdit}
            />
            <Field
              label="Standard Shipping Charge (₹)"
              type="number"
              value={form.shippingCharge}
              onChange={(v) => updateField("shippingCharge", v)}
              error={errors.shippingCharge}
              placeholder="e.g. 150"
              disabled={!canEdit}
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <span style={helperTextStyle}>
              💡 Orders equal to or above ₹{Number(form.freeShippingAmount || 0).toLocaleString("en-IN")} will automatically get <strong>FREE SHIPPING</strong> at checkout.
            </span>
          </div>
        </div>

        {/* 4. Payment Methods */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Payment Gateways & Methods</h3>
            <p style={sectionSubtitleStyle}>Enable or disable customer payment options available at checkout.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ToggleRow
              label="UPI & Net Banking (Razorpay / Instant VPA)"
              description="Accept payments via Google Pay, PhonePe, Paytm, BHIM and net banking"
              checked={form.razorpay}
              onChange={(v) => updateField("razorpay", v)}
              disabled={!canEdit}
            />
            <ToggleRow
              label="International Card Processing (Stripe)"
              description="Accept international Visa, Mastercard and American Express cards"
              checked={form.stripe}
              onChange={(v) => updateField("stripe", v)}
              disabled={!canEdit}
            />
            <ToggleRow
              label="Cash on Delivery (COD)"
              description="Allow customers to pay via Cash or doorstep UPI QR on delivery"
              checked={form.cod}
              onChange={(v) => updateField("cod", v)}
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {hasPermission("settings", "edit") && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
            {isDirty && (
              <span style={{ fontSize: "13px", color: "#D97706", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                ● You have unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              style={resetBtnStyle}
              className="admin-btn-hover"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={saveStatus === "saving"}
              className="admin-btn-hover"
              style={{
                ...saveBtnStyle,
                opacity: saveStatus === "saving" ? 0.7 : 1,
                cursor: saveStatus === "saving" ? "not-allowed" : "pointer"
              }}
            >
              <Save size={16} />
              {saveStatus === "saving" ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </form>

      <style>{`
        @media (max-width: 768px) {
          .admin-settings-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", isTextarea = false, placeholder = "", error = "", disabled = false }) {
  const Component = isTextarea ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", opacity: disabled ? 0.8 : 1 }}>
      <label style={fieldLabelStyle}>{label}</label>
      <Component
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={isTextarea ? 3 : undefined}
        style={{
          height: isTextarea ? "auto" : "42px",
          padding: isTextarea ? "12px 14px" : "0 14px",
          border: error ? "1.5px solid #DC2626" : "1px solid #E7E7E2",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#14151A",
          backgroundColor: disabled ? "#F7F7F2" : "#FFFFFF",
          cursor: disabled ? "not-allowed" : "text",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          resize: isTextarea ? "vertical" : "none",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => { if (!error && !disabled) e.target.style.borderColor = "#1B1F8C"; }}
        onBlur={(e) => { if (!error && !disabled) e.target.style.borderColor = "#E7E7E2"; }}
      />
      {error && <span style={errorTextStyle}>{error}</span>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
      backgroundColor: "#FAFAF7", borderRadius: "10px", border: "1px solid #F0F0EC", gap: "16px",
      opacity: disabled ? 0.8 : 1
    }}>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#14151A", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px", margin: "2px 0 0 0" }}>{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: "48px", height: "26px", borderRadius: "999px", border: "none",
          backgroundColor: checked ? "#1B1F8C" : "#E7E7E2", cursor: disabled ? "not-allowed" : "pointer",
          position: "relative", transition: "background-color 0.2s ease", flexShrink: 0,
        }}
        aria-label={`Toggle ${label}`}
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

// ── STYLES ──────────────────────────────────────────────────────────────────
const sectionStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const sectionHeaderStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginBottom: "4px"
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#14151A",
  margin: 0
};

const sectionSubtitleStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  margin: 0
};

const gridTwoColStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px"
};

const fieldLabelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#6B6B75"
};

const helperTextStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

const errorTextStyle = {
  fontSize: "12px",
  color: "#DC2626",
  fontWeight: 500
};

const previewBoxStyle = {
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  padding: "12px 16px",
  backgroundColor: "#FAFAF7",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  minHeight: "60px"
};

const logoPreviewInnerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  minHeight: "44px"
};

const bannerPreviewInnerStyle = {
  flex: 1,
  minWidth: "140px"
};

const bannerPlaceholderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 0"
};

const uploadActionBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "36px",
  padding: "0 14px",
  borderRadius: "8px",
  border: "1px solid #1B1F8C",
  backgroundColor: "#EEF2FF",
  color: "#1B1F8C",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer"
};

const removeActionBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "36px",
  padding: "0 12px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF",
  color: "#DC2626",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer"
};

const successAlertStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 16px",
  backgroundColor: "#F0FDF4",
  border: "1px solid #BBF7D0",
  borderRadius: "10px",
  color: "#15803D",
  fontSize: "14px",
  marginBottom: "16px"
};

const errorAlertStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 16px",
  backgroundColor: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "10px",
  color: "#B91C1C",
  fontSize: "14px",
  marginBottom: "16px"
};

const resetBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "44px",
  padding: "0 20px",
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  color: "#14151A",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const saveBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "44px",
  padding: "0 24px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};
