"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, ShoppingBag } from "lucide-react";
import DownloadOrderPdf from "../components/DownloadOrderPdf";

export default function OrderConfirmationView() {
  const { selectedOrderId, orders, navigateTo, settings } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    if (selectedOrderId) {
      return orders.find((o) => o.id === selectedOrderId || o.orderId === selectedOrderId) || null;
    }
    return orders[0];
  }, [orders, selectedOrderId]);

  if (!mounted) {
    return (
      <div style={containerStyle}>
        <div style={bannerCardStyle}>
          <div style={{ ...iconBadgeStyle, backgroundColor: "#E7E7E2" }}>
            <Package size={36} color="#6B6B75" />
          </div>
          <h1 style={titleStyle}>Order Confirmation</h1>
          <p style={subtitleStyle}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyCardStyle}>
          <h2 style={{ fontSize: "24px", color: "#1B1F8C", margin: "0 0 12px 0" }}>Order Not Found</h2>
          <p style={{ color: "#6B6B75", marginBottom: "20px" }}>We couldn't find the order you are looking for.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigateTo("orders")} style={primaryBtnStyle} type="button">
              View My Orders
            </button>
            <button onClick={() => navigateTo("catalog")} style={primaryBtnStyle} type="button">
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
  const formatEstDate = (d) => {
    if (!d || isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };
  const estDeliveryMin = formatEstDate(new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000));
  const estDeliveryMax = formatEstDate(new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000));

  return (
    <div style={containerStyle} className="confirmation-container">
      <style>{`
        .confirmation-container {
          width: 100% !important;
          max-width: 1600px !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
        }
        .confirmation-layout-grid {
          width: 100% !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
        }
        .confirmation-left-col, .confirmation-right-col {
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .confirmation-addr-text {
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }
        .download-btn-mobile-text {
          display: none;
        }
        .download-btn-desktop-text {
          display: inline;
        }
        .confirmation-action-row {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          width: 100% !important;
        }
        .confirmation-download-col {
          flex: 0 1 42% !important;
          min-width: 0 !important;
        }
        .confirmation-view-orders-btn {
          flex: 1 1 58% !important;
          min-width: 0 !important;
        }
        
        @media (max-width: 992px) {
          .confirmation-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .confirmation-right-col {
            position: static !important;
            top: auto !important;
            width: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .confirmation-container {
            padding: 16px 16px 40px 16px !important;
          }
          .confirmation-banner-card {
            padding: 16px 8px 20px 8px !important;
            margin-bottom: 20px !important;
          }
          .confirmation-section-card {
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .confirmation-summary-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .confirmation-details-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .confirmation-address-box, .confirmation-timeline-box {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .confirmation-item-card {
            display: grid !important;
            grid-template-columns: 72px minmax(0, 1fr) !important;
            gap: 12px !important;
            padding: 12px !important;
            box-sizing: border-box !important;
          }
          .confirmation-item-img {
            width: 72px !important;
            height: 72px !important;
          }
          .download-btn-desktop-text {
            display: none !important;
          }
          .download-btn-mobile-text {
            display: inline !important;
          }
        }

        @media (max-width: 480px) {
          .confirmation-container {
            padding: 12px 12px 36px 12px !important;
          }
          .confirmation-banner-card {
            padding: 12px 0 18px 0 !important;
          }
          .confirmation-summary-card {
            padding: 18px 14px !important;
            border-radius: 14px !important;
          }
          .confirmation-item-card {
            grid-template-columns: 60px minmax(0, 1fr) !important;
            gap: 10px !important;
            padding: 10px !important;
          }
          .confirmation-item-img {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>

      {/* SUCCESS CONFIRMATION BANNER (Outer border removed) */}
      <div style={bannerCardStyle} className="confirmation-banner-card">
        <div style={iconBadgeStyle}>
          <CheckCircle2 size={44} color="#FFFFFF" />
        </div>
        <h1 style={titleStyle}>Order Confirmed!</h1>
        <p style={subtitleStyle}>✓ Your order has been placed successfully.</p>
        <div style={orderIdTagStyle}>
          <span>Order ID: <strong>{currentOrder.orderId || currentOrder.id}</strong></span>
        </div>
      </div>

      {/* TWO COLUMN SUMMARY */}
      <div style={layoutGridStyle} className="confirmation-layout-grid">
        
        {/* LEFT COLUMN: ORDER ITEMS & DELIVERY DETAILS (Outer borders removed) */}
        <div style={leftColStyle} className="confirmation-left-col">
          
          {/* SECTION 1: ORDERED PRODUCTS */}
          <div style={sectionCardStyle} className="confirmation-section-card">
            <h3 style={sectionHeadingStyle}>
              <Package size={18} color="#1B1F8C" />
              <span>Ordered Products ({items.length})</span>
            </h3>

            <div style={itemsListStyle} className="confirmation-items-list">
              {items.map((item, idx) => (
                <div key={idx} style={itemCardStyle} className="confirmation-item-card">
                  <img src={item.image || "/asset/img1.jpg"} alt={item.name || item.productName} style={itemImageStyle} className="confirmation-item-img" />
                  <div style={itemMetaStyle} className="confirmation-item-meta">
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
          <div style={sectionCardStyle} className="confirmation-section-card">
            <h3 style={sectionHeadingStyle}>
              <MapPin size={18} color="#1B1F8C" />
              <span>Delivery Details</span>
            </h3>

            <div style={detailsGridStyle} className="confirmation-details-grid">
              <div style={addressBoxStyle} className="confirmation-address-box">
                <strong style={{ fontSize: "15px", color: "#14151A", display: "block", marginBottom: "4px" }} className="confirmation-addr-text">
                  {address.fullName || currentOrder.customerName || "Customer"}
                </strong>
                <p style={addrTextStyle} className="confirmation-addr-text">{address.addressLine1}</p>
                {address.addressLine2 && <p style={addrTextStyle} className="confirmation-addr-text">{address.addressLine2}</p>}
                <p style={addrTextStyle} className="confirmation-addr-text">{address.city}, {address.state} - <strong>{address.pincode}</strong></p>
                <p style={{ ...addrTextStyle, marginTop: "6px", color: "#1B1F8C", fontWeight: "600" }} className="confirmation-addr-text">📞 {address.phone || currentOrder.phone}</p>
              </div>

              <div style={timelineBoxStyle} className="confirmation-timeline-box">
                <div style={timelineHeaderStyle}>
                  <Calendar size={18} color="#16A34A" />
                  <strong style={{ color: "#16A34A", fontSize: "14px" }}>Estimated Delivery</strong>
                </div>
                <div style={estDateValStyle}>
                  {estDeliveryMin} – {estDeliveryMax}
                </div>
                <span style={estNoteStyle}>Standard Doorstep Delivery via {currentOrder.storeSnapshot?.storeName || settings?.store?.name || "Mellosoft"} Express</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT SUMMARY CARD & ACTIONS */}
        <div style={rightColStyle} className="confirmation-right-col">
          {/* PAYMENT SUMMARY (Must remain as a clean bordered card) */}
          <div style={summaryCardStyle} className="confirmation-summary-card">
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
          </div>

          {/* ACTION BUTTONS: Download Copy + View Orders in ONE row, Continue Shopping on separate row */}
          <div style={actionButtonsGroupStyle}>
            <div style={primaryActionRowStyle} className="confirmation-action-row">
              <div style={downloadColStyle} className="confirmation-download-col">
                <DownloadOrderPdf
                  order={currentOrder}
                  variant="primary"
                  label="Download Order Copy"
                  mobileLabel="Download Copy"
                  customBtnStyle={{
                    height: "46px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    padding: "0 10px"
                  }}
                />
              </div>

              <button
                onClick={() => navigateTo("orders")}
                style={viewOrdersBtnStyle}
                className="confirmation-view-orders-btn"
                type="button"
              >
                <ShoppingBag size={15} style={{ flexShrink: 0 }} />
                <span>View My Orders</span>
              </button>
            </div>

            <button
              onClick={() => navigateTo("catalog")}
              style={continueBtnStyle}
              className="confirmation-continue-btn"
              type="button"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inlined Style Tokens
const containerStyle = {
  maxWidth: "1600px",
  margin: "0 auto",
  padding: "36px 40px 72px 40px",
  width: "100%",
  boxSizing: "border-box"
};

const bannerCardStyle = {
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "0",
  padding: "16px 16px 28px 16px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  marginBottom: "28px",
  boxShadow: "none"
};

const iconBadgeStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  backgroundColor: "#16A34A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.25)",
  marginBottom: "4px"
};

const titleStyle = {
  fontSize: "32px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const subtitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#16A34A",
  margin: 0
};

const orderIdTagStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  padding: "6px 18px",
  borderRadius: "999px",
  fontSize: "13.5px",
  color: "#14151A",
  marginTop: "4px"
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.55fr 1fr",
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
  top: "100px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

// Section cards (Outer border removed)
const sectionCardStyle = {
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "0",
  padding: "0",
  boxShadow: "none"
};

const sectionHeadingStyle = {
  fontSize: "19px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 16px 0",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const itemsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const itemCardStyle = {
  display: "flex",
  gap: "16px",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  alignItems: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.02)"
};

const itemImageStyle = {
  width: "80px",
  height: "80px",
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
  fontSize: "15.5px",
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
  gap: "16px"
};

const addressBoxStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  padding: "18px"
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
  padding: "18px",
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
  fontSize: "18px",
  fontWeight: "800",
  color: "#16A34A"
};

const estNoteStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

// Payment Summary Card (Border preserved)
const summaryCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "20px",
  padding: "26px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const summaryTitleStyle = {
  fontSize: "19px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const paymentMetaBoxStyle = {
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "12px",
  padding: "14px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
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
  gap: "9px"
};

const rowItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13.5px"
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
  fontSize: "17px",
  fontWeight: "800",
  color: "#14151A"
};

const totalValStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const actionButtonsGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
  boxSizing: "border-box"
};

const primaryActionRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%"
};

const downloadColStyle = {
  flex: "0 1 42%",
  minWidth: "0"
};

const viewOrdersBtnStyle = {
  flex: "1 1 58%",
  minWidth: "0",
  height: "46px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "0 14px",
  fontSize: "13.5px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  transition: "all 0.18s ease"
};

const continueBtnStyle = {
  width: "100%",
  height: "46px",
  backgroundColor: "#FAFAF7",
  color: "#1B1F8C",
  border: "1.5px solid #1B1F8C",
  borderRadius: "999px",
  padding: "0 16px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  boxSizing: "border-box",
  transition: "all 0.18s ease"
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
