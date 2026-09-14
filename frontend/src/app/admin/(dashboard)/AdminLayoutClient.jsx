"use client";

import React from "react";
import { useAdmin } from "../../../admin/context/AdminContext";
import AdminSidebar from "../../../admin/components/AdminSidebar";
import AdminHeader from "../../../admin/components/AdminHeader";

export default function AdminLayoutClient({ children }) {
  const { sidebarCollapsed } = useAdmin();

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

        <main
          style={{
            flex: 1,
            padding: "28px 28px 40px",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
