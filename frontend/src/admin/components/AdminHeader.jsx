"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import {
  Bell,
  Settings,
  Menu,
  ChevronRight,
  X,
  Search,
  ExternalLink,
  Package,
  ShoppingCart,
  Users,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "../../utils/currency";

const viewTitles = {
  dashboard: "Dashboard",
  products: "Products",
  "add-product": "Add Product",
  "product-details": "Product Details",
  "edit-product": "Edit Product",
  categories: "Categories",
  inventory: "Inventory",
  orders: "Orders",
  customers: "Customers",
  reviews: "Reviews",
  content: "Content",
  "users-roles": "Users & Roles",
  settings: "Settings",
};

const viewBreadcrumbs = {
  dashboard: [{ label: "Dashboard" }],
  products: [{ label: "Products" }],
  inventory: [{ label: "Inventory" }],
  "add-product": [{ label: "Products", nav: "products" }, { label: "Add Product" }],
  "product-details": [{ label: "Products", nav: "products" }, { label: "Product Details" }],
  "edit-product": [{ label: "Products", nav: "products" }, { label: "Product Details", nav: "product-details" }, { label: "Edit Product" }],
  categories: [{ label: "Products", nav: "products" }, { label: "Categories" }],
  orders: [{ label: "Orders" }],
  customers: [{ label: "Customers" }],
  reviews: [{ label: "Reviews" }],
  content: [{ label: "Content" }],
  "users-roles": [{ label: "Users & Roles" }],
  settings: [{ label: "Settings" }],
};

