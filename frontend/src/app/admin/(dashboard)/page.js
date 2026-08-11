"use client";

import React from "react";
import { useAdmin } from "../../../admin/context/AdminContext";
import AdminSidebar from "../../../admin/components/AdminSidebar";
import AdminHeader from "../../../admin/components/AdminHeader";
import DashboardView from "../../../admin/views/DashboardView";
import ProductsView from "../../../admin/views/ProductsView";
import AddProductView from "../../../admin/views/AddProductView";
import AdminProductDetailView from "../../../admin/views/AdminProductDetailView";
import EditProductView from "../../../admin/views/EditProductView";
import CategoriesView from "../../../admin/views/CategoriesView";
import OrdersView from "../../../admin/views/OrdersView";
import CustomersView from "../../../admin/views/CustomersView";
import ReviewsView from "../../../admin/views/ReviewsView";
import UsersAndRolesView from "../../../admin/views/UsersAndRolesView";
import SettingsView from "../../../admin/views/SettingsView";

export default function AdminPage() {
  const { adminView, sidebarCollapsed, hasPermission, navigateTo } = useAdmin();

  const renderView = () => {
    switch (adminView) {
      case "dashboard":
        if (!hasPermission("dashboard", "view")) return <AccessDeniedPanel moduleName="Dashboard" onBack={() => navigateTo("dashboard")} />;
        return <DashboardView />;
      case "products":
        if (!hasPermission("products", "view")) return <AccessDeniedPanel moduleName="Products" onBack={() => navigateTo("dashboard")} />;
        return <ProductsView />;
      case "product-details":
        if (!hasPermission("products", "view")) return <AccessDeniedPanel moduleName="Products" onBack={() => navigateTo("dashboard")} />;
        return <AdminProductDetailView />;
      case "categories":
        if (!hasPermission("products", "view")) return <AccessDeniedPanel moduleName="Categories" onBack={() => navigateTo("dashboard")} />;
        return <CategoriesView />;
      case "add-product":
        if (!hasPermission("products", "create")) return <AccessDeniedPanel moduleName="Add Product" onBack={() => navigateTo("dashboard")} />;
        return <AddProductView />;
      case "edit-product":
        if (!hasPermission("products", "edit")) return <AccessDeniedPanel moduleName="Edit Product" onBack={() => navigateTo("dashboard")} />;
        return <EditProductView />;
      case "orders":
        if (!hasPermission("orders", "view")) return <AccessDeniedPanel moduleName="Orders" onBack={() => navigateTo("dashboard")} />;
        return <OrdersView />;
      case "customers":
        if (!hasPermission("customers", "view")) return <AccessDeniedPanel moduleName="Customers" onBack={() => navigateTo("dashboard")} />;
        return <CustomersView />;
      case "reviews":
        if (!hasPermission("reviews", "view")) return <AccessDeniedPanel moduleName="Reviews" onBack={() => navigateTo("dashboard")} />;
        return <ReviewsView />;
      case "users-roles":
        if (!hasPermission("users", "view") && !hasPermission("roles", "view")) return <AccessDeniedPanel moduleName="Users & Roles" onBack={() => navigateTo("dashboard")} />;
        return <UsersAndRolesView />;
      case "settings":
        if (!hasPermission("settings", "view")) return <AccessDeniedPanel moduleName="Settings" onBack={() => navigateTo("dashboard")} />;
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="admin-root">
      <AdminSidebar />

      <div
        className="admin-main-area"
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? "72px" : "260px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        <AdminHeader />

        <main style={{
          flex: 1,
          padding: "28px 28px 40px",
          overflowX: "hidden",
        }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function AccessDeniedPanel({ moduleName, onBack }) {
  return (
    <div className="admin-fade-in" style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", marginTop: "24px" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#14151A", margin: 0 }}>Access Denied</h3>
      <p style={{ fontSize: "14px", color: "#6B6B75", margin: "8px 0 24px", maxWidth: "440px", marginLeft: "auto", marginRight: "auto" }}>
        You don't have permission to access {moduleName ? `the ${moduleName}` : "this"} page. Contact your Super Admin for access.
      </p>
      <button onClick={onBack} style={{ height: "40px", padding: "0 20px", backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
        Back to Dashboard
      </button>
    </div>
  );
}

