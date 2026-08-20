"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";
import SalesAnalyticsCard from "../components/SalesAnalyticsCard";

export default function DashboardView() {
  const { navigateTo } = useAdmin();

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── Sales & Orders Analytics Card ── */}
      <SalesAnalyticsCard navigateTo={navigateTo} />
    </div>
  );
}
