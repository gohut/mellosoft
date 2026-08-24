"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { X, Package, User, Calendar, Hash, Search } from "lucide-react";
import { formatPrice } from "../../utils/currency";

const filterTabs = ["All", "Pending", "Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const PAYMENT_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"];
const ORDER_STATUS_OPTIONS = ["Pending", "Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function OrdersView() {
  const { orders, customers, products, updateOrder, hasPermission } = useAdmin();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const canEditOrders = hasPermission("orders", "update") || hasPermission("orders", "edit");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    let result = orders;

    // 1. Status tab filter
    if (activeFilter !== "All") {
      result = result.filter((o) => (o.orderStatus || "").toLowerCase() === activeFilter.toLowerCase());
    }

    // 2. Search query filter across Order ID, Customer Name/Email/Phone, Products, Payment, Status
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((o) => {
        const idMatch = (o.id || o.orderId || "").toLowerCase().includes(q);
        const cust = (customers || []).find((c) => c.id === o.customerId) || {};
        const custNameMatch = (o.customerName || cust.name || o.customer || "").toLowerCase().includes(q);
        const custEmailMatch = (o.email || cust.email || "").toLowerCase().includes(q);
        const custPhoneMatch = (o.phone || cust.phone || "").toLowerCase().includes(q);
        const payMethodMatch = (o.paymentMethod || "").toLowerCase().includes(q);
        const payStatusMatch = (o.paymentStatus || "").toLowerCase().includes(q);
        const orderStatusMatch = (o.orderStatus || "").toLowerCase().includes(q);

        let productMatch = false;
        if (Array.isArray(o.items)) {
          productMatch = o.items.some((i) =>
            (i.name || i.productName || i.productId || "").toLowerCase().includes(q)
          );
        } else if (Array.isArray(o.products)) {
          productMatch = o.products.some((p) => String(p).toLowerCase().includes(q));
        }

        return (
          idMatch ||
          custNameMatch ||
          custEmailMatch ||
          custPhoneMatch ||
          payMethodMatch ||
          payStatusMatch ||
          orderStatusMatch ||
          productMatch
        );
      });
    }

    return result;
  }, [orders, activeFilter, searchQuery, customers]);

  const columns = [
    { key: "id", label: "ORDER ID", nowrap: true, render: (val) => <span style={{ fontWeight: 600, color: "#1B1F8C" }}>{val}</span> },
    {
      key: "customerId", label: "CUSTOMER",
      render: (val, row) => {
        const cust = (customers || []).find((c) => c.id === val) || { name: row.customer || "Customer" };
        return <span style={{ fontWeight: 500 }}>{cust.name}</span>;
      },
    },
    {
      key: "items", label: "PRODUCTS",
      render: (val, row) => {
        let names = [];
        if (Array.isArray(val) && val.length > 0) {
          names = val.map((item) => {
            const p = (products || []).find((prod) => prod.id === item.productId);
            return p ? p.name : item.name || item.productId;
          });
        } else if (Array.isArray(row.products)) {
          names = row.products;
        } else {
          names = [row.products || "Product"];
        }
        return (
          <span style={{ fontSize: "13px", color: "#6B6B75" }}>
            {names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0]}
          </span>
        );
      },
    },
    { key: "totalAmount", label: "AMOUNT", nowrap: true, render: (val, row) => <span style={{ fontWeight: 600 }}>{formatPrice(val ?? row.amount)}</span> },
    { key: "paymentStatus", label: "PAYMENT", render: (val) => <StatusBadge status={val} /> },
    { key: "orderStatus", label: "STATUS", render: (val) => <StatusBadge status={val} /> },
    { key: "createdAt", label: "DATE", nowrap: true, render: (val, row) => val || row.date },
  ];

  const handleSaveOrder = (orderId, newPaymentStatus, newOrderStatus) => {
    const res = updateOrder(orderId, {
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
    });
    if (res?.success) {
      showToast(`Order #${orderId} updated successfully.`);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 99999,
          backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "adminFadeIn 0.25s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Top Search Bar & Counter Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
          <Search size={18} color="#6B6B75" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer, product, status..."
            style={{
              width: "100%",
              height: "44px",
              paddingLeft: "42px",
              paddingRight: searchQuery ? "38px" : "16px",
              borderRadius: "12px",
              border: "1px solid #E7E7E2",
              backgroundColor: "#FFFFFF",
              fontSize: "14px",
              color: "#14151A",
              boxSizing: "border-box",
              outline: "none"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                border: "none", background: "none", cursor: "pointer", color: "#6B6B75", padding: "4px"
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B6B75" }}>
          Showing {filteredOrders.length} of {orders?.length || 0} orders
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "4px", border: "1px solid #E7E7E2", flexWrap: "wrap" }}>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              height: "38px",
              padding: "0 18px",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: activeFilter === tab ? 600 : 500,
              color: activeFilter === tab ? "#FFFFFF" : "#6B6B75",
              backgroundColor: activeFilter === tab ? "#1B1F8C" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={(order) => setSelectedOrderId(order.id)}
        emptyMessage={
          searchQuery
            ? `No orders found matching "${searchQuery}". Try a different order ID, customer, or product.`
            : `No ${activeFilter.toLowerCase()} orders found.`
        }
      />

      {/* Order Details Modal loaded by Order ID */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          canEdit={canEditOrders}
          onClose={() => setSelectedOrderId(null)}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  );
}

// ─── ORDER DETAILS MODAL ──────────────────────────────────────────────────────
function OrderDetailsModal({ orderId, canEdit, onClose, onSave }) {
  const { orders, customers, products } = useAdmin();

  const order = useMemo(() => {
    return (orders || []).find((o) => o.id === orderId);
  }, [orders, orderId]);

  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "Paid");
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || "Delivered");

  // Lookup Customer by customerId
  const customer = useMemo(() => {
    if (!order) return null;
    return (customers || []).find((c) => c.id === order.customerId) || {
      name: order.customer || "Customer",
      email: order.email || "customer@example.com",
      phone: "+91 98765 43210",
      address: "123 Green Park Extension, Block B, New Delhi, Delhi 110016, India",
    };
  }, [customers, order]);

  // Resolve items against Product database
  const populatedItems = useMemo(() => {
    if (!order) return [];
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map((item) => {
        const prod = (products || []).find((p) => p.id === item.productId);
        return {
          id: item.productId,
          name: prod?.name || item.name || item.productName || item.productId,
          image: item.image || prod?.images?.[0] || "/asset/img1.jpg",
          size: item.size || item.variantSize || prod?.sizeOptions?.[0] || "Queen",
          firmness: item.firmness || item.variantFirmness || prod?.firmnessOptions?.[0] || "Medium",
          sku: item.sku || item.variantSKU || `MEL-${(item.size || "QUEEN").toUpperCase()}-${(item.firmness || "MEDIUM").toUpperCase()}`,
          qty: item.quantity || item.qty || 1,
          unitPrice: item.price || item.discountPrice || item.actualPrice || prod?.price || 0,
          totalPrice: (item.price || item.discountPrice || item.actualPrice || prod?.price || 0) * (item.quantity || item.qty || 1),
        };
      });
    }

    const rawNames = Array.isArray(order.products) ? order.products : [order.products || "Product"];
    return rawNames.map((pName) => {
      const matched = (products || []).find((p) => p.name.toLowerCase() === pName.toLowerCase());
      const unitPrice = matched ? matched.price : Math.round((order.totalAmount || order.amount || 0) / rawNames.length);
      return {
        id: matched?.id || pName,
        name: pName,
        image: matched?.images?.[0] || "/asset/img1.jpg",
        size: matched?.sizeOptions?.[0] || "Queen",
        firmness: matched?.firmnessOptions?.[0] || "Medium",
        sku: `MEL-${(matched?.sizeOptions?.[0] || "QUEEN").toUpperCase()}-${(matched?.firmnessOptions?.[0] || "MEDIUM").toUpperCase()}`,
        qty: 1,
        unitPrice,
        totalPrice: unitPrice,
      };
    });
  }, [order, products]);

  const grandTotal = useMemo(() => {
    return populatedItems.reduce((acc, item) => acc + item.totalPrice, 0) || order?.totalAmount || order?.amount || 0;
  }, [populatedItems, order]);

  if (!order || typeof document === "undefined") return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave(order.id, paymentStatus, orderStatus);
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Hash size={18} color="#1B1F8C" />
              <h4 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#14151A" }}>
                Order #{order.id}
              </h4>
            </div>
            <div style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} /> Placed on {order.createdAt || order.date}
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "calc(85vh - 130px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", backgroundColor: "#FAFAF7", padding: "16px", borderRadius: "12px", border: "1px solid #E7E7E2" }}>
            <div>
              <div style={labelHeader}>Total Amount</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1B1F8C", marginTop: "2px" }}>
                {formatPrice(grandTotal)}
              </div>
            </div>
            <div>
              <div style={labelHeader}>Payment Status</div>
              <div style={{ marginTop: "4px" }}>
                <StatusBadge status={paymentStatus} />
              </div>
            </div>
            <div>
              <div style={labelHeader}>Order Status</div>
              <div style={{ marginTop: "4px" }}>
                <StatusBadge status={orderStatus} />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div style={{ border: "1px solid #E7E7E2", borderRadius: "12px", padding: "16px", backgroundColor: "#FFFFFF" }}>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={16} color="#1B1F8C" /> Customer Details
            </h5>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#6B6B75", fontWeight: 500 }}>Customer Name:</span>
                <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>{customer.name}</div>
              </div>
              <div>
                <span style={{ color: "#6B6B75", fontWeight: 500 }}>Email Address:</span>
                <div style={{ color: "#4B5563", marginTop: "2px" }}>{customer.email}</div>
              </div>
              <div>
                <span style={{ color: "#6B6B75", fontWeight: 500 }}>Phone:</span>
                <div style={{ color: "#4B5563", marginTop: "2px" }}>{customer.phone || "+91 98765 43210"}</div>
              </div>
            </div>
          </div>

          {/* Ordered Products */}
          <div>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={16} color="#1B1F8C" /> Ordered Items ({populatedItems.length})
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {populatedItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FAFAF7" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#E7E7E2", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#14151A" }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px" }}>
                      Size: <strong>{item.size}</strong> &nbsp;|&nbsp; Firmness: <strong>{item.firmness}</strong>
                    </div>
                    {item.sku && (
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", fontFamily: "monospace" }}>SKU: {item.sku}</div>
                    )}
                    <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "4px" }}>
                      Qty: <strong>{item.qty}</strong> × {formatPrice(item.unitPrice)}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", textAlign: "right", flexShrink: 0 }}>
                    {formatPrice(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {(order.deliveryAddress || order.shippingAddress) && (() => {
            const addr = order.deliveryAddress || order.shippingAddress;
            return (
              <div style={{ border: "1px solid #E7E7E2", borderRadius: "12px", padding: "16px", backgroundColor: "#FFFFFF" }}>
                <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  📍 Delivery Address
                </h5>
                <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.7 }}>
                  <strong style={{ color: "#14151A" }}>{addr.fullName || addr.name}</strong><br />
                  {addr.addressLine1 || addr.street}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br />
                  {addr.city}, {addr.state} – {addr.pincode || addr.zip}<br />
                  {(addr.landmark) && <span>Landmark: {addr.landmark}<br /></span>}
                  📞 {addr.phone || order.phone}
                </div>
              </div>
            );
          })()}

          {/* Payment Breakdown */}
          <div style={{ border: "1px solid #E7E7E2", borderRadius: "12px", padding: "16px", backgroundColor: "#FFFFFF" }}>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={16} color="#1B1F8C" /> Payment Breakdown
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B6B75" }}>Subtotal</span>
                <span>{formatPrice(order.subtotal || grandTotal)}</span>
              </div>
              {Number(order.productDiscount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16A34A" }}>
                  <span>Product Discount</span>
                  <span>-{formatPrice(order.productDiscount)}</span>
                </div>
              )}
              {(Number(order.couponDiscount) > 0 || Number(order.discount) > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16A34A" }}>
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.couponDiscount || order.discount)}</span>
                </div>
              )}
              {(Number(order.gst) > 0 || Number(order.tax) > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6B6B75" }}>
                  <span>GST ({order.gstRate || 18}%)</span>
                  <span>{formatPrice(order.gst || order.tax)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6B6B75" }}>
                <span>Shipping</span>
                <span>{order.shipping === 0 || order.delivery === 0 ? "FREE" : formatPrice(order.shipping || order.delivery || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E7E7E2", paddingTop: "8px", marginTop: "4px", fontWeight: 700, fontSize: "15px", color: "#1B1F8C" }}>
                <span>Total Amount</span>
                <span>{formatPrice(order.totalAmount || order.total || grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Status Settings */}
          <div style={{ borderTop: "1px solid #E7E7E2", paddingTop: "16px" }}>
            <h5 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={16} color="#1B1F8C" /> Status Management
            </h5>

            {!canEdit && (
              <p style={{ fontSize: "12px", color: "#DC2626", margin: "0 0 12px" }}>
                Read-only permissions. Contact administrator to modify order statuses.
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  disabled={!canEdit}
                  style={selectStyle}
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  disabled={!canEdit}
                  style={selectStyle}
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={modalFooterStyle}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Close</button>
          {canEdit && (
            <button type="button" onClick={handleSave} style={primaryBtnStyle}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const backdropStyle = {
  position: "fixed", inset: 0, backgroundColor: "rgba(20, 21, 26, 0.5)",
  backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center",
  justifyContent: "center", padding: "16px",
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E7E7E2",
  width: "100%", maxWidth: "680px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  overflow: "hidden", animation: "adminScaleIn 0.2s ease-out",
};

const modalHeaderStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", borderBottom: "1px solid #E7E7E2", backgroundColor: "#FAFAF7",
};

const modalFooterStyle = {
  display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px",
  borderTop: "1px solid #E7E7E2", backgroundColor: "#FFFFFF",
};

const closeBtnStyle = {
  background: "none", border: "none", cursor: "pointer", color: "#6B6B75", display: "flex",
};

const primaryBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 20px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

const cancelBtnStyle = {
  height: "40px", padding: "0 18px", border: "1px solid #E7E7E2", borderRadius: "10px",
  backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#6B6B75", marginBottom: "6px", display: "block" };
const labelHeader = { fontSize: "11px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", letterSpacing: "0.05em" };
const selectStyle = {
  width: "100%", height: "40px", padding: "0 12px", border: "1px solid #E7E7E2", borderRadius: "10px",
  fontSize: "13px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none",
};
