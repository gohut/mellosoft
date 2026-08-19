"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../context/AdminContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LayoutDashboard, Package,
  ShoppingCart, Users, Star, Settings, LogOut,
  ChevronDown, ChevronRight, X, ShieldCheck, Image as ImageIcon
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "products-group",
    label: "Products",
    icon: Package,
    children: [
      { id: "products", label: "All Products" },
      { id: "add-product", label: "Add Product" },
      { id: "categories", label: "Categories" },
    ],
  },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "users-roles", label: "Users & Roles", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const { adminView, navigateTo, sidebarCollapsed, sidebarMobileOpen, toggleMobileSidebar, toggleSidebar, hasPermission } = useAdmin();
  const { logout } = useAdminAuth();
  const router = useRouter();
  const [productsOpen, setProductsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const isActive = (id) => adminView === id;
  const isProductChild = (id) => ["products", "add-product", "categories", "product-details", "edit-product"].includes(id);
  const isProductsActive = isProductChild(adminView);

  const isNavVisible = (id) => {
    switch (id) {
      case "dashboard": return hasPermission("dashboard", "view");
      case "products-group": return hasPermission("products", "view");
      case "banners": return hasPermission("products", "view");
      case "orders": return hasPermission("orders", "view");
      case "customers": return hasPermission("customers", "view");
      case "reviews": return hasPermission("reviews", "view");
      case "users-roles": return hasPermission("users", "view") || hasPermission("roles", "view");
      case "settings": return hasPermission("settings", "view");
      default: return true;
    }
  };

  const isChildVisible = (id) => {
    switch (id) {
      case "products": return hasPermission("products", "view");
      case "add-product": return hasPermission("products", "create");
      case "categories": return hasPermission("products", "view");
      default: return true;
    }
  };

  const renderNavItem = (item) => {
    if (!isNavVisible(item.id)) return null;

    if (item.children) {
      const open = productsOpen;
      const visibleChildren = item.children.filter((child) => isChildVisible(child.id));
      if (visibleChildren.length === 0) return null;

      return (
        <div key={item.id}>
          <button
            onClick={() => setProductsOpen(!open)}
            style={{
              ...navBtnStyle,
              backgroundColor: isProductsActive && !sidebarCollapsed ? "#E8E9F8" : "transparent",
              color: isProductsActive ? "#1B1F8C" : "#6B6B75",
              fontWeight: isProductsActive ? 600 : 500,
            }}
            onMouseEnter={(e) => { if (!isProductsActive) e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
            onMouseLeave={(e) => { if (!isProductsActive) e.currentTarget.style.backgroundColor = isProductsActive && !sidebarCollapsed ? "#E8E9F8" : "transparent"; }}
          >
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </>
            )}
          </button>
          {open && !sidebarCollapsed && (
            <div style={{ marginLeft: "20px", borderLeft: "2px solid #E7E7E2", paddingLeft: "12px", marginTop: "2px", marginBottom: "4px" }}>
              {visibleChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => navigateTo(child.id)}
                  style={{
                    ...subNavBtnStyle,
                    color: isActive(child.id) ? "#1B1F8C" : "#6B6B75",
                    fontWeight: isActive(child.id) ? 600 : 400,
                    backgroundColor: isActive(child.id) ? "#E8E9F8" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive(child.id)) e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
                  onMouseLeave={(e) => { if (!isActive(child.id)) e.currentTarget.style.backgroundColor = isActive(child.id) ? "#E8E9F8" : "transparent"; }}
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => navigateTo(item.id)}
        style={{
          ...navBtnStyle,
          backgroundColor: isActive(item.id) ? "#E8E9F8" : "transparent",
          color: isActive(item.id) ? "#1B1F8C" : "#6B6B75",
          fontWeight: isActive(item.id) ? 600 : 500,
        }}
        onMouseEnter={(e) => { if (!isActive(item.id)) e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
        onMouseLeave={(e) => { if (!isActive(item.id)) e.currentTarget.style.backgroundColor = isActive(item.id) ? "#E8E9F8" : "transparent"; }}
      >
        <item.icon size={20} style={{ flexShrink: 0 }} />
        {!sidebarCollapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
      </button>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div style={{
        padding: sidebarCollapsed ? "0 12px" : "0 16px 0 20px",
        borderBottom: "1px solid #E7E7E2",
        display: "flex",
        alignItems: "center",
        justifyContent: sidebarCollapsed ? "center" : "space-between",
        height: "64px",
      }}>
        {!sidebarCollapsed && (
          <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#16A34A" }}>m</span>
            <span style={{ color: "#1B1F8C" }}>ellosoft</span>
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="admin-desktop-only"
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid #E7E7E2",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.3s ease, background-color 0.15s ease",
            transform: sidebarCollapsed ? "rotate(180deg)" : "none",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
          aria-label="Toggle sidebar"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight size={18} color="#6B6B75" style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map(renderNavItem)}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #E7E7E2" }}>
        <button
          onClick={handleLogout}
          style={{
            ...navBtnStyle,
            color: "#DC2626",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEE2E2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span style={{ flex: 1, textAlign: "left" }}>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar-desktop" style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarCollapsed ? "72px" : "260px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E7E7E2",
        display: "flex",
        flexDirection: "column",
        zIndex: 900,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarMobileOpen && (
        <>
          <div className="admin-overlay" onClick={toggleMobileSidebar} style={{ zIndex: 998 }} />
          <aside style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "280px",
            backgroundColor: "#FFFFFF",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
            animation: "adminSlideIn 0.3s ease-out",
          }}>
            <button
              onClick={toggleMobileSidebar}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#F7F7F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <X size={18} color="#6B6B75" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}


    </>
  );
}

const navBtnStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  background: "transparent",
};

const subNavBtnStyle = {
  width: "100%",
  display: "block",
  textAlign: "left",
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  background: "transparent",
};
