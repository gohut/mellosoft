"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { X, Search, RotateCcw, ShoppingBag, DollarSign, TrendingUp, Package, Clock, Heart, ShoppingCart } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { normalizeCustomerId, matchCustomer } from "../../utils/customerHelpers";

export function getCustomerDisplayId(customer, index = 0) {
  if (!customer) return `CUS-0001`;
  return normalizeCustomerId(customer.customerId || customer.id || index + 1);
}

const filterSelectStyle = {
  width: "100%",
  height: "40px",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  padding: "0 12px",
  fontSize: "13px",
  color: "#14151A",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

export default function CustomersView() {
  const { customers, orders, products, wishlists, updateCustomerStatus, hasPermission } = useAdmin();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ordersFilter, setOrdersFilter] = useState("All");
  const [spendingFilter, setSpendingFilter] = useState("All");

  const canEditCustomers = hasPermission("customers", "edit");

  // Calculate dynamic customer table rows based strictly on customerId relationships
  const customerTableRows = useMemo(() => {
    return (customers || []).map((c, idx) => {
      const displayId = getCustomerDisplayId(c, idx);
      const custOrders = (orders || []).filter((o) => matchCustomer(o, c));
      const ordersCount = custOrders.length;
      const totalSpent = custOrders
        .filter((o) => o.orderStatus !== "Cancelled" && (o.paymentStatus === "Paid" || o.orderStatus === "Delivered" || o.orderStatus === "Processing" || o.orderStatus === "Shipped" || o.totalAmount > 0))
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        ...c,
        displayId,
        ordersCount,
        totalSpent,
      };
    });
  }, [customers, orders]);

  // Combined Filters Logic (AND)
  const filteredCustomers = useMemo(() => {
    return customerTableRows.filter((c) => {
      // 1. Search Query (Customer ID, Name, Email, Phone)
      const term = searchQuery.toLowerCase().trim();
      if (term) {
        const matchId = (c.displayId || "").toLowerCase().includes(term);
        const matchName = (c.name || "").toLowerCase().includes(term);
        const matchEmail = (c.email || "").toLowerCase().includes(term);
        const matchPhone = (c.phone || "").toLowerCase().includes(term);
        if (!matchId && !matchName && !matchEmail && !matchPhone) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "All") {
        if ((c.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // 3. Orders Filter
      if (ordersFilter !== "All") {
        const count = c.ordersCount || 0;
        if (ordersFilter === "0" && count !== 0) return false;
        if (ordersFilter === "1-2" && (count < 1 || count > 2)) return false;
        if (ordersFilter === "3-5" && (count < 3 || count > 5)) return false;
        if (ordersFilter === "6+" && count < 6) return false;
      }

      // 4. Spending Filter
      if (spendingFilter !== "All") {
        const spent = c.totalSpent || 0;
        if (spendingFilter === "0" && spent !== 0) return false;
        if (spendingFilter === "1-2000" && (spent < 1 || spent > 2000)) return false;
        if (spendingFilter === "2001-5000" && (spent < 2001 || spent > 5000)) return false;
        if (spendingFilter === "5001-10000" && (spent < 5001 || spent > 10000)) return false;
        if (spendingFilter === "10000+" && spent <= 10000) return false;
      }

      return true;
    });
  }, [customerTableRows, searchQuery, statusFilter, ordersFilter, spendingFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "All" ||
    ordersFilter !== "All" ||
    spendingFilter !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setOrdersFilter("All");
    setSpendingFilter("All");
  };

  const columns = [
    {
      key: "displayId",
      label: "CUSTOMER ID",
      nowrap: true,
      render: (val, row, idx) => {
        const idText = val || row.displayId || getCustomerDisplayId(row, idx);
        return (
          <span style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontWeight: 700,
            color: "#1B1F8C",
            backgroundColor: "#EEF0FF",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            letterSpacing: "0.02em",
            display: "inline-block"
          }}>
            {idText}
          </span>
        );
      },
    },
    {
      key: "name",
      label: "NAME",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            backgroundColor: "#E8E9F8", color: "#1B1F8C", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700,
            flexShrink: 0, overflow: "hidden"
          }}>
            {row.avatar && (row.avatar.startsWith("/") || row.avatar.startsWith("http")) ? (
              <img src={row.avatar} alt={val} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : row.profileImage ? (
              <img src={row.profileImage} alt={val} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              row.avatar || (val ? val.charAt(0).toUpperCase() : "C")
            )}
          </div>
          <span style={{ fontWeight: 600, color: "#14151A" }}>{val}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      render: (val) => <span style={{ color: "#6B6B75", fontSize: "13px" }}>{val}</span>
    },
    { key: "phone", label: "PHONE", nowrap: true },
    {
      key: "ordersCount",
      label: "ORDERS",
      align: "center",
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      key: "totalSpent",
      label: "SPENDING",
      nowrap: true,
      render: (val) => <span style={{ fontWeight: 600, color: "#16A34A" }}>{formatPrice(val)}</span>
    },
    {
      key: "status",
      label: "STATUS",
      render: (val) => <StatusBadge status={val} />
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Customer Management</h3>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>
          {hasActiveFilters ? (
            <>Showing <strong style={{ color: "#1B1F8C" }}>{filteredCustomers.length}</strong> of {customerTableRows.length} registered customers</>
          ) : (
            <>{customerTableRows.length} registered customers</>
          )}
        </p>
      </div>

      {/* Customer Filters Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        backgroundColor: "#FFFFFF",
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1px solid #E7E7E2",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}>
        {/* Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#F7F7F2",
          border: "1px solid #E7E7E2",
          borderRadius: "8px",
          padding: "0 12px",
          height: "40px",
          flex: "1 1 240px",
          minWidth: "200px"
        }}>
          <Search size={16} color="#6B6B75" />
          <input
            type="text"
            placeholder="Search customers (ID, name, email, phone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              backgroundColor: "transparent",
              outline: "none",
              width: "100%",
              fontSize: "13px",
              color: "#14151A"
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}
            >
              <X size={14} color="#6B6B75" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div style={{ flex: "0 1 auto", minWidth: "130px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Orders Filter */}
        <div style={{ flex: "0 1 auto", minWidth: "140px" }}>
          <select
            value={ordersFilter}
            onChange={(e) => setOrdersFilter(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="All">Orders: All</option>
            <option value="0">0 Orders</option>
            <option value="1-2">1–2 Orders</option>
            <option value="3-5">3–5 Orders</option>
            <option value="6+">6+ Orders</option>
          </select>
        </div>

        {/* Spending Filter */}
        <div style={{ flex: "0 1 auto", minWidth: "160px" }}>
          <select
            value={spendingFilter}
            onChange={(e) => setSpendingFilter(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="All">Spending: All</option>
            <option value="0">₹0</option>
            <option value="1-2000">₹1 – ₹2,000</option>
            <option value="2001-5000">₹2,001 – ₹5,000</option>
            <option value="5001-10000">₹5,001 – ₹10,000</option>
            <option value="10000+">₹10,000+</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "40px",
              padding: "0 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              border: "1px solid #E7E7E2",
              backgroundColor: "#F7F7F2",
              color: "#4B5563",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Relational Customers Table with Empty State */}
      {filteredCustomers.length === 0 ? (
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E7E7E2",
          padding: "48px 24px",
          textAlign: "center",
          color: "#6B6B75"
        }}>
          <Search size={36} color="#9CA3AF" style={{ marginBottom: "12px" }} />
          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: "0 0 6px" }}>
            No matching customers found
          </h4>
          <p style={{ fontSize: "13px", color: "#6B6B75", margin: "0 0 16px" }}>
            Try changing or resetting your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              border: "1px solid #1B1F8C",
              backgroundColor: "#EEF0FF",
              color: "#1B1F8C",
              cursor: "pointer"
            }}
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCustomers}
          onRowClick={(cust) => setSelectedCustomerId(cust.id)}
          emptyMessage="No customers found."
        />
      )}

      {/* Customer Profile Modal loaded via customerId */}
      {selectedCustomerId && (
        <CustomerDetailsModal
          customerId={selectedCustomerId}
          canEdit={canEditCustomers}
          onClose={() => setSelectedCustomerId(null)}
          onStatusToggle={updateCustomerStatus}
        />
      )}
    </div>
  );
}

