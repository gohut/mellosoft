"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminView, setAdminView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "New order #MS-92841 received", time: "2 min ago", read: false },
    { id: 2, text: "Low stock alert: Luxury Down Pillow", time: "15 min ago", read: false },
    { id: 3, text: "New review on Classic Mattress", time: "1 hr ago", read: true },
    { id: 4, text: "Coupon SUMMER30 expires tomorrow", time: "3 hrs ago", read: true },
  ]);

  const navigateTo = useCallback((view) => {
    setAdminView(view);
    setSidebarMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setSidebarMobileOpen((prev) => !prev);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        adminView,
        navigateTo,
        sidebarCollapsed,
        toggleSidebar,
        sidebarMobileOpen,
        toggleMobileSidebar,
        notifications,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
