"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { DASHBOARD_STATS } from "../data/adminMockData";
import StatCard from "../components/StatCard";
import SalesAnalyticsCard from "../components/SalesAnalyticsCard";
import { formatPrice } from "../../utils/currency";

export default function DashboardView() {
  const { navigateTo } = useAdmin();

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── KPI Stats Row ── */}
      <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        <StatCard icon={DollarSign} title="Total Revenue" value={formatPrice(DASHBOARD_STATS.totalRevenue)} change={DASHBOARD_STATS.revenueChange} changeLabel="vs last month" />
        <StatCard icon={ShoppingCart} title="Total Orders" value={DASHBOARD_STATS.totalOrders.toLocaleString()} change={DASHBOARD_STATS.ordersChange} changeLabel="vs last month" />
        <StatCard icon={Users} title="Total Customers" value={DASHBOARD_STATS.totalCustomers.toLocaleString()} change={DASHBOARD_STATS.customersChange} changeLabel="vs last month" />
        <StatCard icon={Package} title="Total Products" value={DASHBOARD_STATS.totalProducts.toString()} change={DASHBOARD_STATS.productsChange} changeLabel="active listings" />
      </div>

      {/* ── Sales & Orders Analytics Card ── */}
      <SalesAnalyticsCard navigateTo={navigateTo} />


    </div>
  );
}
