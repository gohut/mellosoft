"use client";

import React from "react";
import { useAdmin } from "../../../admin/context/AdminContext";
import AdminSidebar from "../../../admin/components/AdminSidebar";
import AdminHeader from "../../../admin/components/AdminHeader";
import DashboardView from "../../../admin/views/DashboardView";
import ProductsView from "../../../admin/views/ProductsView";
import AddProductView from "../../../admin/views/AddProductView";
import CategoriesView from "../../../admin/views/CategoriesView";
import InventoryView from "../../../admin/views/InventoryView";
import OrdersView from "../../../admin/views/OrdersView";
import CustomersView from "../../../admin/views/CustomersView";
import ReviewsView from "../../../admin/views/ReviewsView";
import CouponsView from "../../../admin/views/CouponsView";
import SettingsView from "../../../admin/views/SettingsView";

export default function AdminPage() {
  const { adminView, sidebarCollapsed } = useAdmin();

  const renderView = () => {
    switch (adminView) {
      case "dashboard": return <DashboardView />;
      case "products": return <ProductsView />;
      case "add-product": return <AddProductView />;
      case "categories": return <CategoriesView />;
      case "inventory": return <InventoryView />;
      case "orders": return <OrdersView />;
      case "customers": return <CustomersView />;
      case "reviews": return <ReviewsView />;
      case "coupons": return <CouponsView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView />;
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
