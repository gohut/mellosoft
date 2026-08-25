"use client";

import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, ShoppingBag } from "lucide-react";
import DownloadOrderPdf from "../components/DownloadOrderPdf";

export default function OrderConfirmationView() {
  const { selectedOrderId, orders, navigateTo } = useStore();

  const currentOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    if (selectedOrderId) {
      return orders.find((o) => o.id === selectedOrderId || o.orderId === selectedOrderId) || null;
    }
    return orders[0];
  }, [orders, selectedOrderId]);

  if (!currentOrder) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyCardStyle}>
          <h2 style={{ fontSize: "24px", color: "#1B1F8C", margin: "0 0 12px 0" }}>Order Not Found</h2>
          <p style={{ color: "#6B6B75", marginBottom: "20px" }}>We couldn't find the order you are looking for.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigateTo("orders")} style={primaryBtnStyle}>
              View My Orders
            </button>
            <button onClick={() => navigateTo("catalog")} style={primaryBtnStyle}>
              Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = currentOrder.items || [];
  const address = currentOrder.deliveryAddress || currentOrder.shippingAddress || {};

  // Estimated delivery date (3-5 days from creation)
  const orderDate = new Date(currentOrder.createdAt || Date.now());
  const estDeliveryMin = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  const estDeliveryMax = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

  return (
    <div style={containerStyle}>
      {/* SUCCESS CONFIRMATION BANNER */}
      <div style={bannerCardStyle}>
        <div style={iconBadgeStyle}>
          <CheckCircle2 size={48} color="#FFFFFF" />
        </div>
        <h1 style={titleStyle}>Order Confirmed!</h1>
        <p style={subtitleStyle}>✓ Your order has been placed successfully.</p>
        <div style={orderIdTagStyle}>
          <span>Order ID: <strong>{currentOrder.orderId || currentOrder.id}</strong></span>
        </div>
      </div>

      {/* TWO COLUMN SUMMARY */}
      <div style={layoutGridStyle}>
        
        {/* LEFT COLUMN: ORDER ITEMS & DELIVERY DETAILS */}
        <div style={leftColStyle}>
          
          {/* SECTION 1: ORDERED PRODUCTS */}
          <div style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>
              <Package size={18} color="#1B1F8C" />
              <span>Ordered Products ({items.length})</span>
            </h3>

            <div style={itemsListStyle}>
              {items.map((item, idx) => (
                <div key={idx} style={itemCardStyle}>
                  <img src={item.image || "/asset/img1.jpg"} alt={item.name || item.productName} style={itemImageStyle} />
                  <div style={itemMetaStyle}>
                    <h4 style={itemNameStyle}>{item.name || item.productName}</h4>
                    <div style={variantChipsStyle}>
                      <span style={chipBlueStyle}>Size: {item.size || item.variantSize || "Standard"}</span>
                      <span style={chipGreyStyle}>Firmness: {item.firmness || item.variantFirmness || "Medium"}</span>
                      {item.sku && <span style={chipSkuStyle}>SKU: {item.sku || item.variantSKU}</span>}
                    </div>
                    <div style={priceQtyRowStyle}>
                      <span style={qtyStyle}>Quantity: <strong>{item.quantity || item.qty || 1}</strong></span>
                      <span style={priceStyle}>{formatPrice((item.price || item.discountPrice || item.actualPrice || 0) * (item.quantity || item.qty || 1))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: DELIVERY ADDRESS & ESTIMATED TIMELINE */}
          <div style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>
              <MapPin size={18} color="#1B1F8C" />
              <span>Delivery Details</span>
            </h3>

            <div style={detailsGridStyle}>
              <div style={addressBoxStyle}>
                <strong style={{ fontSize: "15px", color: "#14151A", display: "block", marginBottom: "4px" }}>
                  {address.fullName || currentOrder.customerName || "Customer"}
                </strong>
                <p style={addrTextStyle}>{address.addressLine1}</p>
                {address.addressLine2 && <p style={addrTextStyle}>{address.addressLine2}</p>}
                <p style={addrTextStyle}>{address.city}, {address.state} - <strong>{address.pincode}</strong></p>
                <p style={{ ...addrTextStyle, marginTop: "6px", color: "#1B1F8C", fontWeight: "600" }}>📞 {address.phone || currentOrder.phone}</p>
              </div>

              <div style={timelineBoxStyle}>
                <div style={timelineHeaderStyle}>
                  <Calendar size={18} color="#16A34A" />
                  <strong style={{ color: "#16A34A", fontSize: "14px" }}>Estimated Delivery</strong>
                </div>
                <div style={estDateValStyle}>
                  {estDeliveryMin} – {estDeliveryMax}
                </div>
                <span style={estNoteStyle}>Standard Doorstep Delivery via Mellosoft Express</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT SUMMARY & ACTIONS */}
        <div style={rightColStyle}>
          <div style={summaryCardStyle}>
            <h3 style={summaryTitleStyle}>Payment Summary</h3>

            <div style={paymentMetaBoxStyle}>
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Payment Method</span>
                <span style={metaValStyle}>{currentOrder.paymentMethod || "UPI / COD"}</span>
              </div>
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Payment Status</span>
                <span
                  style={{
                    ...statusBadgeStyle,
                    backgroundColor: currentOrder.paymentStatus === "Paid" ? "#DCFCE7" : "#FEF3C7",
                    color: currentOrder.paymentStatus === "Paid" ? "#16A34A" : "#D97706"
                  }}
                >
                  {currentOrder.paymentStatus || "Paid"}
                </span>
              </div>
              <div style={metaRowStyle}>
                <span style={metaLabelStyle}>Order Status</span>
                <span style={{ ...statusBadgeStyle, backgroundColor: "#FEF3C7", color: "#D97706" }}>
                  {currentOrder.orderStatus || "Processing"}
                </span>
              </div>
            </div>

            <div style={summaryDividerStyle} />

            <div style={rowsGroupStyle}>
              <div style={rowItemStyle}>
                <span style={rowLabelStyle}>Subtotal</span>
                <span style={rowValStyle}>{formatPrice(currentOrder.subtotal || currentOrder.totalAmount * 0.8)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div style={rowItemStyle}>
                  <span style={rowLabelStyle}>Discount Saved</span>
                  <span style={{ ...rowValStyle, color: "#16A34A" }}>–{formatPrice(currentOrder.discount)}</span>
                </div>
              )}
              <div style={rowItemStyle}>
                <span style={rowLabelStyle}>18% GST Tax</span>
                <span style={rowValStyle}>{formatPrice(currentOrder.tax || Math.round(currentOrder.totalAmount * 0.15))}</span>
              </div>
              <div style={rowItemStyle}>
                <span style={rowLabelStyle}>Shipping</span>
                <span style={rowValStyle}>{currentOrder.shipping === 0 ? <strong style={{ color: "#16A34A" }}>FREE</strong> : formatPrice(currentOrder.shipping || 0)}</span>
              </div>
            </div>

            <div style={summaryDividerStyle} />

            <div style={totalRowStyle}>
              <span style={totalLabelStyle}>Total Paid</span>
              <span style={totalValStyle}>{formatPrice(currentOrder.totalAmount)}</span>
            </div>

            <div style={actionButtonsGroupStyle}>
              {/* PDF Download — prominently placed above navigation actions */}
              <DownloadOrderPdf order={currentOrder} variant="primary" />

              <button onClick={() => navigateTo("orders")} style={viewOrdersBtnStyle}>
                <ShoppingBag size={16} />
                <span>View My Orders</span>
              </button>
              <button onClick={() => navigateTo("catalog")} style={continueBtnStyle}>
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
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
  padding: "40px 48px 80px 48px",
  width: "100%",
  boxSizing: "border-box"
};

const bannerCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "24px",
  padding: "48px 32px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  marginBottom: "36px",
  boxShadow: "0 10px 30px rgba(22, 163, 74, 0.08)"
};

const iconBadgeStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#16A34A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 24px rgba(22, 163, 74, 0.3)"
};

const titleStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const subtitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#16A34A",
  margin: 0
};

const orderIdTagStyle = {
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  padding: "8px 20px",
  borderRadius: "999px",
  fontSize: "14px",
  color: "#14151A",
  marginTop: "6px"
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

const sectionCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
};

const sectionHeadingStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 20px 0",
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const itemsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const itemCardStyle = {
  display: "flex",
  gap: "16px",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  alignItems: "center"
};

const itemImageStyle = {
  width: "84px",
  height: "84px",
  objectFit: "cover",
  borderRadius: "12px",
  backgroundColor: "#FFFFFF",
  flexShrink: 0
};

const itemMetaStyle = {
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

const variantChipsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  fontSize: "12px"
};

const chipBlueStyle = {
  backgroundColor: "#EFF6FF",
  color: "#1D4ED8",
  padding: "3px 8px",
  borderRadius: "6px"
};

const chipGreyStyle = {
  backgroundColor: "#F3F4F6",
  color: "#4B5563",
  padding: "3px 8px",
  borderRadius: "6px"
};

const chipSkuStyle = {
  fontFamily: "monospace",
  color: "#9CA3AF"
};

const priceQtyRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "4px"
};

const qtyStyle = {
  fontSize: "13px",
  color: "#6B6B75"
};

const priceStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const addressBoxStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  padding: "20px"
};

const addrTextStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  margin: "0 0 3px 0"
};

const timelineBoxStyle = {
  backgroundColor: "rgba(22, 163, 74, 0.06)",
  border: "1px solid rgba(22, 163, 74, 0.2)",
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const timelineHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const estDateValStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#16A34A"
};

const estNoteStyle = {
  fontSize: "12px",
  color: "#6B6B75"
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

const paymentMetaBoxStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "12px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const metaRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "13px"
};

const metaLabelStyle = {
  color: "#6B6B75"
};

const metaValStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const statusBadgeStyle = {
  padding: "3px 10px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "11px"
};

const summaryDividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2"
};

const rowsGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const rowItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px"
};

const rowLabelStyle = {
  color: "#6B6B75"
};

const rowValStyle = {
  fontWeight: "600",
  color: "#14151A"
};

const totalRowStyle = {
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

const actionButtonsGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "4px"
};

const viewOrdersBtnStyle = {
  width: "100%",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "14px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const continueBtnStyle = {
  width: "100%",
  backgroundColor: "#FAFAF7",
  color: "#1B1F8C",
  border: "1px solid #1B1F8C",
  borderRadius: "999px",
  padding: "14px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
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
