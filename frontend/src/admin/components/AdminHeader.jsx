"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { Search, Bell, Settings, Menu, ChevronRight } from "lucide-react";

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
  const { adminView, navigateTo, sidebarCollapsed, toggleSidebar, toggleMobileSidebar, notifications, currentUser, currentUserRole } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const crumbs = viewBreadcrumbs[adminView] || [{ label: "Dashboard" }];
  const roleColor = getRoleColor(currentUserRole, currentUser);

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

      {/* Right: search, notifications, profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Search (desktop only) */}
        <div className="admin-desktop-only" style={{ position: "relative", width: "220px" }}>
          <Search size={16} color="#6B6B75" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: "100%",
              height: "38px",
              border: "1px solid #E7E7E2",
              borderRadius: "10px",
              padding: "0 14px 0 38px",
              fontSize: "13px",
              color: "#14151A",
              backgroundColor: "#FAFAF7",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#1B1F8C"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E7E7E2"; }}
          />
        </div>

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
              width: "340px",
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E7E7E2",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              zIndex: 900,
              animation: "adminScaleIn 0.2s ease-out",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #E7E7E2", fontWeight: 700, fontSize: "14px", color: "#14151A" }}>
                Notifications
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #F0F0EC",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  backgroundColor: n.read ? "transparent" : "#FAFAF7",
                }}>
                  {!n.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1B1F8C", marginTop: "5px", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", color: "#14151A", lineHeight: 1.4, margin: 0 }}>{n.text}</p>
                    <p style={{ fontSize: "11px", color: "#6B6B75", marginTop: "4px" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button onClick={() => navigateTo("settings")} style={iconBtnStyle} aria-label="Settings">
          <Settings size={20} color="#6B6B75" />
        </button>

        {/* Admin user profile badge */}
        <button
          onClick={() => navigateTo("users-roles")}
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
