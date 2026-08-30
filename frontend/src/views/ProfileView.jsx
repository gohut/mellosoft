"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { LogOut, Edit3, X, CheckCircle, MapPin, Plus, Trash2, Star, User, Loader2 } from "lucide-react";
import { ProfileSkeleton } from "../components/skeleton";

// Phone validation: accepts Indian formats like 9876543210, +91 9876543210, +919876543210
const isValidPhone = (phone) => {
  const cleaned = (phone || "").replace(/\s+/g, "");
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
};

const EMPTY_ADDRESS_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false
};

export default function ProfileView() {
  const { currentCustomer, isAuthenticated, loading, setIntendedView, logout, updateProfile, addAddress, editAddress, deleteAddress, setDefaultAddress } = useCustomerAuth();
  const { customerOrders, navigateTo, setAuthModal } = useStore();

  // --- Personal Details State ---
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({ name: "", phone: "" });
  const [detailsErrors, setDetailsErrors] = useState({});
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState(null); // { type: 'success'|'error', msg }

  // --- Address State ---
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const customerName = currentCustomer?.name || "Customer";
  const customerEmail = currentCustomer?.email || "";
  const customerPhone = currentCustomer?.phone || "";
  const avatarChar = currentCustomer?.avatar || (customerName ? customerName.charAt(0).toUpperCase() : "U");
  const savedAddresses = Array.isArray(currentCustomer?.savedAddresses) ? currentCustomer.savedAddresses : [];

  const displayOrders = Array.isArray(customerOrders) ? customerOrders : [];

  const handleLogout = () => {
    logout();
    navigateTo("login");
  };

  // Personal Details Handlers
  const handleEditDetails = () => {
    setDetailsForm({ name: customerName, phone: customerPhone });
    setDetailsErrors({});
    setDetailsFeedback(null);
    setEditingDetails(true);
  };

  const handleCancelDetails = () => {
    setEditingDetails(false);
    setDetailsErrors({});
    setDetailsFeedback(null);
  };

  const handleSaveDetails = async () => {
    const errors = {};
    const name = (detailsForm.name || "").trim();
    const phone = (detailsForm.phone || "").trim();

    if (!name) errors.name = "Full name is required.";
    if (!phone) errors.phone = "Phone number is required.";
    else if (!isValidPhone(phone)) errors.phone = "Enter a valid Indian phone number (e.g. +91 98765 43210).";

    if (Object.keys(errors).length > 0) {
      setDetailsErrors(errors);
      return;
    }

    setDetailsSaving(true);
    setDetailsErrors({});
    try {
      const result = await updateProfile({ name, phone, avatar: name.charAt(0).toUpperCase() });
      if (result?.success) {
        setDetailsFeedback({ type: "success", msg: "Profile updated successfully." });
        setEditingDetails(false);
        setTimeout(() => setDetailsFeedback(null), 3500);
      } else {
        setDetailsFeedback({ type: "error", msg: result?.error || "Unable to update profile. Please try again." });
      }
    } catch {
      setDetailsFeedback({ type: "error", msg: "Unable to update profile. Please try again." });
    } finally {
      setDetailsSaving(false);
    }
  };

  // Address Handlers
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ ...EMPTY_ADDRESS_FORM, fullName: customerName, phone: customerPhone });
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({ ...EMPTY_ADDRESS_FORM, ...addr });
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressErrors({});
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!(addressForm.fullName || "").trim()) errors.fullName = "Full name is required.";
    if (!(addressForm.phone || "").trim()) errors.phone = "Phone is required.";
    else if (!isValidPhone(addressForm.phone)) errors.phone = "Enter a valid Indian phone number.";
    if (!(addressForm.addressLine1 || "").trim()) errors.addressLine1 = "Address Line 1 is required.";
    if (!(addressForm.city || "").trim()) errors.city = "City is required.";
    if (!(addressForm.state || "").trim()) errors.state = "State is required.";
    if (!(addressForm.postalCode || "").trim()) errors.postalCode = "PIN Code is required.";
    return errors;
  };

  const handleSaveAddress = async () => {
    const errors = validateAddressForm();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    setAddressSaving(true);
    setAddressErrors({});
    try {
      let result;
      if (editingAddressId) {
        result = await editAddress(editingAddressId, addressForm);
      } else {
        result = await addAddress(addressForm);
      }
      if (result?.success) {
        setShowAddressForm(false);
        setEditingAddressId(null);
      } else {
        setAddressErrors({ submit: result?.error || "Unable to save address. Please try again." });
      }
    } catch {
      setAddressErrors({ submit: "Unable to save address. Please try again." });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
    setDeleteConfirmId(null);
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
  };

  // State 1: LOADING STATE — show skeleton instead of spinner
  if (loading) {
    return (
      <div style={containerStyle} className="profile-page" aria-busy="true">
        <ProfileSkeleton />
      </div>
    );
  }

  // State 2: UNAUTHENTICATED STATE
  if (!isAuthenticated || !currentCustomer) {
    return (
      <div style={containerStyle} className="profile-page">
        <div style={{
          maxWidth: "520px",
          margin: "40px auto 80px",
          backgroundColor: "#FAFAF7",
          border: "1px solid #E7E7E2",
          borderRadius: "16px",
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          boxSizing: "border-box"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(27,31,140,0.08)",
            color: "#1B1F8C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <User size={28} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#14151A", margin: "0 0 8px" }}>Sign In to Your Account</h2>
          <p style={{ fontSize: "14px", color: "#6B6B75", lineHeight: 1.6, margin: "0 0 24px" }}>
            Sign in to view your profile details, manage saved delivery addresses, and track your Mellosoft orders.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => {
                if (setIntendedView) setIntendedView("profile");
                if (setAuthModal) setAuthModal("login");
              }}
              style={{
                width: "100%",
                padding: "13px 20px",
                backgroundColor: "#1B1F8C",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "14.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover-lift"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                if (setIntendedView) setIntendedView("profile");
                if (setAuthModal) setAuthModal("signup");
              }}
              style={{
                width: "100%",
                padding: "12px 20px",
                backgroundColor: "#FFFFFF",
                color: "#1B1F8C",
                border: "1.5px solid #1B1F8C",
                borderRadius: "10px",
                fontSize: "14.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover-lift"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: AUTHENTICATED PROFILE VIEW
  return (
    <div style={containerStyle} className="profile-page">
      <style>{`
        .profile-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .profile-card, .profile-header-card, .panel-card,
        .sleep-profile, .order-history, .order-card,
        .coach-box, .profile-content {
          min-width: 0;
          box-sizing: border-box;
        }
        .profile-user-info, .profile-info, .order-info, .order-product-info {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .profile-user-name, .profile-user-meta { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
        .order-product-name { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
        .order-status-badge { flex-shrink: 0; white-space: nowrap; }
        .preference-options { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
        .addr-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .profile-detail-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .profile-form-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #E7E7E2; border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #14151A; background: #FAFAF7;
          outline: none; box-sizing: border-box; transition: border-color 0.2s;
        }
        .profile-form-input:focus { border-color: #1B1F8C; background: #fff; }
        .profile-form-input.error { border-color: #DC2626; }
        .addr-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; min-width: 0; }
        .addr-form-grid .full-col { grid-column: 1 / -1; }
        @media (max-width: 768px) {
          .profile-page { padding: 24px 16px 60px 16px !important; }
          .profile-header-card { padding: 20px !important; margin-bottom: 24px !important; gap: 16px !important; }
          .profile-content {
            display: grid !important; grid-template-columns: 1fr !important;
            gap: 20px !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important;
          }
          .sleep-profile, .order-history, .panel-card, .order-card, .coach-box {
            width: 100% !important; max-width: 100% !important; min-width: 0 !important;
          }
          .panel-card { padding: 20px !important; }
          .order-card { padding: 16px !important; }
          .order-card-header {
            display: flex !important; justify-content: space-between !important;
            align-items: flex-start !important; flex-wrap: wrap !important; gap: 8px !important; min-width: 0 !important;
          }
          .order-product-row {
            display: flex !important; justify-content: space-between !important;
            align-items: flex-start !important; gap: 12px !important; min-width: 0 !important;
          }
          .addr-form-grid { grid-template-columns: 1fr !important; }
          .addr-form-grid .full-col { grid-column: 1 !important; }
        }
        @media (max-width: 390px) {
          .profile-page { padding: 16px 12px 48px 12px !important; }
          .profile-header-card { padding: 16px !important; gap: 14px !important; }
          .panel-card, .order-card { padding: 16px !important; }
          .profile-avatar { width: 60px !important; height: 60px !important; font-size: 28px !important; flex-shrink: 0 !important; }
          .profile-user-name { font-size: 20px !important; }
          .profile-user-meta { font-size: 12.5px !important; }
        }
      `}</style>

      {/* Profile Header Card */}
      <div style={headerCardStyle} className="profile-card profile-header-card">
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", minWidth: 0, flex: 1 }}>
          <div style={avatarStyle} className="profile-avatar">{avatarChar}</div>
          <div style={headerInfoStyle} className="profile-info profile-user-info">
            <h2 style={userNameStyle} className="profile-user-name">{customerName}</h2>
            <p style={userMetaStyle} className="profile-user-meta">{customerEmail} &bull; Mellosoft Sleep Member since 2026</p>
            <div style={streakBadgeStyle}>
              <span style={{ fontSize: "14px" }}>&#127942;</span>
              <span style={streakTextStyle}>8-Night Perfect Sleep Streak</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle} className="hover-lift">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div style={gridStyle} className="profile-content">

        {/* Left Column: Personal Details + Saved Addresses */}
        <div style={leftColStyle} className="sleep-profile">

          {/* Personal Details */}
          <div style={panelCardStyle} className="panel-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={panelTitleStyle}>Personal Details</h3>
              {!editingDetails && (
                <button onClick={handleEditDetails} style={actionBtnStyle} className="hover-lift">
                  <Edit3 size={14} />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            {detailsFeedback && (
              <div style={detailsFeedback.type === "success" ? successMsgStyle : errorMsgStyle}>
                {detailsFeedback.msg}
              </div>
            )}

            {!editingDetails ? (
              /* View Mode */
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div className="profile-detail-field">
                  <span style={fieldLabelStyle}>Full Name</span>
                  <span style={fieldValueStyle}>{customerName}</span>
                </div>
                <div className="profile-detail-field">
                  <span style={fieldLabelStyle}>Email Address</span>
                  <span style={fieldValueStyle}>{customerEmail}</span>
                </div>
                <div className="profile-detail-field">
                  <span style={fieldLabelStyle}>Phone Number</span>
                  <span style={fieldValueStyle}>
                    {customerPhone ? (
                      customerPhone
                    ) : (
                      <span style={{ color: "#6B6B75", fontStyle: "italic", fontWeight: 500 }}>
                        Not added
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="profile-detail-field">
                  <label style={fieldLabelStyle}>Full Name</label>
                  <input
                    className={`profile-form-input${detailsErrors.name ? " error" : ""}`}
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                  {detailsErrors.name && <span style={inlineErrorStyle}>{detailsErrors.name}</span>}
                </div>
                <div className="profile-detail-field">
                  <label style={fieldLabelStyle}>Email Address</label>
                  <input
                    className="profile-form-input"
                    value={customerEmail}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <span style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>Email cannot be changed after registration.</span>
                </div>
                <div className="profile-detail-field">
                  <label style={fieldLabelStyle}>Phone Number</label>
                  <input
                    className={`profile-form-input${detailsErrors.phone ? " error" : ""}`}
                    value={detailsForm.phone}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                  {detailsErrors.phone && <span style={inlineErrorStyle}>{detailsErrors.phone}</span>}
                </div>
                {detailsFeedback?.type === "error" && (
                  <div style={errorMsgStyle}>{detailsFeedback.msg}</div>
                )}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                  <button onClick={handleCancelDetails} style={cancelBtnStyle} className="hover-lift">Cancel</button>
                  <button onClick={handleSaveDetails} disabled={detailsSaving} style={saveBtnStyle} className="hover-lift">
                    {detailsSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div style={panelCardStyle} className="panel-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={panelTitleStyle}>Saved Addresses</h3>
              {!showAddressForm && (
                <button onClick={openAddAddress} style={addAddrBtnStyle} className="hover-lift">
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Existing address cards */}
            {!showAddressForm && savedAddresses.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#6B6B75" }}>
                <MapPin size={32} style={{ margin: "0 auto 12px", display: "block", color: "#E7E7E2" }} />
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#6B6B75", margin: "0 0 6px" }}>No saved addresses yet</p>
                <p style={{ fontSize: "13px", margin: 0 }}>Add an address to speed up checkout.</p>
              </div>
            )}

            {!showAddressForm && savedAddresses.map((addr) => (
              <div key={addr.id} style={addrCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={addrLabelStyle}>{(addr.label || "Home").toUpperCase()}</span>
                    {addr.isDefault && <span style={defaultBadgeStyle}>Default</span>}
                  </div>
                </div>
                <p style={addrTextStyle}>
                  {addr.fullName || customerName}<br />
                  {addr.addressLine1 || ""}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}{addr.landmark ? ` - ${addr.landmark}` : ""}<br />
                  {addr.city || ""}, {addr.state || ""} - {addr.postalCode || addr.pincode || ""}<br />
                  {addr.country || "India"}<br />
                  Phone: {addr.phone || customerPhone || "Not added"}
                </p>

                {/* Delete confirmation inline */}
                {deleteConfirmId === addr.id ? (
                  <div style={deleteConfirmStyle}>
                    <span style={{ fontSize: "13px", color: "#14151A", fontWeight: "600" }}>Delete this address?</span>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                      <button onClick={() => setDeleteConfirmId(null)} style={cancelBtnSmallStyle}>Cancel</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} style={deleteBtnStyle}>Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="addr-actions">
                    <button onClick={() => openEditAddress(addr)} style={addrActionBtnStyle} className="hover-lift">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirmId(addr.id)} style={{ ...addrActionBtnStyle, color: "#DC2626", borderColor: "#DC2626" }} className="hover-lift">
                      <Trash2 size={12} /> Delete
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} style={{ ...addrActionBtnStyle, color: "#1B1F8C", borderColor: "#1B1F8C" }} className="hover-lift">
                        <Star size={12} /> Set as Default
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Address Add/Edit Form */}
            {showAddressForm && (
              <div style={{ borderTop: savedAddresses.length > 0 ? "1px solid #E7E7E2" : "none", paddingTop: savedAddresses.length > 0 ? "20px" : "0" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#1B1F8C", marginBottom: "16px" }}>
                  {editingAddressId ? "Edit Address" : "New Address"}
                </h4>

                <div className="addr-form-grid">
                  {/* Label */}
                  <div className="profile-detail-field full-col">
                    <label style={fieldLabelStyle}>Address Label</label>
                    <select
                      className={`profile-form-input`}
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                    >
                      {["Home", "Office", "Other"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>Full Name</label>
                    <input
                      className={`profile-form-input${addressErrors.fullName ? " error" : ""}`}
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Full Name"
                    />
                    {addressErrors.fullName && <span style={inlineErrorStyle}>{addressErrors.fullName}</span>}
                  </div>

                  {/* Phone */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>Phone Number</label>
                    <input
                      className={`profile-form-input${addressErrors.phone ? " error" : ""}`}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      type="tel"
                    />
                    {addressErrors.phone && <span style={inlineErrorStyle}>{addressErrors.phone}</span>}
                  </div>

                  {/* Address Line 1 */}
                  <div className="profile-detail-field full-col">
                    <label style={fieldLabelStyle}>Address Line 1</label>
                    <input
                      className={`profile-form-input${addressErrors.addressLine1 ? " error" : ""}`}
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))}
                      placeholder="House / Flat No., Street"
                    />
                    {addressErrors.addressLine1 && <span style={inlineErrorStyle}>{addressErrors.addressLine1}</span>}
                  </div>

                  {/* Address Line 2 */}
                  <div className="profile-detail-field full-col">
                    <label style={fieldLabelStyle}>Address Line 2 <span style={{ color: "#6B6B75" }}>(optional)</span></label>
                    <input
                      className="profile-form-input"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))}
                      placeholder="Apartment, area, locality"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="profile-detail-field full-col">
                    <label style={fieldLabelStyle}>Landmark <span style={{ color: "#6B6B75" }}>(optional)</span></label>
                    <input
                      className="profile-form-input"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))}
                      placeholder="Near metro, hospital, etc."
                    />
                  </div>

                  {/* City */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>City</label>
                    <input
                      className={`profile-form-input${addressErrors.city ? " error" : ""}`}
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                    />
                    {addressErrors.city && <span style={inlineErrorStyle}>{addressErrors.city}</span>}
                  </div>

                  {/* State */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>State</label>
                    <input
                      className={`profile-form-input${addressErrors.state ? " error" : ""}`}
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="State"
                    />
                    {addressErrors.state && <span style={inlineErrorStyle}>{addressErrors.state}</span>}
                  </div>

                  {/* PIN Code */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>PIN Code</label>
                    <input
                      className={`profile-form-input${addressErrors.postalCode ? " error" : ""}`}
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="560001"
                      maxLength={6}
                      type="text"
                      inputMode="numeric"
                    />
                    {addressErrors.postalCode && <span style={inlineErrorStyle}>{addressErrors.postalCode}</span>}
                  </div>

                  {/* Country */}
                  <div className="profile-detail-field">
                    <label style={fieldLabelStyle}>Country</label>
                    <input
                      className="profile-form-input"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="India"
                    />
                  </div>

                  {/* Make Default */}
                  <div className="full-col" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                    <input
                      type="checkbox"
                      id="addr-default-check"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                      style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1B1F8C" }}
                    />
                    <label htmlFor="addr-default-check" style={{ fontSize: "13px", fontWeight: "600", color: "#14151A", cursor: "pointer" }}>
                      Make this my default address
                    </label>
                  </div>

                  {addressErrors.submit && (
                    <div className="full-col" style={errorMsgStyle}>{addressErrors.submit}</div>
                  )}

                  {/* Form Actions */}
                  <div className="full-col" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                    <button onClick={handleCancelAddress} style={cancelBtnStyle} className="hover-lift">Cancel</button>
                    <button onClick={handleSaveAddress} disabled={addressSaving} style={saveBtnStyle} className="hover-lift">
                      {addressSaving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order History */}
        <div style={rightColStyle} className="order-history">
          <div style={panelCardStyle} className="panel-card order-panel-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h3 style={panelTitleStyle}>Order History</h3>
              <button onClick={() => navigateTo("orders")} style={viewAllOrdersBtnStyle}>
                View All ({displayOrders.length})
              </button>
            </div>

            <div style={ordersListStyle} className="orders-list">
              {displayOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#6B6B75" }}>
                  <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 6px" }}>No orders placed yet</p>
                  <p style={{ fontSize: "13px", margin: 0 }}>Browse our catalog to place your first order.</p>
                </div>
              ) : (
                displayOrders.slice(0, 3).map((order) => (
                <div key={order.id} style={orderItemStyle} className="order-card">
                  <div style={orderHeaderRowStyle} className="order-card-header">
                    <div className="order-info" style={{ minWidth: 0 }}>
                      <span style={orderIdStyle} className="order-id">Order #{order.id}</span>
                      <span style={orderDateStyle} className="order-date">{order.createdAt || order.date}</span>
                    </div>
                    <span style={statusBadgeStyle} className="order-status-badge">{order.orderStatus || order.status}</span>
                  </div>

                  <div style={orderProductListStyle} className="order-product-list">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={orderProductRowStyle} className="order-product-row">
                        <div className="order-product-info" style={{ minWidth: 0, flex: 1, marginRight: "12px" }}>
                          <span style={orderProductNameStyle} className="order-product-name">{item.name || item.productId}</span>
                          <span style={orderProductMetaStyle} className="order-product-meta">
                            {item.variantSize || item.size} &bull; {item.variantFirmness || item.firmness} (x{item.quantity || item.qty})
                          </span>
                        </div>
                        <span style={orderProductPriceStyle} className="order-product-price">{formatPrice((item.price || item.actualPrice || 0) * (item.quantity || item.qty || 1))}</span>
                      </div>
                    ))}
                  </div>

                  <div style={orderFooterRowStyle} className="order-footer-row">
                    <span style={totalLabelStyle}>Total Paid:</span>
                    <span style={totalValueStyle}>{formatPrice(order.totalAmount || order.total || 0)}</span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  width: "100%", padding: "40px 48px 80px 48px",
  boxSizing: "border-box", backgroundColor: "#FFFFFF", minHeight: "calc(100vh - 160px)",
};

const headerCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E7E7E2",
  padding: "30px", display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: "24px", marginBottom: "36px", flexWrap: "wrap", width: "100%", boxSizing: "border-box", minWidth: 0
};

const logoutBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2", color: "#DC2626", padding: "10px 18px",
  borderRadius: "999px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", flexShrink: 0
};

const avatarStyle = {
  width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#16A34A",
  color: "#FFFFFF", fontSize: "36px", fontWeight: "800",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
};

const headerInfoStyle = { display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 };
const userNameStyle = { fontSize: "24px", fontWeight: "800", color: "#1B1F8C" };
const userMetaStyle = { fontSize: "13.5px", color: "#6B6B75" };
const streakBadgeStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  backgroundColor: "rgba(22, 163, 74, 0.08)", borderRadius: "14px",
  padding: "4px 12px", width: "fit-content", marginTop: "6px"
};
const streakTextStyle = { fontSize: "12px", fontWeight: "700", color: "#16A34A" };

const gridStyle = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px",
  alignItems: "flex-start", width: "100%", maxWidth: "100%", minWidth: 0
};
const leftColStyle = { display: "flex", flexDirection: "column", gap: "24px", minWidth: 0, width: "100%" };
const rightColStyle = { display: "flex", flexDirection: "column", minWidth: 0, width: "100%" };
const panelCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: 0, padding: "30px",
  width: "100%", boxSizing: "border-box", minWidth: 0,
  border: "1px solid #E7E7E2", borderRadius: "16px"
};
const panelTitleStyle = { fontSize: "18px", fontWeight: "700", color: "#1B1F8C", margin: 0 };

const fieldLabelStyle = {
  fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
  letterSpacing: "0.06em", color: "#6B6B75"
};
const fieldValueStyle = { fontSize: "15px", fontWeight: "600", color: "#14151A", minWidth: 0, overflowWrap: "anywhere" };
const inlineErrorStyle = { fontSize: "12px", color: "#DC2626", marginTop: "2px" };

const successMsgStyle = {
  backgroundColor: "rgba(22, 163, 74, 0.08)", color: "#16A34A", fontSize: "13px",
  fontWeight: "600", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid rgba(22, 163, 74, 0.15)", marginBottom: "16px"
};
const errorMsgStyle = {
  backgroundColor: "rgba(220, 38, 38, 0.06)", color: "#DC2626", fontSize: "13px",
  fontWeight: "600", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid rgba(220, 38, 38, 0.15)", marginBottom: "16px"
};

const actionBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2", color: "#1B1F8C", padding: "8px 14px",
  borderRadius: "999px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
};

const saveBtnStyle = {
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "24px",
  padding: "11px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease"
};
const cancelBtnStyle = {
  backgroundColor: "#F7F7F2", color: "#14151A", border: "1px solid #E7E7E2", borderRadius: "24px",
  padding: "11px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
};
const cancelBtnSmallStyle = {
  backgroundColor: "#F7F7F2", color: "#14151A", border: "1px solid #E7E7E2", borderRadius: "8px",
  padding: "6px 14px", fontSize: "12.5px", fontWeight: "600", cursor: "pointer"
};
const deleteBtnStyle = {
  backgroundColor: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: "8px",
  padding: "6px 14px", fontSize: "12.5px", fontWeight: "700", cursor: "pointer"
};

const addAddrBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#1B1F8C",
  color: "#FFFFFF", border: "none", padding: "8px 16px",
  borderRadius: "999px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
};

const addrCardStyle = {
  border: "1px solid #E7E7E2", borderRadius: "12px", padding: "16px",
  marginBottom: "12px", backgroundColor: "#FAFAF7", minWidth: 0, boxSizing: "border-box"
};
const addrLabelStyle = {
  fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em",
  color: "#1B1F8C", textTransform: "uppercase"
};
const defaultBadgeStyle = {
  fontSize: "10px", fontWeight: "700", color: "#16A34A", backgroundColor: "rgba(22,163,74,0.1)",
  padding: "2px 8px", borderRadius: "8px", border: "1px solid rgba(22,163,74,0.2)"
};
const addrTextStyle = {
  fontSize: "13.5px", color: "#14151A", lineHeight: "1.7", margin: 0,
  overflowWrap: "anywhere", minWidth: 0
};
const addrActionBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2", color: "#6B6B75", padding: "6px 12px",
  borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer"
};
const deleteConfirmStyle = {
  marginTop: "12px", backgroundColor: "rgba(220,38,38,0.05)",
  border: "1px solid rgba(220,38,38,0.2)", borderRadius: "8px", padding: "12px"
};

const viewAllOrdersBtnStyle = {
  border: "none", background: "transparent", color: "#1B1F8C",
  fontSize: "13px", fontWeight: "700", cursor: "pointer", flexShrink: 0
};

const ordersListStyle = { display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0 };
const orderItemStyle = {
  borderRadius: "10px", padding: "20px", backgroundColor: "#F7F7F2",
  width: "100%", boxSizing: "border-box", minWidth: 0
};
const orderHeaderRowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  borderBottom: "1px solid #E7E7E2", paddingBottom: "12px", marginBottom: "12px",
  flexWrap: "wrap", gap: "8px", minWidth: 0
};
const orderIdStyle = { fontSize: "14px", fontWeight: "700", color: "#1B1F8C", marginRight: "10px" };
const orderDateStyle = { fontSize: "12px", color: "#6B6B75" };
const statusBadgeStyle = {
  fontSize: "10px", fontWeight: "700", textTransform: "uppercase",
  letterSpacing: "0.05em", color: "#FFFFFF", backgroundColor: "#16A34A",
  padding: "4px 10px", borderRadius: "10px", flexShrink: 0
};
const orderProductListStyle = {
  display: "flex", flexDirection: "column", gap: "10px",
  borderBottom: "1px solid #E7E7E2", paddingBottom: "12px", marginBottom: "12px",
  width: "100%", minWidth: 0
};
const orderProductRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 0 };
const orderProductNameStyle = {
  fontSize: "13.5px", fontWeight: "600", color: "#14151A", display: "block",
  overflowWrap: "anywhere", wordBreak: "break-word"
};
const orderProductMetaStyle = { fontSize: "11px", color: "#6B6B75", display: "block", marginTop: "2px" };
const orderProductPriceStyle = { fontSize: "13.5px", fontWeight: "600", color: "#14151A", flexShrink: 0, whiteSpace: "nowrap" };
const orderFooterRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 0 };
const totalLabelStyle = { fontSize: "13px", fontWeight: "600", color: "#6B6B75" };
const totalValueStyle = { fontSize: "16px", fontWeight: "800", color: "#1B1F8C" };