// ─── CUSTOMER DETAILS MODAL (FETCHED BY CUSTOMER ID) ──────────────────────────
function CustomerDetailsModal({ customerId, canEdit, onClose, onStatusToggle }) {
  const { customers, orders, wishlists, carts, products } = useAdmin();

  // Tab State: "info" | "orders" | "cart" | "wishlist"
  const [activeSection, setActiveSection] = useState("info");

  // Load customer record strictly from central state via customerId
  const customer = useMemo(() => {
    return (customers || []).find((c) =>
      matchCustomer({ customerId }, c) || c.id === customerId || c.customerId === customerId
    );
  }, [customers, customerId]);

  // Find all orders belonging to this customerId
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return (orders || [])
      .filter((o) => matchCustomer(o, customer))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [orders, customer]);

  // Find all wishlist entries belonging to this customerId
  const customerWishlistEntries = useMemo(() => {
    if (!customer) return [];
    return (wishlists || []).filter((w) => matchCustomer(w, customer));
  }, [wishlists, customer]);

  // Resolve products for wishlist entries
  const resolvedWishlistProducts = useMemo(() => {
    return customerWishlistEntries
      .map((w) => products.find((p) => p.id === w.productId || p.slug === w.productId))
      .filter(Boolean);
  }, [customerWishlistEntries, products]);

  // Find all cart items belonging to this customer
  const customerCartItems = useMemo(() => {
    if (!customer) return [];
    return (carts || []).filter((c) => matchCustomer(c, customer));
  }, [carts, customer]);

  // Calculate cart subtotal: sum of (discountPrice × quantity) per item
  const cartSubtotal = useMemo(() => {
    return customerCartItems.reduce((sum, item) => {
      const discountPrice = calculateDiscountedPrice(item.actualPrice, item.discountPercent ?? 0);
      return sum + discountPrice * (item.quantity || 1);
    }, 0);
  }, [customerCartItems]);

  // Calculate overall purchase metrics dynamically from customer's actual orders
  const metrics = useMemo(() => {
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders
      .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    const lastOrderDate = customerOrders[0]?.createdAt || customerOrders[0]?.date || "N/A";

    let totalItemsPurchased = 0;
    let deliveredCount = 0;
    let processingCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    const itemFreqMap = {};

    customerOrders.forEach((ord) => {
      if (ord.orderStatus === "Delivered") deliveredCount++;
      else if (ord.orderStatus === "Processing") processingCount++;
      else if (ord.orderStatus === "Pending") pendingCount++;
      else if (ord.orderStatus === "Cancelled") cancelledCount++;

      (ord.items || []).forEach((item) => {
        const qty = item.quantity || 1;
        totalItemsPurchased += qty;
        const pObj = products.find((p) => p.id === item.productId);
        const pName = pObj?.name || item.name || item.productId;
        itemFreqMap[pName] = (itemFreqMap[pName] || 0) + qty;
      });
    });

    let mostPurchasedProduct = "N/A";
    let maxQty = 0;
    Object.entries(itemFreqMap).forEach(([pName, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        mostPurchasedProduct = pName;
      }
    });

    const firstItemOfRecentOrder = customerOrders[0]?.items?.[0];
    const mostRecentProductObj = products.find((p) => p.id === firstItemOfRecentOrder?.productId);
    const mostRecentProduct = mostRecentProductObj?.name || firstItemOfRecentOrder?.name || "N/A";

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      totalItemsPurchased,
      lastOrderDate,
      deliveredCount,
      processingCount,
      pendingCount,
      cancelledCount,
      mostPurchasedProduct,
      mostRecentProduct,
    };
  }, [customerOrders, products]);

  if (!customer || typeof document === "undefined") return null;

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              backgroundColor: "#E8E9F8", color: "#1B1F8C", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700,
              flexShrink: 0, overflow: "hidden",
            }}>
              {customer.avatar && (customer.avatar.startsWith("/") || customer.avatar.startsWith("http")) ? (
                <img src={customer.avatar} alt={customer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : customer.profileImage ? (
                <img src={customer.profileImage} alt={customer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                customer.avatar || (customer.name ? customer.name.charAt(0).toUpperCase() : "C")
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#14151A" }}>
                  {customer.name}
                </h4>
                <span style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontWeight: 700,
                  color: "#1B1F8C",
                  backgroundColor: "#EEF0FF",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  {customer.customerId || getCustomerDisplayId(customer)}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span>{customer.email}</span>
                <span>•</span>
                <span>{customer.phone || "No phone"}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <StatusBadge status={customer.status} />
            <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div style={tabNavContainerStyle}>
          <button
            type="button"
            onClick={() => setActiveSection("info")}
            style={{
              ...tabBtnStyle,
              ...(activeSection === "info" ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Info
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("orders")}
            style={{
              ...tabBtnStyle,
              ...(activeSection === "orders" ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Order History ({customerOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("cart")}
            style={{
              ...tabBtnStyle,
              ...(activeSection === "cart" ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Cart ({customerCartItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("wishlist")}
            style={{
              ...tabBtnStyle,
              ...(activeSection === "wishlist" ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Wishlist ({resolvedWishlistProducts.length})
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "calc(85vh - 170px)", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SECTION 0: CUSTOMER INFO */}
          {activeSection === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h5 style={sectionTitle}>Customer Information</h5>

              {/* Profile Summary Card */}
              <div style={{
                backgroundColor: "#FAFAF7",
                borderRadius: "12px",
                border: "1px solid #E7E7E2",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "#E8E9F8",
                  color: "#1B1F8C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: "hidden",
                }}>
                  {customer.avatar && (customer.avatar.startsWith("/") || customer.avatar.startsWith("http")) ? (
                    <img src={customer.avatar} alt={customer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : customer.profileImage ? (
                    <img src={customer.profileImage} alt={customer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    customer.avatar || (customer.name ? customer.name.charAt(0).toUpperCase() : "C")
                  )}
                </div>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>
                    {customer.name || "Not available"}
                  </h4>
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
                    {customer.email || "Not available"}
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: "2px 0 0" }}>
                    {customer.phone || "Not available"}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusBadge status={customer.status || "Active"} />
                </div>
              </div>

              {/* Personal Information Card */}
              <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E7E7E2",
                padding: "20px",
              }}>
                <h6 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 16px" }}>
                  Personal Information
                </h6>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  fontSize: "13px",
                }}>
                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Full Name</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.name || "Not available"}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Email Address</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.email || "Not available"}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Phone Number</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.phone || "Not available"}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Customer ID</span>
                    <div style={{ fontWeight: 600, color: "#1B1F8C", marginTop: "4px" }}>
                      {getCustomerDisplayId(customer)}
                    </div>
                  </div>

                  {customer.dob && (
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Date of Birth</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.dob}
                      </div>
                    </div>
                  )}

                  {customer.gender && (
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Gender</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.gender}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information Card */}
              <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E7E7E2",
                padding: "20px",
              }}>
                <h6 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 16px" }}>
                  Account Information
                </h6>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  fontSize: "13px",
                }}>
                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Registered On</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.createdAt || customer.date || "Not available"}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Last Activity</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.lastLogin || customer.lastActivity || "Not available"}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Account Status</span>
                    <div style={{ marginTop: "4px" }}>
                      {canEdit ? (
                        <button
                          onClick={() => onStatusToggle(customer.id, customer.status === "Active" ? "Inactive" : "Active")}
                          style={{
                            border: "none", background: "none", cursor: "pointer", padding: 0,
                            fontSize: "13px", fontWeight: 600, color: customer.status === "Active" ? "#16A34A" : "#DC2626",
                            textDecoration: "underline",
                          }}
                          title="Click to toggle customer status"
                        >
                          {customer.status || "Active"} (Toggle)
                        </button>
                      ) : (
                        <StatusBadge status={customer.status || "Active"} />
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Account Type</span>
                    <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                      {customer.role || "Customer"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information Card */}
              <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E7E7E2",
                padding: "20px",
              }}>
                <h6 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 16px" }}>
                  Address Information {Array.isArray(customer.savedAddresses) && customer.savedAddresses.length > 0 ? `(${customer.savedAddresses.length})` : ""}
                </h6>
                {Array.isArray(customer.savedAddresses) && customer.savedAddresses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {customer.savedAddresses.map((addr, aIdx) => (
                      <div
                        key={addr.id || aIdx}
                        style={{
                          backgroundColor: "#FAFAF7",
                          border: "1px solid #E7E7E2",
                          borderRadius: "10px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: "#1B1F8C",
                            textTransform: "uppercase"
                          }}>
                            {addr.label || "HOME"}
                          </span>
                          {addr.isDefault && (
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#16A34A",
                              backgroundColor: "rgba(22,163,74,0.1)",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              border: "1px solid rgba(22,163,74,0.2)"
                            }}>
                              Default
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "13.5px", color: "#14151A", lineHeight: "1.7", margin: 0 }}>
                          <strong>{addr.fullName || customer.name}</strong><br />
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}{addr.landmark ? ` - ${addr.landmark}` : ""}<br />
                          {addr.city}, {addr.state} - {addr.postalCode || addr.pincode}<br />
                          {addr.country || "India"}<br />
                          Phone: {addr.phone || customer.phone || "Not available"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (customer.address || customer.city || customer.state || customer.pincode || customer.country) ? (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    fontSize: "13px",
                  }}>
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Address</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.address || "Not available"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>City</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.city || "Not available"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>State</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.state || "Not available"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Country</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.country || "Not available"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Pincode / Zip</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "4px" }}>
                        {customer.pincode || customer.zip || "Not available"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>
                    Address information not available.
                  </p>
                )}
              </div>
            </div>
          )}
          {activeSection === "orders" && (
            <>
              {/* Customer Registration & Status Meta Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", backgroundColor: "#FAFAF7", padding: "14px 16px", borderRadius: "12px", border: "1px solid #E7E7E2", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Registered On</span>
                  <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>{customer.createdAt || "2026-01-15"}</div>
                </div>
                <div>
                  <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Last Activity</span>
                  <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>{customer.lastLogin || "Recent"}</div>
                </div>
                <div>
                  <span style={{ color: "#6B6B75", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Account Status</span>
                  <div style={{ marginTop: "2px" }}>
                    {canEdit ? (
                      <button
                        onClick={() => onStatusToggle(customer.id, customer.status === "Active" ? "Inactive" : "Active")}
                        style={{
                          border: "none", background: "none", cursor: "pointer", padding: 0,
                          fontSize: "13px", fontWeight: 600, color: customer.status === "Active" ? "#16A34A" : "#DC2626",
                          textDecoration: "underline",
                        }}
                        title="Click to toggle customer status"
                      >
                        {customer.status} (Toggle)
                      </button>
                    ) : (
                      <span style={{ fontWeight: 600, color: customer.status === "Active" ? "#16A34A" : "#DC2626" }}>{customer.status}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Purchase Summary Cards */}
              <div>
                <h5 style={sectionTitle}>Overall Purchase Summary</h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                  <div style={summaryCardStyle}>
                    <ShoppingBag size={18} color="#1B1F8C" style={{ marginBottom: "6px" }} />
                    <div style={summaryValStyle}>{metrics.totalOrders}</div>
                    <div style={summaryLblStyle}>Total Orders</div>
                  </div>

                  <div style={summaryCardStyle}>
                    <DollarSign size={18} color="#16A34A" style={{ marginBottom: "6px" }} />
                    <div style={summaryValStyle}>{formatPrice(metrics.totalSpent)}</div>
                    <div style={summaryLblStyle}>Total Spent</div>
                  </div>

                  <div style={summaryCardStyle}>
                    <TrendingUp size={18} color="#D97706" style={{ marginBottom: "6px" }} />
                    <div style={summaryValStyle}>{formatPrice(metrics.avgOrderValue)}</div>
                    <div style={summaryLblStyle}>Avg Order Value</div>
                  </div>

                  <div style={summaryCardStyle}>
                    <Package size={18} color="#4F46E5" style={{ marginBottom: "6px" }} />
                    <div style={summaryValStyle}>{metrics.totalItemsPurchased}</div>
                    <div style={summaryLblStyle}>Items Purchased</div>
                  </div>

                  <div style={summaryCardStyle}>
                    <Clock size={18} color="#6B6B75" style={{ marginBottom: "6px" }} />
                    <div style={{ ...summaryValStyle, fontSize: "13px" }}>{metrics.lastOrderDate}</div>
                    <div style={summaryLblStyle}>Last Order</div>
                  </div>
                </div>
              </div>

              {/* Customer Purchase Insights */}
              {customerOrders.length > 0 && (
                <div style={{ border: "1px solid #E7E7E2", borderRadius: "12px", padding: "16px", backgroundColor: "#FFFFFF" }}>
                  <h5 style={{ ...sectionTitle, margin: "0 0 12px" }}>Purchase Insights</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "#6B6B75" }}>Most Purchased Product:</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>{metrics.mostPurchasedProduct}</div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75" }}>Most Recent Product:</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>{metrics.mostRecentProduct}</div>
                    </div>
                    <div>
                      <span style={{ color: "#6B6B75" }}>Order Status Breakdown:</span>
                      <div style={{ fontWeight: 600, color: "#14151A", marginTop: "2px" }}>
                        <span style={{ color: "#16A34A" }}>{metrics.deliveredCount} Delivered</span> •{" "}
                        <span style={{ color: "#D97706" }}>{metrics.processingCount + metrics.pendingCount} Pending/Processing</span> •{" "}
                        <span style={{ color: "#DC2626" }}>{metrics.cancelledCount} Cancelled</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Cards List */}
              <div>
                <h5 style={sectionTitle}>Orders ({customerOrders.length})</h5>
                {customerOrders.length === 0 ? (
                  <div style={emptyBoxStyle}>No orders found for this customer.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {customerOrders.map((ord) => (
                      <div key={ord.id} style={{ border: "1px solid #E7E7E2", borderRadius: "12px", padding: "14px", backgroundColor: "#FAFAF7" }}>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid #E7E7E2", paddingBottom: "10px", marginBottom: "10px" }}>
                          <div>
                            <span style={{ fontWeight: 700, color: "#1B1F8C", fontSize: "14px" }}>Order #{ord.id}</span>
                            <span style={{ fontSize: "12px", color: "#6B6B75", marginLeft: "10px" }}>{ord.createdAt || ord.date}</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <StatusBadge status={ord.paymentStatus} />
                            <StatusBadge status={ord.orderStatus} />
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(ord.items || []).map((item, idx) => {
                            const pObj = products.find((p) => p.id === item.productId);
                            const pName = pObj?.name || item.name || item.productId;
                            return (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                <div>
                                  <span style={{ fontWeight: 600, color: "#14151A" }}>{pName}</span>
                                  <span style={{ color: "#6B6B75", marginLeft: "8px", fontSize: "12px" }}>
                                    {item.variantSize || "Queen"} / {item.variantFirmness || "Medium"} × {item.quantity || 1}
                                  </span>
                                </div>
                                <div style={{ fontWeight: 600, color: "#14151A" }}>
                                  {formatPrice((item.price || 0) * (item.quantity || 1))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Amount */}
                        <div style={{ borderTop: "1px dashed #E7E7E2", marginTop: "10px", paddingTop: "8px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "#6B6B75" }}>Total Amount:</span>
                          <span style={{ fontWeight: 700, fontSize: "15px", color: "#1B1F8C" }}>
                            {formatPrice(ord.totalAmount || ord.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SECTION 2: CART */}
          {activeSection === "cart" && (
            <div>
              <h5 style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: "6px" }}>
                <ShoppingCart size={16} color="#1B1F8C" /> Customer Cart ({customerCartItems.length})
              </h5>

              {customerCartItems.length === 0 ? (
                <div style={{ ...emptyBoxStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "40px 20px" }}>
                  <ShoppingCart size={32} color="#CBD5E1" />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>This customer&apos;s cart is empty.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {customerCartItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const productName = prod?.name || item.productId;
                    const productImage = prod?.images?.[0] || "/asset/img1.jpg";
                    const discountPrice = calculateDiscountedPrice(item.actualPrice, item.discountPercent ?? 0);
                    const itemTotal = discountPrice * (item.quantity || 1);
                    const hasVariant = item.variantSize || item.variantFirmness;

                    const stockColors = {
                      "Out of Stock": { bg: "#FEE2E2", color: "#DC2626" },
                      "Low Stock":    { bg: "#FEF3C7", color: "#D97706" },
                      "In Stock":     { bg: "#DCFCE7", color: "#16A34A" },
                    };
                    const stockStyle = stockColors[item.stockStatus] || stockColors["In Stock"];

                    return (
                      <div key={item.cartItemId} style={{
                        border: "1px solid #E7E7E2",
                        borderRadius: "12px",
                        padding: "14px",
                        backgroundColor: "#FAFAF7",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                      }}>
                        {/* Product Image */}
                        <img
                          src={productImage}
                          alt={productName}
                          style={{
                            width: "64px", height: "64px", borderRadius: "8px",
                            objectFit: "cover", backgroundColor: "#F0F0EC", flexShrink: 0,
                            border: "1px solid #E7E7E2",
                          }}
                        />

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", lineHeight: 1.3 }}>
                              {productName}
                            </div>
                            {item.stockStatus && item.stockStatus !== "In Stock" && (
                              <span style={{
                                fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                                borderRadius: "20px", flexShrink: 0,
                                backgroundColor: stockStyle.bg, color: stockStyle.color,
                                textTransform: "uppercase", letterSpacing: "0.04em",
                              }}>
                                {item.stockStatus}
                              </span>
                            )}
                          </div>

                          {/* Variant Info */}
                          {hasVariant && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                              {item.variantSize && (
                                <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", backgroundColor: "#E8E9F8", color: "#1B1F8C" }}>
                                  {item.variantSize}
                                </span>
                              )}
                              {item.variantFirmness && item.variantFirmness !== "Standard" && (
                                <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", backgroundColor: "#F0F0EC", color: "#6B6B75" }}>
                                  {item.variantFirmness}
                                </span>
                              )}
                              {item.variantSKU && (
                                <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "20px", backgroundColor: "#F0F0EC", color: "#9B9BA8", fontFamily: "monospace" }}>
                                  {item.variantSKU}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Pricing Row */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "11px", color: "#9B9BA8", textDecoration: "line-through" }}>
                              {formatPrice(item.actualPrice)}
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B1F8C" }}>
                              {formatPrice(discountPrice)}
                            </span>
                            {item.discountPercent > 0 && (
                              <span style={{ fontSize: "10px", fontWeight: 700, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 6px", borderRadius: "20px" }}>
                                -{item.discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Quantity & Item Total */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                            <span style={{ fontSize: "12px", color: "#6B6B75" }}>
                              Qty: <strong style={{ color: "#14151A" }}>{item.quantity || 1}</strong>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#14151A" }}>
                              Item Total: {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Cart Subtotal */}
                  <div style={{
                    display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px",
                    padding: "14px 18px", backgroundColor: "#F0F0FC",
                    borderRadius: "10px", border: "1px solid #D1D4F0", marginTop: "8px",
                  }}>
                    <span style={{ fontSize: "13px", color: "#6B6B75", fontWeight: 600 }}>Cart Subtotal ({customerCartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items):</span>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#1B1F8C" }}>
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: WISHLIST */}
          {activeSection === "wishlist" && (
            <div>
              <h5 style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: "6px" }}>
                <Heart size={16} color="#DC2626" /> Customer Wishlist ({resolvedWishlistProducts.length})
              </h5>

              {resolvedWishlistProducts.length === 0 ? (
                <div style={{ ...emptyBoxStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "40px 20px" }}>
                  <Heart size={32} color="#CBD5E1" />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>This customer has no items in their wishlist.</span>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                  {resolvedWishlistProducts.map((prod) => (
                    <div key={prod.id} style={{ border: "1px solid #E7E7E2", borderRadius: "10px", padding: "14px", backgroundColor: "#FFFFFF", display: "flex", gap: "12px", alignItems: "center" }}>
                      <img
                        src={prod.images?.[0] || "/asset/img1.jpg"}
                        alt={prod.name}
                        style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#FAFAF7", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prod.name}
                        </div>
                        {prod.category && (
                          <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>{prod.category}</div>
                        )}
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1B1F8C", marginTop: "4px" }}>
                          {formatPrice(prod.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={modalFooterStyle}>
          <button type="button" onClick={onClose} style={primaryBtnStyle}>Close Profile</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const backdropStyle = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.12)",
  backdropFilter: "none", WebkitBackdropFilter: "none", filter: "none",
  zIndex: 1000, display: "flex", alignItems: "center",
  justifyContent: "center", padding: "16px",
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E7E7E2",
  width: "100%", maxWidth: "780px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  overflow: "hidden", animation: "adminScaleIn 0.2s ease-out", position: "relative", zIndex: 1001,
};

const modalHeaderStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", borderBottom: "1px solid #E7E7E2", backgroundColor: "#FAFAF7",
};

const tabNavContainerStyle = {
  display: "flex",
  gap: "8px",
  backgroundColor: "#F7F7F2",
  padding: "8px 20px",
  borderBottom: "1px solid #E7E7E2",
  flexWrap: "wrap",
};

const tabBtnStyle = {
  border: "none",
  fontSize: "13px",
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const activeTabStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(27, 31, 140, 0.2)",
};

const inactiveTabStyle = {
  backgroundColor: "transparent",
  color: "#6B6B75",
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

const sectionTitle = { fontSize: "14px", fontWeight: 700, color: "#14151A", margin: "0 0 12px" };
const summaryCardStyle = {
  backgroundColor: "#FAFAF7", borderRadius: "10px", border: "1px solid #E7E7E2",
  padding: "12px", textAlign: "center", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
};
const summaryValStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A" };
const summaryLblStyle = { fontSize: "11px", color: "#6B6B75", fontWeight: 600, marginTop: "2px", textTransform: "uppercase" };
const emptyBoxStyle = {
  padding: "24px", textAlign: "center", color: "#6B6B75", fontSize: "13px",
  backgroundColor: "#FAFAF7", borderRadius: "10px", border: "1px solid #E7E7E2",
};
