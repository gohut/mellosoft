"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { Bell, Settings, Menu, ChevronRight, X } from "lucide-react";

const viewTitles = {
  dashboard: "Dashboard",
  products: "Products",
  "add-product": "Add Product",
  "product-details": "Product Details",
  "edit-product": "Edit Product",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  reviews: "Reviews",
  "users-roles": "Users & Roles",
  settings: "Settings",
};

const viewBreadcrumbs = {
  dashboard: [{ label: "Dashboard" }],
  products: [{ label: "Products" }],
  "add-product": [{ label: "Products", nav: "products" }, { label: "Add Product" }],
  "product-details": [{ label: "Products", nav: "products" }, { label: "Product Details" }],
  "edit-product": [{ label: "Products", nav: "products" }, { label: "Product Details", nav: "product-details" }, { label: "Edit Product" }],
  categories: [{ label: "Products", nav: "products" }, { label: "Categories" }],
  orders: [{ label: "Orders" }],
  customers: [{ label: "Customers" }],
  reviews: [{ label: "Reviews" }],
  "users-roles": [{ label: "Users & Roles" }],
  settings: [{ label: "Settings" }],
};

const getRoleColor = (roleObj, userObj) => {
  const roleName = (roleObj?.name || userObj?.role || "").toLowerCase();
  const roleId = (roleObj?.id || userObj?.roleId || "").toLowerCase();

  if (roleName.includes("super admin") || roleId.includes("super-admin") || roleId.includes("super_admin")) {
    return "#7C3AED"; // purple
  }
  if (roleName.includes("admin") || roleId.includes("admin")) {
    return "#2563EB"; // blue
  }
  if (roleName.includes("manager") || roleId.includes("manager")) {
    return "#D97706"; // yellow/gold
  }
  if (roleName.includes("staff") || roleId.includes("staff")) {
    return "#6B7280"; // grey
  }
  return "#7C3AED";
};

export default function AdminHeader() {
  const {
    adminView,
    navigateTo,
    sidebarCollapsed,
    toggleSidebar,
    toggleMobileSidebar,
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    setSelectedOrderId,
    currentUser,
    currentUserRole,
    hasPermission,
    getFirstAllowedAdminView
  } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const crumbs = viewBreadcrumbs[adminView] || [{ label: "Dashboard" }];
  const roleColor = getRoleColor(currentUserRole, currentUser);

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

  return (
    <header className="admin-header" style={{
      position: "sticky",
      top: 0,
      height: "64px",
      backgroundColor: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #E7E7E2",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px 0 14px",
      zIndex: 800,
      gap: "14px",
    }}>
      {/* Left: mobile menu + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {/* Mobile hamburger – hidden on desktop (≥1024px), visible on mobile/tablet */}
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

        {/* Breadcrumb */}
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

      {/* Right: notifications, profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={iconBtnStyle}
            aria-label="Notifications"
          >
            <Bell size={20} color="#6B6B75" />
            {unreadCount > 0 && (
              <span style={{
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
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
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
            }}>
              <div style={{
                padding: "14px 16px",
                borderBottom: "1px solid #E7E7E2",
                fontWeight: 700,
                fontSize: "14px",
                color: "#14151A",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: "#EEF0FF",
                      color: "#1B1F8C",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "10px"
                    }}>
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
                      title="Clear all notifications"
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
                              {n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now")}
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
                                transition: "color 0.15s, background-color 0.15s"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.backgroundColor = "#FEE2E2"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.backgroundColor = "transparent"; }}
                              title="Delete notification"
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

        {/* Settings */}
        {hasPermission("settings", "view") && (
          <button onClick={() => navigateTo("settings")} style={iconBtnStyle} aria-label="Settings">
            <Settings size={20} color="#6B6B75" />
          </button>
        )}

        {/* Admin user profile badge */}
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
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "10px",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title={currentUser?.name || "Admin"}
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#1B1F8C",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="admin-desktop-only" style={{ textAlign: "left", lineHeight: 1.2 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: roleColor, whiteSpace: "nowrap" }}>
              {currentUser?.name || "Admin"}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}

const backBtnStyle = {
  width: "36px",
  height: "36px",
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.15s ease",
  flexShrink: 0,
};

const iconBtnStyle = {
  width: "40px",
  height: "40px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  transition: "background-color 0.15s ease",
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