export default function AdminHeader() {
  const {
    adminView,
    navigateTo,
    toggleMobileSidebar,
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    setSelectedOrderId,
    setSelectedProductId,
    currentUser,
    currentUserRole,
    hasPermission,
    getFirstAllowedAdminView,
    products = [],
    orders = [],
    customers = [],
  } = useAdmin();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results popup on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global search filtering across products, orders, and customers
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return { products: [], orders: [], customers: [], total: 0 };
    }

    const matchedProducts = (products || []).filter((p) => {
      const name = (p.Product_Name || p.name || "").toLowerCase();
      const id = (p.Product_Id || p.id || "").toLowerCase();
      const sku = (p.sku || p.SKU || "").toLowerCase();
      const variantSku = Array.isArray(p.variants) && p.variants.some((v) => (v.SKU || v.sku || "").toLowerCase().includes(debouncedQuery));
      return name.includes(debouncedQuery) || id.includes(debouncedQuery) || sku.includes(debouncedQuery) || variantSku;
    }).slice(0, 4);

    const matchedOrders = (orders || []).filter((o) => {
      const id = (o.id || o.orderId || "").toLowerCase();
      const custName = (o.customerName || o.deliveryAddress?.fullName || "").toLowerCase();
      const custEmail = (o.email || o.customerEmail || "").toLowerCase();
      return id.includes(debouncedQuery) || custName.includes(debouncedQuery) || custEmail.includes(debouncedQuery);
    }).slice(0, 4);

    const matchedCustomers = (customers || []).filter((c) => {
      const name = (c.name || c.fullName || `${c.firstName || ""} ${c.lastName || ""}`).toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || c.mobile || "").toLowerCase();
      return name.includes(debouncedQuery) || email.includes(debouncedQuery) || phone.includes(debouncedQuery);
    }).slice(0, 4);

    const total = matchedProducts.length + matchedOrders.length + matchedCustomers.length;

    return {
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers,
      total,
    };
  }, [debouncedQuery, products, orders, customers]);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const crumbs = viewBreadcrumbs[adminView] || [{ label: "Dashboard" }];

  const handleNotificationClick = (n) => {
    if (markNotificationAsRead) {
      markNotificationAsRead(n.id);
    }
    if (n.orderId && hasPermission && hasPermission("orders", "view")) {
      if (setSelectedOrderId) setSelectedOrderId(n.orderId);
      if (navigateTo) navigateTo("orders");
    }
    setShowNotifications(false);
  };

  const handleSelectProduct = (prodId) => {
    if (setSelectedProductId) setSelectedProductId(prodId);
    if (navigateTo) navigateTo("products");
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleSelectOrder = (orderId) => {
    if (setSelectedOrderId) setSelectedOrderId(orderId);
    if (navigateTo) navigateTo("orders");
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleSelectCustomer = () => {
    if (navigateTo) navigateTo("customers");
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Role details & role-based theme color
  const roleName = currentUserRole?.name || currentUser?.role || "Super Admin";
  const adminName = currentUser?.name || "Admin User";
  const avatarLetter = adminName.charAt(0).toUpperCase();

  const roleColor = (() => {
    const r = (roleName || "").toLowerCase();
    if (r.includes("super") || r === "admin") return "#1B1F8C"; // Mellosoft Navy
    if (r.includes("manager")) return "#0D9488"; // Teal
    if (r.includes("support") || r.includes("staff")) return "#D97706"; // Amber
    if (r.includes("editor") || r.includes("content")) return "#7C3AED"; // Purple
    return "#1B1F8C";
  })();

  return (
    <header
      className="admin-header"
      style={{
        position: "sticky",
        top: 0,
        height: "64px",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E7E7E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 800,
        gap: "16px",
      }}
    >
      {/* ── Left: Mobile Hamburger & Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexShrink: 0 }}>
        <button
          className="admin-mobile-only"
          onClick={toggleMobileSidebar}
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid #E7E7E2",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Open sidebar"
        >
          <Menu size={20} color="#14151A" />
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6B6B75", overflow: "hidden" }}>
          <button
            onClick={() => navigateTo("dashboard")}
            style={crumbBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1B1F8C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#6B6B75"; }}
          >
            Admin
          </button>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={14} color="#C0C0BA" style={{ flexShrink: 0 }} />
              {crumb.nav ? (
                <button
                  onClick={() => navigateTo(crumb.nav)}
                  style={crumbBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#1B1F8C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#6B6B75"; }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span style={{ color: "#14151A", fontWeight: 600, whiteSpace: "nowrap" }}>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* ── Center: Global Admin Search ── */}
      <div
        ref={searchContainerRef}
        className="admin-desktop-only"
        style={{
          position: "relative",
          flex: "1 1 360px",
          maxWidth: "460px",
          margin: "0 12px",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search products, orders, customers..."
            style={{
              width: "100%",
              height: "38px",
              padding: "0 34px 0 36px",
              fontSize: "13px",
              fontFamily: "inherit",
              color: "#14151A",
              backgroundColor: "#F7F7F2",
              border: "1px solid #E7E7E2",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            onBlur={(e) => {
              if (!e.target.value) e.currentTarget.style.backgroundColor = "#F7F7F2";
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                color: "#9CA3AF",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Global Search Dropdown Results Popover */}
        {showSearchResults && debouncedQuery.length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid #E7E7E2",
              boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
              zIndex: 999,
              maxHeight: "380px",
              overflowY: "auto",
              padding: "8px 0",
              animation: "adminScaleIn 0.18s ease-out",
            }}
          >
            {searchResults.total === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <>
                {/* Products */}
                {searchResults.products.length > 0 && (
                  <div>
                    <div style={searchCategoryHeaderStyle}>
                      <Package size={13} color="#1B1F8C" />
                      <span>Products ({searchResults.products.length})</span>
                    </div>
                    {searchResults.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        style={searchItemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8FE"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <div style={{ fontWeight: 600, color: "#14151A", fontSize: "13px" }}>
                          {prod.Product_Name || prod.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>
                          ID: {prod.Product_Id || prod.id} • {formatPrice(prod.price || prod.startingPrice || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orders */}
                {searchResults.orders.length > 0 && (
                  <div style={{ borderTop: searchResults.products.length > 0 ? "1px solid #F0F0EC" : "none" }}>
                    <div style={searchCategoryHeaderStyle}>
                      <ShoppingCart size={13} color="#1B1F8C" />
                      <span>Orders ({searchResults.orders.length})</span>
                    </div>
                    {searchResults.orders.map((ord) => (
                      <div
                        key={ord.id || ord.orderId}
                        onClick={() => handleSelectOrder(ord.id || ord.orderId)}
                        style={searchItemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8FE"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, color: "#1B1F8C", fontSize: "13px" }}>
                            {ord.id || ord.orderId}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#14151A" }}>
                            {formatPrice(ord.totalAmount ?? ord.amount ?? ord.total)}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>
                          {ord.customerName || ord.deliveryAddress?.fullName || ord.email || "Customer"} • {ord.orderStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {searchResults.customers.length > 0 && (
                  <div style={{ borderTop: searchResults.orders.length > 0 || searchResults.products.length > 0 ? "1px solid #F0F0EC" : "none" }}>
                    <div style={searchCategoryHeaderStyle}>
                      <Users size={13} color="#1B1F8C" />
                      <span>Customers ({searchResults.customers.length})</span>
                    </div>
                    {searchResults.customers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust.id)}
                        style={searchItemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8FE"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <div style={{ fontWeight: 600, color: "#14151A", fontSize: "13px" }}>
                          {cust.name || cust.fullName || `${cust.firstName || ""} ${cust.lastName || ""}`}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>
                          {cust.email || cust.phone || "Customer Account"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right: View Store, Notifications, Profile ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "auto" }}>
        {/* View Store Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "36px",
            padding: "0 14px",
            backgroundColor: "#F7F7F2",
            border: "1px solid #E7E7E2",
            borderRadius: "8px",
            color: "#14151A",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#1B1F8C";
            e.currentTarget.style.color = "#1B1F8C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F7F7F2";
            e.currentTarget.style.borderColor = "#E7E7E2";
            e.currentTarget.style.color = "#14151A";
          }}
          title="Open Storefront home in new tab"
        >
          <span>View Store</span>
          <ExternalLink size={14} />
        </a>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={iconBtnStyle}
            aria-label="Notifications"
          >
            <Bell size={19} color="#6B6B75" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "360px",
                maxHeight: "440px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E7E7E2",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                zIndex: 900,
                animation: "adminScaleIn 0.2s ease-out",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #E7E7E2",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#14151A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#EEF0FF",
                        color: "#1B1F8C",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "10px",
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead && markAllNotificationsAsRead()}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#1B1F8C",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => clearNotifications && clearNotifications()}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#DC2626",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div style={{ overflowY: "auto", maxHeight: "360px" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#9CA3AF" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>No notifications yet</p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6B6B75" }}>New order and system alerts will appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #F0F0EC",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                        backgroundColor: n.read ? "transparent" : "#F7F8FE",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = n.read ? "#F9F9F7" : "#EFF2FE"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.read ? "transparent" : "#F7F8FE"; }}
                    >
                      {!n.read ? (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1B1F8C", marginTop: "5px", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "transparent", marginTop: "5px", flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                          <p style={{ fontSize: "13px", fontWeight: n.read ? 600 : 700, color: "#14151A", margin: 0, lineHeight: 1.3 }}>
                            {n.title || "Notification"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "10px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                              {n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now")}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (deleteNotification) deleteNotification(n.id);
                              }}
                              style={{
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#9CA3AF",
                                cursor: "pointer",
                                padding: "2px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: "12px", color: "#4B5563", marginTop: "3px", marginBottom: 0, lineHeight: 1.4 }}>
                          {n.message || n.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button if permitted */}
        {hasPermission("settings", "view") && (
          <button onClick={() => navigateTo("settings")} style={iconBtnStyle} aria-label="Settings">
            <Settings size={19} color="#6B6B75" />
          </button>
        )}

        {/* Admin Profile Display (Avatar + Name with role-based color) */}
        <button
          onClick={() => {
            if (hasPermission("users", "view") || hasPermission("roles", "view")) {
              navigateTo("users-roles");
            } else if (getFirstAllowedAdminView) {
              navigateTo(getFirstAllowedAdminView());
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #E7E7E2",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            padding: "5px 12px 5px 6px",
            borderRadius: "10px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; e.currentTarget.style.borderColor = roleColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.borderColor = "#E7E7E2"; }}
          title={`${adminName} (${roleName})`}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: roleColor,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>
          <div
            className="admin-desktop-only"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: roleColor,
              whiteSpace: "nowrap",
            }}
          >
            {adminName}
          </div>
        </button>
      </div>
    </header>
  );
}

const iconBtnStyle = {
  width: "36px",
  height: "36px",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.15s ease",
  flexShrink: 0,
};

const crumbBtnStyle = {
  background: "none",
  border: "none",
  color: "#6B6B75",
  fontSize: "13px",
  cursor: "pointer",
  padding: 0,
  fontFamily: "inherit",
  transition: "color 0.15s ease",
  whiteSpace: "nowrap",
};

const searchCategoryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#6B6B75",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  backgroundColor: "#FAFAF7",
};

const searchItemStyle = {
  padding: "8px 14px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

