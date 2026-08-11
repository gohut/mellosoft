"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import EmptyState from "../components/EmptyState";
import { formatPrice } from "../utils/currency";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Package, 
  Calendar, 
  CreditCard, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck,
  AlertCircle
} from "lucide-react";

export default function OrdersView() {
  const { customerOrders, products, cancelOrder, navigateTo } = useStore();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Selected order details object
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return (customerOrders || []).find((o) => o.id === selectedOrderId);
  }, [customerOrders, selectedOrderId]);

  // Handle order cancellation with confirmation prompt
  const handleCancelOrder = (orderId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
    }
  };

  // If viewing a specific order's detail view
  if (selectedOrder) {
    const isCancellable = ["Pending", "Processing"].includes(selectedOrder.orderStatus);

    return (
      <div style={containerStyle} className="orders-detail-container">
        {/* Back Button */}
        <button onClick={() => setSelectedOrderId(null)} style={backBtnStyle} className="hover-lift">
          <ArrowLeft size={18} />
          <span>Back to My Orders</span>
        </button>

        {/* Order Details Header Card */}
        <div style={cardHeaderStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={orderIdLabelStyle}>Order #{selectedOrder.id}</div>
              <div style={orderDateStyle}>Placed on {selectedOrder.createdAt || selectedOrder.date}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
              <StatusBadge status={selectedOrder.orderStatus} type="order" />

              {isCancellable && (
                <button
                  onClick={(e) => handleCancelOrder(selectedOrder.id, e)}
                  style={cancelBtnStyle}
                  className="hover-lift"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={detailGridStyle}>
          {/* Left Column: Purchased Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={sectionCardStyle}>
              <h3 style={sectionHeadingStyle}>
                <Package size={18} color="#1B1F8C" />
                <span>Purchased Items ({(selectedOrder.items || []).length})</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {(selectedOrder.items || []).map((item, idx) => {
                  const prod = (products || []).find((p) => p.id === item.productId);
                  const pName = item.name || prod?.name || item.productId;
                  const pImage = item.image || prod?.images?.[0] || "/asset/img1.jpg";
                  const itemPrice = item.price ?? item.actualPrice ?? 0;
                  const itemTotal = itemPrice * (item.quantity || 1);

                  return (
                    <div key={idx} style={orderItemCardStyle}>
                      <img src={pImage} alt={pName} style={itemImageStyle} />
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={itemTitleStyle}>{pName}</h4>
                        
                        <div style={variantChipsWrapStyle}>
                          {item.variantSize && (
                            <span style={variantChipSizeStyle}>{item.variantSize}</span>
                          )}
                          {item.variantFirmness && item.variantFirmness !== "Standard" && (
                            <span style={variantChipFirmnessStyle}>{item.variantFirmness}</span>
                          )}
                          {item.variantSKU && (
                            <span style={variantChipSKUStyle}>{item.variantSKU}</span>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", flexWrap: "wrap", gap: "8px" }}>
                          <span style={qtyTextStyle}>Qty: <strong>{item.quantity || 1}</strong> × {formatPrice(itemPrice)}</span>
                          <span style={itemTotalStyle}>Item Total: {formatPrice(itemTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping & Payment Box */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div style={sectionCardStyle}>
                <h4 style={subHeadingStyle}>
                  <MapPin size={16} color="#1B1F8C" />
                  <span>Shipping Address</span>
                </h4>
                <div style={addressTextStyle}>
                  <strong>{selectedOrder.shippingAddress?.name || "Rahul Sharma"}</strong>
                  <br />
                  {selectedOrder.shippingAddress?.street || "123 Green Park Extension"}
                  <br />
                  {selectedOrder.shippingAddress?.city || "New Delhi"}, {selectedOrder.shippingAddress?.state || "Delhi"} - {selectedOrder.shippingAddress?.zip || "110016"}
                  <br />
                  <span style={{ color: "#6B6B75", fontSize: "12px", marginTop: "4px", display: "inline-block" }}>
                    Phone: {selectedOrder.shippingAddress?.phone || "+91 98765 43210"}
                  </span>
                </div>
              </div>

              <div style={sectionCardStyle}>
                <h4 style={subHeadingStyle}>
                  <CreditCard size={16} color="#1B1F8C" />
                  <span>Payment Information</span>
                </h4>
                <div style={addressTextStyle}>
                  <strong>Method:</strong> {selectedOrder.paymentMethod || "Credit Card (Visa ending in 4242)"}
                  <br />
                  <strong>Status:</strong> <span style={{ color: selectedOrder.paymentStatus === "Paid" ? "#16A34A" : "#D97706", fontWeight: 700 }}>{selectedOrder.paymentStatus || "Paid"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Calculation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={sectionCardStyle}>
              <h3 style={sectionHeadingStyle}>Order Summary</h3>

              <div style={summaryRowsWrapStyle}>
                <div style={summaryRowStyle}>
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                </div>
                
                {selectedOrder.delivery !== undefined && (
                  <div style={summaryRowStyle}>
                    <span>Shipping</span>
                    <span>{selectedOrder.delivery === 0 ? "FREE" : formatPrice(selectedOrder.delivery)}</span>
                  </div>
                )}

                <div style={{ ...summaryRowStyle, borderTop: "1px solid #E7E7E2", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#14151A" }}>Total Amount</span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#1B1F8C" }}>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div style={guaranteeBoxStyle}>
                <CheckCircle size={16} color="#16A34A" />
                <span>Includes Mellosoft 100-Night Risk-Free Trial Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If customer has zero orders, render EmptyState
  if (!customerOrders || customerOrders.length === 0) {
    return (
      <div style={emptyWrapperStyle}>
        <EmptyState
          iconType="cart"
          title="No orders yet"
          message="When you place an order, it will appear here. Explore our mattresses, pillows, and sleep accessories to get started."
          actionLabel="Start Shopping"
          onAction={() => navigateTo("catalog")}
        />
      </div>
    );
  }

  // Customer Orders List Page View
  return (
    <div style={containerStyle} className="orders-page-container">
      {/* Page Title & Subtitle */}
      <div style={headerTitleBoxStyle}>
        <h1 style={pageTitleStyle}>My Orders</h1>
        <p style={pageSubtitleStyle}>View and track your recent purchases and order history</p>
      </div>

      {/* Orders List Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {customerOrders.map((ord) => {
          const itemCount = (ord.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
          const isCancellable = ["Pending", "Processing"].includes(ord.orderStatus);

          return (
            <div key={ord.id} style={orderCardStyle} className="hover-lift">
              {/* Card Header Bar */}
              <div style={orderCardTopBarStyle}>
                <div>
                  <span style={orderIdTextStyle}>ORDER #{ord.id}</span>
                  <span style={orderCardDateStyle}>Placed on {ord.createdAt || ord.date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={ord.paymentStatus} type="payment" />
                  <StatusBadge status={ord.orderStatus} type="order" />
                </div>
              </div>

              {/* Card Body */}
              <div style={orderCardBodyStyle}>
                {/* Thumbnails Peek */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
                  {(ord.items || []).slice(0, 3).map((item, idx) => {
                    const prod = (products || []).find((p) => p.id === item.productId);
                    const img = item.image || prod?.images?.[0] || "/asset/img1.jpg";
                    return (
                      <img key={idx} src={img} alt={item.name} style={peekImageStyle} />
                    );
                  })}
                  {(ord.items || []).length > 3 && (
                    <span style={moreItemsBadgeStyle}>+{(ord.items || []).length - 3} more</span>
                  )}
                  
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#14151A", marginLeft: "6px" }}>
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 600 }}>Total Amount</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#1B1F8C" }}>{formatPrice(ord.totalAmount)}</div>
                  </div>

                  <button
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={viewDetailsBtnStyle}
                    className="hover-lift"
                  >
                    View Order Details
                  </button>

                  {isCancellable && (
                    <button
                      onClick={(e) => handleCancelOrder(ord.id, e)}
                      style={cancelOutlineBtnStyle}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STATUS BADGE COMPONENT ──────────────────────────────────────────────────
function StatusBadge({ status, type = "order" }) {
  let bg = "#F0F0EC";
  let color = "#6B6B75";
  let icon = <Clock size={12} />;

  if (status === "Delivered" || status === "Paid") {
    bg = "#DCFCE7";
    color = "#16A34A";
    icon = <CheckCircle size={12} />;
  } else if (status === "Shipped" || status === "Processing") {
    bg = "#EFF6FF";
    color = "#2563EB";
    icon = <Truck size={12} />;
  } else if (status === "Pending" || status === "Confirmed") {
    bg = "#FEF3C7";
    color = "#D97706";
    icon = <Clock size={12} />;
  } else if (status === "Cancelled" || status === "Failed" || status === "Refunded") {
    bg = "#FEE2E2";
    color = "#DC2626";
    icon = <XCircle size={12} />;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "20px",
        backgroundColor: bg,
        color: color,
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "capitalize"
      }}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "32px 24px 60px",
  width: "100%",
  boxSizing: "border-box"
};

const emptyWrapperStyle = {
  minHeight: "60vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px"
};

const headerTitleBoxStyle = {
  marginBottom: "32px"
};

const pageTitleStyle = {
  fontSize: "32px",
  fontWeight: 800,
  color: "#1B1F8C",
  margin: 0,
  letterSpacing: "-0.02em"
};

const pageSubtitleStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  marginTop: "6px"
};

const orderCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E7E7E2",
  overflow: "hidden",
  transition: "all 0.2s ease"
};

const orderCardTopBarStyle = {
  backgroundColor: "#FAFAF7",
  padding: "16px 20px",
  borderBottom: "1px solid #E7E7E2",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px"
};

const orderIdTextStyle = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#1B1F8C",
  marginRight: "12px"
};

const orderCardDateStyle = {
  fontSize: "13px",
  color: "#6B6B75"
};

const orderCardBodyStyle = {
  padding: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "20px"
};

const peekImageStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "10px",
  objectFit: "cover",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2"
};

const moreItemsBadgeStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#6B6B75",
  backgroundColor: "#F7F7F2",
  padding: "4px 8px",
  borderRadius: "8px"
};

const viewDetailsBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "10px 18px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer"
};

const cancelOutlineBtnStyle = {
  backgroundColor: "transparent",
  color: "#DC2626",
  border: "1px solid #FEE2E2",
  borderRadius: "10px",
  padding: "10px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer"
};

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  color: "#1B1F8C",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: "24px",
  padding: 0
};

const cardHeaderStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px"
};

const orderIdLabelStyle = {
  fontSize: "24px",
  fontWeight: 800,
  color: "#1B1F8C"
};

const orderDateStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  marginTop: "4px"
};

const cancelBtnStyle = {
  backgroundColor: "#FEE2E2",
  color: "#DC2626",
  border: "none",
  borderRadius: "10px",
  padding: "8px 14px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer"
};

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: "24px"
};

const sectionCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "24px"
};

const sectionHeadingStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#14151A",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const subHeadingStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#14151A",
  margin: "0 0 12px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const orderItemCardStyle = {
  display: "flex",
  gap: "16px",
  padding: "16px",
  backgroundColor: "#FAFAF7",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  alignItems: "flex-start"
};

const itemImageStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "10px",
  objectFit: "cover",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  flexShrink: 0
};

const itemTitleStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#14151A",
  margin: 0,
  lineHeight: 1.3
};

const variantChipsWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  marginTop: "8px"
};

const variantChipSizeStyle = {
  fontSize: "11px",
  fontWeight: 700,
  padding: "3px 9px",
  borderRadius: "20px",
  backgroundColor: "#E8E9F8",
  color: "#1B1F8C"
};

const variantChipFirmnessStyle = {
  fontSize: "11px",
  fontWeight: 600,
  padding: "3px 9px",
  borderRadius: "20px",
  backgroundColor: "#F0F0EC",
  color: "#6B6B75"
};

const variantChipSKUStyle = {
  fontSize: "10px",
  fontWeight: 500,
  padding: "3px 9px",
  borderRadius: "20px",
  backgroundColor: "#F0F0EC",
  color: "#9B9BA8",
  fontFamily: "monospace"
};

const qtyTextStyle = {
  fontSize: "13px",
  color: "#6B6B75"
};

const itemTotalStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#14151A"
};

const addressTextStyle = {
  fontSize: "13px",
  color: "#14151A",
  lineHeight: 1.6
};

const summaryRowsWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "16px"
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  color: "#6B6B75"
};

const guaranteeBoxStyle = {
  marginTop: "20px",
  padding: "12px",
  backgroundColor: "#DCFCE7",
  borderRadius: "10px",
  color: "#16A34A",
  fontSize: "12px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: "8px"
};
