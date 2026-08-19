"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { formatPrice } from "../utils/currency";
import { ArrowLeft, CheckCircle2, Plus, Edit2, MapPin, Truck, ShieldCheck } from "lucide-react";

export default function CheckoutView() {
  const {
    checkoutItems,
    cart,
    userAddresses,
    saveUserAddress,
    selectedAddress,
    setSelectedAddress,
    navigateTo
  } = useStore();

  const { currentCustomer } = useCustomerAuth();
  const userId = currentCustomer ? currentCustomer.id : "C001";

  // Active items for checkout (fallback to cart if checkoutItems is empty)
  const items = useMemo(() => {
    return checkoutItems && checkoutItems.length > 0 ? checkoutItems : cart;
  }, [checkoutItems, cart]);

  // Saved address for this user
  const savedAddress = (userAddresses && userAddresses[userId]) ? userAddresses[userId] : null;

  // State for Address Form
  const [editingAddress, setEditingAddress] = useState(false);
  const [formAddress, setFormAddress] = useState({
    fullName: savedAddress?.fullName || currentCustomer?.name || "Rahul Sharma",
    phone: savedAddress?.phone || currentCustomer?.phone || "+91 98765 43210",
    addressLine1: savedAddress?.addressLine1 || "123 Indiranagar 100ft Road",
    addressLine2: savedAddress?.addressLine2 || "Near Metro Station",
    city: savedAddress?.city || "Bengaluru",
    state: savedAddress?.state || "Karnataka",
    pincode: savedAddress?.pincode || "560038",
    landmark: savedAddress?.landmark || "Opposite FabIndia"
  });

  const [addressError, setAddressError] = useState("");

  // Sync saved address to form when available
  useEffect(() => {
    if (savedAddress) {
      setFormAddress(savedAddress);
      setSelectedAddress(savedAddress);
    } else {
      setSelectedAddress(formAddress);
    }
  }, [savedAddress]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("MELLO10");
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponMsg, setCouponMsg] = useState("MELLO10 applied! 10% Off");

  // Price calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.price || item.discountPrice || item.actualPrice || 0;
      const qty = item.qty || item.quantity || 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  const rawTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const actual = item.actualPrice || item.price || 0;
      const qty = item.qty || item.quantity || 1;
      return acc + actual * qty;
    }, 0);
  }, [items]);

  const discountSavings = Math.max(0, rawTotal - subtotal);
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 150;
  const finalTotal = subtotal + tax + shipping - couponDiscount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "MELLO10") {
      setCouponApplied(true);
      setCouponMsg("MELLO10 applied! 10% Off");
    } else {
      setCouponApplied(false);
      setCouponMsg("Invalid coupon code.");
    }
  };

  const handleSaveAddressSubmit = (e) => {
    e.preventDefault();
    if (!formAddress.fullName.trim()) {
      setAddressError("Please enter full name.");
      return;
    }
    if (!formAddress.phone.trim()) {
      setAddressError("Please enter phone number.");
      return;
    }
    if (!formAddress.addressLine1.trim()) {
      setAddressError("Please enter address line 1.");
      return;
    }
    if (!formAddress.city.trim() || !formAddress.state.trim() || !formAddress.pincode.trim()) {
      setAddressError("Please enter city, state, and pincode.");
      return;
    }

    setAddressError("");
    saveUserAddress(userId, formAddress);
    setSelectedAddress(formAddress);
    setEditingAddress(false);
  };

  const handleProceedToPayment = () => {
    const addr = selectedAddress || savedAddress || formAddress;
    if (!addr || !addr.fullName || !addr.addressLine1 || !addr.city || !addr.pincode) {
      setAddressError("Please complete and save a valid delivery address before proceeding.");
      setEditingAddress(true);
      return;
    }
    setSelectedAddress(addr);
    navigateTo("payment");
  };

  if (!items || items.length === 0) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyCardStyle}>
          <h2 style={{ fontSize: "24px", color: "#1B1F8C", margin: "0 0 12px 0" }}>No Items in Checkout</h2>
          <p style={{ color: "#6B6B75", marginBottom: "20px" }}>Please select a mattress or product to proceed to checkout.</p>
          <button onClick={() => navigateTo("catalog")} style={primaryBtnStyle}>
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Breadcrumb Header */}
      <div style={headerNavStyle}>
        <button onClick={() => navigateTo("cart")} style={backBtnStyle}>
          <ArrowLeft size={18} />
          <span>Back to Cart</span>
        </button>
        <div style={stepperStyle}>
          <span style={activeStepStyle}>1. Delivery Address</span>
          <span style={stepDividerStyle}>→</span>
          <span style={inactiveStepStyle}>2. Payment</span>
          <span style={stepDividerStyle}>→</span>
          <span style={inactiveStepStyle}>3. Confirmation</span>
        </div>
      </div>

      <div style={layoutGridStyle}>
        {/* LEFT COLUMN: Order Items & Delivery Address */}
        <div style={leftColStyle}>
          
          {/* SECTION 1: ORDER ITEMS */}
          <div style={cardSectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span>1. Order Items</span>
              <span style={countBadgeStyle}>{items.length} {items.length === 1 ? "Item" : "Items"}</span>
            </h2>
            <div style={itemsListStyle}>
              {items.map((item, index) => (
                <div key={index} style={itemRowStyle}>
                  <img src={item.image || "/asset/img1.jpg"} alt={item.name} style={itemImageStyle} />
                  <div style={itemDetailsStyle}>
                    <h4 style={itemNameStyle}>{item.name || item.productName}</h4>
                    <div style={variantChipsRowStyle}>
                      <span style={sizeChipStyle}>Size: <strong>{item.size}</strong></span>
                      <span style={firmnessChipStyle}>Firmness: <strong>{item.firmness}</strong></span>
                      <span style={skuChipStyle}>SKU: {item.sku}</span>
                    </div>
                    <div style={itemPriceQtyRowStyle}>
                      <span style={itemQtyStyle}>Qty: <strong>{item.qty || item.quantity}</strong></span>
                      <span style={itemPriceStyle}>{formatPrice((item.price || item.discountPrice) * (item.qty || item.quantity))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: DELIVERY ADDRESS */}
          <div style={cardSectionStyle}>
            <div style={sectionHeaderFlexStyle}>
              <h2 style={sectionTitleStyle}>2. Delivery Address</h2>
              {savedAddress && !editingAddress && (
                <button onClick={() => setEditingAddress(true)} style={secondaryIconBtnStyle}>
                  <Edit2 size={14} />
                  <span>Edit Address</span>
                </button>
              )}
            </div>

            {addressError && (
              <div style={errorAlertStyle}>
                <span>⚠️ {addressError}</span>
              </div>
            )}

            {savedAddress && !editingAddress ? (
              <div style={addressDisplayCardStyle}>
                <div style={addressCardHeaderStyle}>
                  <div style={addressCardBadgeStyle}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span>Selected Delivery Address</span>
                  </div>
                </div>
                <div style={addressBodyStyle}>
                  <strong style={{ fontSize: "16px", color: "#14151A", display: "block" }}>{savedAddress.fullName}</strong>
                  <p style={addressTextLineStyle}>{savedAddress.addressLine1}</p>
                  {savedAddress.addressLine2 && <p style={addressTextLineStyle}>{savedAddress.addressLine2}</p>}
                  <p style={addressTextLineStyle}>{savedAddress.city}, {savedAddress.state} - <strong>{savedAddress.pincode}</strong></p>
                  {savedAddress.landmark && <p style={addressTextLineStyle}>Landmark: {savedAddress.landmark}</p>}
                  <p style={{ ...addressTextLineStyle, marginTop: "6px", color: "#1B1F8C", fontWeight: "600" }}>📞 {savedAddress.phone}</p>
                </div>
                <button onClick={() => setEditingAddress(true)} style={changeAddrBtnStyle}>
                  <Plus size={14} />
                  <span>Add or Change Address</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveAddressSubmit} style={addressFormStyle}>
                <div style={formGridStyle}>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      value={formAddress.fullName}
                      onChange={(e) => setFormAddress({ ...formAddress, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Phone Number *</label>
                    <input
                      type="text"
                      value={formAddress.phone}
                      onChange={(e) => setFormAddress({ ...formAddress, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ ...fieldGroupStyle, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Address Line 1 *</label>
                    <input
                      type="text"
                      value={formAddress.addressLine1}
                      onChange={(e) => setFormAddress({ ...formAddress, addressLine1: e.target.value })}
                      placeholder="House/Flat No., Building Name, Street Name"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ ...fieldGroupStyle, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={formAddress.addressLine2}
                      onChange={(e) => setFormAddress({ ...formAddress, addressLine2: e.target.value })}
                      placeholder="Apartment, suite, unit, etc."
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      value={formAddress.city}
                      onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>State *</label>
                    <input
                      type="text"
                      value={formAddress.state}
                      onChange={(e) => setFormAddress({ ...formAddress, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Pincode *</label>
                    <input
                      type="text"
                      value={formAddress.pincode}
                      onChange={(e) => setFormAddress({ ...formAddress, pincode: e.target.value })}
                      placeholder="e.g. 560038"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Landmark (Optional)</label>
                    <input
                      type="text"
                      value={formAddress.landmark}
                      onChange={(e) => setFormAddress({ ...formAddress, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Station"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={formActionsRowStyle}>
                  <button type="submit" style={saveAddrBtnStyle}>
                    Save & Use Address
                  </button>
                  {savedAddress && (
                    <button type="button" onClick={() => setEditingAddress(false)} style={cancelAddrBtnStyle}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div style={rightColStyle}>
          <div style={summaryCardStyle}>
            <h3 style={summaryTitleStyle}>Order Summary</h3>

            {/* Coupon Code Block */}
            <form onSubmit={handleApplyCoupon} style={couponFormStyle}>
              <div style={couponInputWrapStyle}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter Promo Code"
                  style={couponInputStyle}
                />
                <button type="submit" style={couponBtnStyle}>Apply</button>
              </div>
              {couponMsg && (
                <span style={{ fontSize: "12px", fontWeight: "600", color: couponApplied ? "#16A34A" : "#DC2626", marginTop: "4px", display: "block" }}>
                  {couponMsg}
                </span>
              )}
            </form>

            <div style={summaryRowsStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Subtotal</span>
                <span style={summaryValStyle}>{formatPrice(subtotal)}</span>
              </div>

              {discountSavings > 0 && (
                <div style={summaryRowStyle}>
                  <span style={summaryLabelStyle}>Product Discount</span>
                  <span style={{ ...summaryValStyle, color: "#16A34A" }}>–{formatPrice(discountSavings)}</span>
                </div>
              )}

              {couponApplied && couponDiscount > 0 && (
                <div style={summaryRowStyle}>
                  <span style={summaryLabelStyle}>Coupon (MELLO10)</span>
                  <span style={{ ...summaryValStyle, color: "#16A34A" }}>–{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Estimated Tax (18% GST)</span>
                <span style={summaryValStyle}>{formatPrice(tax)}</span>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Shipping & Delivery</span>
                <span style={summaryValStyle}>{shipping === 0 ? <strong style={{ color: "#16A34A" }}>FREE</strong> : formatPrice(shipping)}</span>
              </div>
            </div>

            <div style={summaryDividerStyle} />

            <div style={summaryTotalRowStyle}>
              <span style={totalLabelStyle}>Final Total</span>
              <span style={totalValStyle}>{formatPrice(finalTotal)}</span>
            </div>

            <button onClick={handleProceedToPayment} style={proceedBtnStyle}>
              <span>Proceed to Payment</span>
              <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
            </button>

            <div style={trustBadgesRowStyle}>
              <div style={trustBadgeItemStyle}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>100-Night Trial Guarantee</span>
              </div>
              <div style={trustBadgeItemStyle}>
                <Truck size={16} color="#16A34A" />
                <span>Contactless Doorstep Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inlined Style Tokens
const containerStyle = {
  maxWidth: "1720px",
  margin: "0 auto",
  padding: "30px 48px 80px 48px",
  width: "100%",
  boxSizing: "border-box"
};

const headerNavStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "32px",
  flexWrap: "wrap",
  gap: "16px"
};

const backBtnStyle = {
  border: "none",
  background: "none",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  cursor: "pointer",
  padding: 0
};

const stepperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "14px"
};

const activeStepStyle = {
  fontWeight: "800",
  color: "#1B1F8C"
};

const inactiveStepStyle = {
  fontWeight: "500",
  color: "#9CA3AF"
};

const stepDividerStyle = {
  color: "#D1D5DB"
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr",
  gap: "32px",
  alignItems: "flex-start"
};

const leftColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "28px"
};

const rightColStyle = {
  position: "sticky",
  top: "100px"
};

const cardSectionStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
};

const sectionHeaderFlexStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px"
};

const sectionTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 20px 0",
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const countBadgeStyle = {
  fontSize: "12px",
  fontWeight: "700",
  backgroundColor: "#F7F7F2",
  color: "#6B6B75",
  padding: "4px 10px",
  borderRadius: "999px",
  border: "1px solid #E7E7E2"
};

const itemsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const itemRowStyle = {
  display: "flex",
  gap: "16px",
  padding: "14px",
  borderRadius: "14px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  alignItems: "center"
};

const itemImageStyle = {
  width: "80px",
  height: "80px",
  objectFit: "cover",
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  flexShrink: 0
};

const itemDetailsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  flexGrow: 1
};

const itemNameStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#14151A",
  margin: 0
};

const variantChipsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  fontSize: "12px"
};

const sizeChipStyle = {
  backgroundColor: "#EFF6FF",
  color: "#1D4ED8",
  padding: "3px 8px",
  borderRadius: "6px"
};

const firmnessChipStyle = {
  backgroundColor: "#F3F4F6",
  color: "#4B5563",
  padding: "3px 8px",
  borderRadius: "6px"
};

const skuChipStyle = {
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#9CA3AF"
};

const itemPriceQtyRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "4px"
};

const itemQtyStyle = {
  fontSize: "13px",
  color: "#6B6B75"
};

const itemPriceStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const addressDisplayCardStyle = {
  backgroundColor: "#FAFAF7",
  border: "2px solid #16A34A",
  borderRadius: "16px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const addressCardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const addressCardBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#16A34A"
};

const addressBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const addressTextLineStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  margin: 0
};

const changeAddrBtnStyle = {
  border: "1px stroke #1B1F8C",
  backgroundColor: "#FFFFFF",
  color: "#1B1F8C",
  border: "1px solid #1B1F8C",
  borderRadius: "999px",
  padding: "10px 18px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "8px"
};

const addressFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px"
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#14151A"
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "14px",
  color: "#14151A",
  backgroundColor: "#F7F7F2",
  boxSizing: "border-box"
};

const formActionsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "8px"
};

const saveAddrBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer"
};

const cancelAddrBtnStyle = {
  backgroundColor: "#F3F4F6",
  color: "#4B5563",
  border: "none",
  borderRadius: "999px",
  padding: "12px 20px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};

const secondaryIconBtnStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const errorAlertStyle = {
  backgroundColor: "#FEE2E2",
  color: "#DC2626",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "16px"
};

const summaryCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const summaryTitleStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const couponFormStyle = {
  display: "flex",
  flexDirection: "column"
};

const couponInputWrapStyle = {
  display: "flex",
  gap: "8px"
};

const couponInputStyle = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "13px",
  backgroundColor: "#F7F7F2"
};

const couponBtnStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "0 16px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const summaryRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px"
};

const summaryLabelStyle = {
  color: "#6B6B75"
};

const summaryValStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const summaryDividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2"
};

const summaryTotalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const totalLabelStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#14151A"
};

const totalValStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const proceedBtnStyle = {
  width: "100%",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "16px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow: "0 8px 20px rgba(22, 163, 74, 0.25)"
};

const trustBadgesRowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "4px"
};

const trustBadgeItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  color: "#6B6B75"
};

const emptyContainerStyle = {
  maxWidth: "600px",
  margin: "80px auto",
  padding: "0 24px",
  textAlign: "center"
};

const emptyCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "48px 32px"
};

const primaryBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "14px 28px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
};
