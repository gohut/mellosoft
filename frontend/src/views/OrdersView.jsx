"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../context/StoreContext";
import EmptyState from "../components/EmptyState";
import { formatPrice } from "../utils/currency";
import DownloadOrderPdf from "../components/DownloadOrderPdf";
import { 
  buildInitialTrackingHistory, 
  formatTrackingTimestamp, 
  TRACKING_STAGES 
} from "../utils/trackingHelpers";
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
  AlertCircle,
  X
} from "lucide-react";

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const formatDateRange = (startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "";
  }

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  const enDash = "–";

  // Same year & Same month -> "Aug 22–26, 2026"
  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDay}${enDash}${endDay}, ${startYear}`;
  }

  // Same year, Different months -> "Aug 29–Sep 2, 2026"
  if (startYear === endYear) {
    return `${startMonth} ${startDay}${enDash}${endMonth} ${endDay}, ${startYear}`;
  }

  // Different years -> "Dec 30, 2026–Jan 3, 2027"
  return `${startMonth} ${startDay}, ${startYear}${enDash}${endMonth} ${endDay}, ${endYear}`;
};

const getOrderDeliveryLabel = (ord) => {
  if (!ord) return "";

  if (ord.orderStatus === "Delivered") {
    const d = ord.deliveredAt || ord.deliveredDate || ord.completedAt || ord.createdAt || ord.date;
    if (d) {
      const dateObj = new Date(d);
      if (!isNaN(dateObj.getTime())) {
        const formatted = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return `Delivered on: ${formatted}`;
      }
      return `Delivered on: ${d}`;
    }
    return "Delivered";
  }

  let startDate = ord.expectedDeliveryStart;
  let endDate = ord.expectedDeliveryEnd;

  if (!startDate || !endDate) {
    if (ord.expectedDelivery) {
      const targetDate = new Date(ord.expectedDelivery);
      if (!isNaN(targetDate.getTime())) {
        const start = new Date(targetDate.getTime() - 4 * 24 * 60 * 60 * 1000);
        startDate = start.toISOString().split("T")[0];
        endDate = targetDate.toISOString().split("T")[0];
      }
    }
  }

  if (!startDate || !endDate) {
    const baseDate = new Date(ord.createdAt || ord.date || Date.now());
    if (!isNaN(baseDate.getTime())) {
      const start = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const end = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    }
  }

  if (startDate && endDate) {
    const rangeText = formatDateRange(startDate, endDate);
    if (rangeText) {
      return `Expected Delivery: ${rangeText}`;
    }
  }

  return "Expected Delivery: 3–5 Business Days";
};

export default function OrdersView() {
  const { customerOrders, products, cancelOrder, navigateTo } = useStore();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "delivered"
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const activeOrders = useMemo(() => {
    return (customerOrders || []).filter((o) => o.orderStatus !== "Delivered");
  }, [customerOrders]);

  const deliveredOrders = useMemo(() => {
    return (customerOrders || []).filter((o) => o.orderStatus === "Delivered");
  }, [customerOrders]);

  // Selected order details object
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return (customerOrders || []).find((o) => o.id === selectedOrderId);
  }, [customerOrders, selectedOrderId]);

  // Selected tracking order object
  const trackingOrder = useMemo(() => {
    if (!trackingOrderId) return null;
    return (customerOrders || []).find((o) => o.id === trackingOrderId);
  }, [customerOrders, trackingOrderId]);

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

    const resolvedHistory = buildInitialTrackingHistory(selectedOrder);
    const STAGES = [
      { key: "Confirmed", label: "Order Confirmed", desc: "Your order has been placed and confirmed." },
      { key: "Processing", label: "Processing", desc: "Your order is being prepared and quality inspected." },
      { key: "Packed", label: "Packed", desc: "Items packaged safely and ready for carrier dispatch." },
      { key: "Shipped", label: "Shipped", desc: "Handed over to carrier partner. Package in transit." },
      { key: "Out for Delivery", label: "Out for Delivery", desc: "Out for delivery with local courier agent." },
      { key: "Delivered", label: "Delivered", desc: "Package delivered to destination address." }
    ];

    const currentStatus = selectedOrder.orderStatus || "Confirmed";
    const currentStatusNorm = currentStatus.toLowerCase();
    const isCancelled = ["cancelled", "failed"].includes(currentStatusNorm);

    let activeIdx = STAGES.findIndex(
      (s) => s.key.toLowerCase() === currentStatusNorm || s.label.toLowerCase() === currentStatusNorm
    );
    if (activeIdx === -1) {
      if (currentStatusNorm.includes("process")) activeIdx = 1;
      else if (currentStatusNorm.includes("pack")) activeIdx = 2;
      else if (currentStatusNorm.includes("ship")) activeIdx = 3;
      else if (currentStatusNorm.includes("delivery") || currentStatusNorm.includes("out")) activeIdx = 4;
      else if (currentStatusNorm.includes("deliver")) activeIdx = 5;
      else activeIdx = 0;
    }

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

              <DownloadOrderPdf order={selectedOrder} variant="outline" />

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

              {/* Inline Order Tracking Timeline directly inside Purchased Items Section */}
              <div style={inlineTrackingBoxStyle}>
                <div style={inlineTrackingHeaderRowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={inlineTruckBadgeStyle}>
                      <Truck size={16} color="#FFFFFF" />
                    </div>
                    <div>
                      <h4 style={inlineTrackingHeaderTitleStyle}>Order Tracking & Fulfillment Progress</h4>
                      <div style={inlineTrackingHeaderSubStyle}>
                        {selectedOrder.orderStatus === "Delivered"
                          ? `Delivered on ${selectedOrder.deliveredAt || selectedOrder.createdAt || selectedOrder.date}`
                          : `Expected Delivery: ${getOrderDeliveryLabel(selectedOrder) || "Aug 4–8, 2026"}`}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedOrder.orderStatus} type="order" />
                </div>

                <div style={{ marginTop: "18px" }}>
                  {isCancelled ? (
                    <div style={cancelledAlertStyle}>
                      <XCircle size={20} color="#DC2626" />
                      <div>
                        <strong style={{ fontSize: "14px", color: "#DC2626" }}>Order Cancelled</strong>
                        <p style={{ fontSize: "12px", color: "#6B6B75", margin: "2px 0 0" }}>
                          This order was cancelled. If you have questions, please reach out to customer support.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={inlineTimelineListStyle}>
                      {STAGES.map((stage, idx) => {
                        const isCompleted = idx < activeIdx;
                        const isActive = idx === activeIdx;
                        const isUpcoming = idx > activeIdx;

                        const historyEntry = resolvedHistory.find(
                          (h) => h.status.toLowerCase() === stage.key.toLowerCase() || h.status.toLowerCase() === stage.label.toLowerCase()
                        ) || (isCompleted || isActive ? resolvedHistory[idx] : null);

                        const timestampText = historyEntry ? formatTrackingTimestamp(historyEntry.timestamp) : "";
                        const descText = historyEntry?.description || stage.desc;

                        return (
                          <div key={stage.key} style={inlineStageRowStyle}>
                            <div style={inlineStageLeftStyle}>
                              <div
                                style={{
                                  ...inlineStageDotStyle,
                                  backgroundColor: isCompleted ? "#16A34A" : isActive ? "#1B1F8C" : "#F1F5F9",
                                  borderColor: isCompleted ? "#16A34A" : isActive ? "#1B1F8C" : "#CBD5E1",
                                  color: isCompleted || isActive ? "#FFFFFF" : "#94A3B8"
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle size={12} />
                                ) : isActive ? (
                                  <div style={inlineActiveDotInnerStyle} />
                                ) : (
                                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{idx + 1}</span>
                                )}
                              </div>

                              {idx < STAGES.length - 1 && (
                                <div
                                  style={{
                                    ...inlineStageLineStyle,
                                    backgroundColor: isCompleted ? "#16A34A" : "#E2E8F0",
                                    borderStyle: isUpcoming ? "dashed" : "solid"
                                  }}
                                />
                              )}
                            </div>

                            <div style={{ ...inlineStageRightStyle, opacity: isUpcoming ? 0.5 : 1 }}>
                              <div style={inlineStageTitleRowStyle}>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: isActive ? 800 : isCompleted ? 700 : 600,
                                    color: isActive ? "#1B1F8C" : isCompleted ? "#14151A" : "#64748B"
                                  }}
                                >
                                  {stage.label}
                                  {isActive && <span style={activeTagBadgeStyle}>Current Status</span>}
                                </span>

                                {timestampText ? (
                                  <span style={stageTimeTagStyle}>{timestampText}</span>
                                ) : (
                                  <span style={stagePendingTagStyle}>Pending</span>
                                )}
                              </div>

                              <p style={stageDescStyle}>{descText}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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


  const renderOrderCard = (ord) => {
    const itemCount = (ord.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
    const isCancellable = ["Pending", "Processing"].includes(ord.orderStatus);

    return (
      <div key={ord.id} style={orderCardStyle} className="hover-lift">
        {/* Card Header Bar */}
        <div style={orderCardTopBarStyle} className="orders-card-top-bar">
          <div>
            <span style={orderIdTextStyle}>ORDER #{ord.id}</span>
            <span style={orderCardDateStyle}>Placed on {ord.createdAt || ord.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="orders-card-top-bar-badges">
            <StatusBadge status={ord.paymentStatus} type="payment" />
            <StatusBadge status={ord.orderStatus} type="order" />
          </div>
        </div>

        {/* Card Body */}
        <div style={orderCardBodyStyle} className="orders-card-body">
          {/* Thumbnails Peek & Delivery Date */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", flex: 1 }} className="orders-card-left">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#14151A" }}>
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: ord.orderStatus === "Delivered" ? "#16A34A" : "#1B1F8C" }}>
                {getOrderDeliveryLabel(ord)}
              </div>
            </div>
          </div>

          {/* Amount & Stacked Actions */}
          <div className="orders-card-right">
            <div style={{ textAlign: "right" }} className="orders-card-total-box">
              <div style={{ fontSize: "11px", color: "#6B6B75", textTransform: "uppercase", fontWeight: 600 }}>Total Amount</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#1B1F8C" }}>{formatPrice(ord.totalAmount)}</div>
            </div>

            <div className="orders-card-btn-group">
              <button
                onClick={() => setSelectedOrderId(ord.id)}
                style={viewDetailsBtnStyle}
                className="hover-lift order-card-btn"
              >
                View Order Details
              </button>

              {isCancellable && (
                <button
                  onClick={(e) => handleCancelOrder(ord.id, e)}
                  style={cancelOutlineBtnStyle}
                  className="order-card-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Customer Orders List Page View
  return (
    <div style={containerStyle} className="orders-page-container">
      <style>{`
        .orders-card-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .orders-card-right {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 12px;
          min-width: 190px;
        }
        .orders-card-btn-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .order-card-btn {
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .orders-card-top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .orders-card-top-bar-badges {
            width: 100%;
            justify-content: flex-start !important;
          }
          .orders-card-body {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .orders-card-left {
            width: 100% !important;
            flex: none !important;
          }
          .orders-card-right {
            align-items: stretch !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .orders-card-total-box {
            text-align: left !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px dashed #E7E7E2;
          }
        }
      `}</style>

      {/* Page Title & Subtitle */}
      <div style={headerTitleBoxStyle}>
        <h1 style={pageTitleStyle}>My Orders</h1>
        <p style={pageSubtitleStyle}>View and track your recent purchases and order history.</p>
      </div>

      {/* Two-Option Tab Selector */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "28px" }}>
        <div style={tabSelectorContainerStyle}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              ...tabButtonStyle,
              ...(activeTab === "orders" ? activeTabStyle : inactiveTabStyle)
            }}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            style={{
              ...tabButtonStyle,
              ...(activeTab === "delivered" ? activeTabStyle : inactiveTabStyle)
            }}
          >
            Delivered Orders
          </button>
        </div>
      </div>

      {/* SECTION CONTENT BASED ON SELECTED TAB */}
      {activeTab === "orders" ? (
        <div>
          <h2 style={sectionHeaderStyle}>Orders</h2>
          {activeOrders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {activeOrders.map((ord) => renderOrderCard(ord))}
            </div>
          ) : (
            <div style={sectionEmptyCardStyle}>
              <p style={{ margin: 0, fontWeight: 600, color: "#14151A", fontSize: "15px" }}>No active orders</p>
              <p style={{ margin: "4px 0 0 0", color: "#6B6B75", fontSize: "13px" }}>Your ongoing orders will appear here.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 style={sectionHeaderStyle}>Delivered Orders</h2>
          {deliveredOrders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {deliveredOrders.map((ord) => renderOrderCard(ord))}
            </div>
          ) : (
            <div style={sectionEmptyCardStyle}>
              <p style={{ margin: 0, fontWeight: 600, color: "#14151A", fontSize: "15px" }}>No delivered orders</p>
              <p style={{ margin: "4px 0 0 0", color: "#6B6B75", fontSize: "13px" }}>Your completed orders will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Global Order Tracking Modal */}
      {showTrackModal && trackingOrder && (
        <OrderTrackingModal
          order={trackingOrder}
          products={products}
          onClose={() => {
            setShowTrackModal(false);
            setTrackingOrderId(null);
          }}
        />
      )}
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
  width: "100%",
  padding: "32px 48px 60px",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
  minHeight: "calc(100vh - 160px)",
};

const emptyWrapperStyle = {
  minHeight: "calc(100vh - 160px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
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
  cursor: "pointer",
  width: "100%",
  textAlign: "center",
  boxSizing: "border-box"
};

const cancelOutlineBtnStyle = {
  backgroundColor: "transparent",
  color: "#DC2626",
  border: "1px solid #FEE2E2",
  borderRadius: "10px",
  padding: "10px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  textAlign: "center",
  boxSizing: "border-box"
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

const sectionHeaderStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: "1px solid #E7E7E2"
};

const sectionEmptyCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "24px 32px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
};

const tabSelectorContainerStyle = {
  display: "inline-flex",
  backgroundColor: "#FAFAF7",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "4px",
  gap: "4px"
};

const tabButtonStyle = {
  padding: "10px 24px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  border: "none",
  transition: "all 0.2s ease",
  fontFamily: "inherit"
};

const activeTabStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(27, 31, 140, 0.25)"
};

const inactiveTabStyle = {
  backgroundColor: "transparent",
  color: "#1B1F8C"
};

// ─── ORDER TRACKING MODAL COMPONENT ───────────────────────────────────────
function OrderTrackingModal({ order, products, onClose }) {
  if (!order) return null;

  const resolvedHistory = useMemo(() => buildInitialTrackingHistory(order), [order]);

  const STAGES = [
    { key: "Confirmed", label: "Order Confirmed", desc: "Your order has been placed and confirmed." },
    { key: "Processing", label: "Processing", desc: "Your order is being prepared and quality inspected." },
    { key: "Packed", label: "Packed", desc: "Items packaged safely and ready for carrier dispatch." },
    { key: "Shipped", label: "Shipped", desc: "Handed over to carrier partner. Package in transit." },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Out for delivery with local courier agent." },
    { key: "Delivered", label: "Delivered", desc: "Package delivered to destination address." }
  ];

  const currentStatus = order.orderStatus || "Confirmed";
  const currentStatusNorm = currentStatus.toLowerCase();
  const isCancelled = ["cancelled", "failed"].includes(currentStatusNorm);

  let activeIdx = STAGES.findIndex(
    (s) => s.key.toLowerCase() === currentStatusNorm || s.label.toLowerCase() === currentStatusNorm
  );
  if (activeIdx === -1) {
    if (currentStatusNorm.includes("process")) activeIdx = 1;
    else if (currentStatusNorm.includes("pack")) activeIdx = 2;
    else if (currentStatusNorm.includes("ship")) activeIdx = 3;
    else if (currentStatusNorm.includes("delivery") || currentStatusNorm.includes("out")) activeIdx = 4;
    else if (currentStatusNorm.includes("deliver")) activeIdx = 5;
    else activeIdx = 0;
  }

  const items = order.items || [];

  return createPortal(
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={trackingCardModalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={trackingHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={truckIconWrapperStyle}>
              <Truck size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={trackingTitleStyle}>Track Order #{order.id}</h3>
              <p style={trackingSubTitleStyle}>
                Placed on {order.createdAt || order.date} • {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={closeIconBtnStyle} aria-label="Close tracking modal">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div style={trackingBodyContentStyle}>
          {/* Status Alert Banner */}
          <div style={statusBannerBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B6B75" }}>
                  Current Status
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#1B1F8C", marginTop: "2px" }}>
                  {order.orderStatus}
                </div>
              </div>
              <StatusBadge status={order.orderStatus} type="order" />
            </div>
          </div>

          {/* Purchased Items Peek */}
          {items.length > 0 && (
            <div style={itemPeekBoxStyle}>
              <div style={itemPeekHeadingStyle}>Package Items</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((item, idx) => {
                  const prod = (products || []).find((p) => p.id === item.productId);
                  const pName = item.name || prod?.name || item.productId;
                  const pImg = item.image || prod?.images?.[0] || "/asset/img1.jpg";
                  return (
                    <div key={idx} style={itemPeekRowStyle}>
                      <img src={pImg} alt={pName} style={itemPeekImgStyle} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={itemPeekNameStyle}>{pName}</div>
                        <div style={itemPeekMetaStyle}>
                          Qty: {item.quantity || item.qty || 1} • {item.variantSize || "Standard"}
                        </div>
                      </div>
                      <div style={itemPeekPriceStyle}>{formatPrice((item.price || item.actualPrice || 0) * (item.quantity || 1))}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          <div style={{ marginTop: "24px" }}>
            <h4 style={timelineHeadingStyle}>Fulfillment Timeline</h4>

            {isCancelled ? (
              <div style={cancelledAlertStyle}>
                <XCircle size={24} color="#DC2626" />
                <div>
                  <strong style={{ fontSize: "15px", color: "#DC2626" }}>Order Cancelled</strong>
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
                    This order was cancelled. If you have questions, please reach out to customer support.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", marginTop: "16px" }}>
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < activeIdx;
                  const isActive = idx === activeIdx;
                  const isUpcoming = idx > activeIdx;

                  const historyEntry = resolvedHistory.find(
                    (h) => h.status.toLowerCase() === stage.key.toLowerCase() || h.status.toLowerCase() === stage.label.toLowerCase()
                  ) || (isCompleted || isActive ? resolvedHistory[idx] : null);

                  const timestampText = historyEntry ? formatTrackingTimestamp(historyEntry.timestamp) : "";
                  const descText = historyEntry?.description || stage.desc;

                  return (
                    <div key={stage.key} style={stageRowStyle}>
                      {/* Left Dot and Line */}
                      <div style={stageLeftColStyle}>
                        <div
                          style={{
                            ...stageDotStyle,
                            backgroundColor: isCompleted ? "#16A34A" : isActive ? "#1B1F8C" : "#F1F5F9",
                            borderColor: isCompleted ? "#16A34A" : isActive ? "#1B1F8C" : "#CBD5E1",
                            color: isCompleted || isActive ? "#FFFFFF" : "#94A3B8"
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle size={14} />
                          ) : isActive ? (
                            <div style={activeDotInnerStyle} />
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: 700 }}>{idx + 1}</span>
                          )}
                        </div>

                        {idx < STAGES.length - 1 && (
                          <div
                            style={{
                              ...stageLineStyle,
                              backgroundColor: isCompleted ? "#16A34A" : "#E2E8F0",
                              borderStyle: isUpcoming ? "dashed" : "solid"
                            }}
                          />
                        )}
                      </div>

                      {/* Right Details */}
                      <div style={{ ...stageRightColStyle, opacity: isUpcoming ? 0.5 : 1 }}>
                        <div style={stageTitleRowStyle}>
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: isActive ? 800 : isCompleted ? 700 : 600,
                              color: isActive ? "#1B1F8C" : isCompleted ? "#14151A" : "#64748B"
                            }}
                          >
                            {stage.label}
                            {isActive && <span style={activeTagBadgeStyle}>Active Stage</span>}
                          </span>

                          {timestampText ? (
                            <span style={stageTimeTagStyle}>{timestampText}</span>
                          ) : (
                            <span style={stagePendingTagStyle}>Pending</span>
                          )}
                        </div>

                        <p style={stageDescStyle}>{descText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    typeof document !== "undefined" ? document.body : null
  );
}

// ─── TRACKING STYLES ──────────────────────────────────────────────────────────
const trackDetailBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "20px",
  padding: "8px 16px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const trackCardBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "20px",
  padding: "7px 14px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(2px)",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px"
};

const trackingCardModalStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  maxWidth: "600px",
  width: "100%",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  overflow: "hidden"
};

const trackingHeaderStyle = {
  padding: "20px 24px",
  borderBottom: "1px solid #E7E7E2",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#FAFAF7"
};

const truckIconWrapperStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  backgroundColor: "#1B1F8C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const trackingTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const trackingSubTitleStyle = {
  fontSize: "12px",
  color: "#6B6B75",
  margin: "2px 0 0 0"
};

const closeIconBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#6B6B75",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "50%"
};

const trackingBodyContentStyle = {
  padding: "24px",
  overflowY: "auto",
  flex: 1
};

const statusBannerBoxStyle = {
  backgroundColor: "#F8F9FC",
  borderRadius: "14px",
  padding: "16px 20px",
  border: "1px solid #E2E8F0",
  marginBottom: "20px"
};

const itemPeekBoxStyle = {
  backgroundColor: "#FAFAF7",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid #E7E7E2"
};

const itemPeekHeadingStyle = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75",
  marginBottom: "12px"
};

const itemPeekRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const itemPeekImgStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "8px",
  objectFit: "cover",
  backgroundColor: "#E7E7E2"
};

const itemPeekNameStyle = {
  fontSize: "13.5px",
  fontWeight: "700",
  color: "#14151A"
};

const itemPeekMetaStyle = {
  fontSize: "11.5px",
  color: "#6B6B75",
  marginTop: "2px"
};

const itemPeekPriceStyle = {
  fontSize: "13.5px",
  fontWeight: "700",
  color: "#1B1F8C"
};

const timelineHeadingStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "16px"
};

const stageRowStyle = {
  display: "flex",
  gap: "16px",
  minHeight: "72px"
};

const stageLeftColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "28px"
};

const stageDotStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  border: "2px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  flexShrink: 0
};

const activeDotInnerStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF"
};

const stageLineStyle = {
  width: "2px",
  flex: 1,
  margin: "4px 0",
  minHeight: "36px"
};

const stageRightColStyle = {
  flex: 1,
  paddingBottom: "20px"
};

const stageTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px"
};

const activeTagBadgeStyle = {
  marginLeft: "8px",
  fontSize: "11px",
  fontWeight: 700,
  backgroundColor: "rgba(27, 31, 140, 0.1)",
  color: "#1B1F8C",
  padding: "2px 8px",
  borderRadius: "10px"
};

const stageTimeTagStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748B"
};

const stagePendingTagStyle = {
  fontSize: "12px",
  color: "#94A3B8",
  fontStyle: "italic"
};

const stageDescStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  margin: "4px 0 0 0",
  lineHeight: "1.4"
};

const cancelledAlertStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  backgroundColor: "#FEE2E2",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "12px"
};

const inlineTrackingBoxStyle = {
  marginTop: "24px",
  padding: "20px",
  backgroundColor: "#FAFAF7",
  borderRadius: "14px",
  border: "1px solid #E7E7E2"
};

const inlineTrackingHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  borderBottom: "1px solid #E7E7E2",
  paddingBottom: "14px"
};

const inlineTruckBadgeStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#1B1F8C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const inlineTrackingHeaderTitleStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const inlineTrackingHeaderSubStyle = {
  fontSize: "12px",
  color: "#6B6B75",
  marginTop: "2px"
};

const inlineTimelineListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0px",
  marginTop: "12px"
};

const inlineStageRowStyle = {
  display: "flex",
  gap: "14px",
  minHeight: "64px"
};

const inlineStageLeftStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "24px"
};

const inlineStageDotStyle = {
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  border: "2px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  flexShrink: 0
};

const inlineActiveDotInnerStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF"
};

const inlineStageLineStyle = {
  width: "2px",
  flex: 1,
  margin: "3px 0",
  minHeight: "32px"
};

const inlineStageRightStyle = {
  flex: 1,
  paddingBottom: "16px"
};

const inlineStageTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px"
};


