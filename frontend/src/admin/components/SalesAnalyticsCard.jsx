"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import StatusBadge from "./StatusBadge";
import { formatPrice } from "../../utils/currency";
import {
  calculateTotalRevenue,
  getOrdersForPeriod,
  generateDashboardChartData,
  calculatePeriodGrowth,
  getOrderStatusBreakdown,
  calculateTopSellingProducts,
  calculateInventoryMetrics,
  getLowStockAlerts,
  LOW_STOCK_THRESHOLD,
} from "../utils/dashboardHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Period filter presets
// ─────────────────────────────────────────────────────────────────────────────
const TOP_PERIOD_FILTERS = [
  { id: "today", label: "Today" },
  { id: "7Days", label: "7 Days" },
  { id: "30Days", label: "30 Days" },
  { id: "thisYear", label: "Year" },
  { id: "overall", label: "Overall" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip for Revenue & Sales Chart
// ─────────────────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#14151A",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.08)",
        minWidth: "160px",
      }}
    >
      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 6px", fontWeight: 600 }}>{label}</p>
      {payload.map((entry) => {
        const isRev = entry.name === "revenue" || entry.dataKey === "revenue";
        const dotColor = isRev ? "#0D9488" : "#1B1F8C";
        return (
          <div key={entry.dataKey || entry.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
              {isRev ? "Revenue" : "Sales (Units)"}:
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", marginLeft: "auto" }}>
              {isRev ? formatPrice(entry.value) : `${entry.value} orders`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated number counter hook
// ─────────────────────────────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 400) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(Math.round(current));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact KPI Card
// ─────────────────────────────────────────────────────────────────────────────
function CompactKpiCard({ label, value, isCurrency = false, subtitle, change, icon: Icon, iconColor = "#0D9488", iconBg = "#CCFBF1", alertBorder = false }) {
  const animated = useAnimatedNumber(value);
  const hasChange = typeof change === "number" && !isNaN(change);
  const isPositive = hasChange && change >= 0;

  const displayValue = isCurrency ? formatPrice(animated) : animated.toLocaleString("en-IN");

  return (
    <div
      className="analytics-kpi-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: alertBorder ? "1px solid #FCD34D" : "1px solid #E7E7E2",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "10px",
        minWidth: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      {/* Top row: Label + Icon badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#6B6B75",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} color={iconColor} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#14151A",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {displayValue}
        </p>
      </div>

      {/* Bottom status / growth line */}
      <div style={{ fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
        {hasChange ? (
          <span style={{ color: isPositive ? "#16A34A" : "#DC2626", display: "inline-flex", alignItems: "center", gap: "2px" }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? `+${change}%` : `${change}%`} vs last period
          </span>
        ) : subtitle ? (
          <span style={{ color: alertBorder ? "#D97706" : "#6B6B75", fontWeight: 500 }}>
            {subtitle}
          </span>
        ) : (
          <span style={{ color: "#9CA3AF", fontWeight: 500 }}>
            Live store metric
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Orders Panel
// ─────────────────────────────────────────────────────────────────────────────
function RecentOrdersPanel({ orders = [], customers = [], navigateTo, setSelectedOrderId }) {
  const recentOrders = useMemo(() => (orders || []).slice(0, 6), [orders]);

  const handleOrderClick = (orderId) => {
    if (setSelectedOrderId) setSelectedOrderId(orderId);
    if (navigateTo) navigateTo("orders");
  };

  const getCustomerName = (order) => {
    if (order.customerName) return order.customerName;
    if (order.deliveryAddress?.fullName) return order.deliveryAddress.fullName;
    const match = (customers || []).find((c) => c.id === order.customerId || c.id === order.userId || c.email === order.email);
    if (match) return match.name || match.fullName || `${match.firstName || ""} ${match.lastName || ""}`;
    return order.email || "Customer";
  };

  return (
    <div className="analytics-box" style={sectionBoxStyle}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Recent Orders</h3>
        {navigateTo && (
          <button onClick={() => navigateTo("orders")} style={viewAllBtnStyle}>
            View all &gt;
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="admin-desktop-only" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #EEEEE9", textAlign: "left" }}>
              <th style={thStyle}>ORDER ID</th>
              <th style={thStyle}>CUSTOMER</th>
              <th style={thStyle}>AMOUNT</th>
              <th style={thStyle}>PAYMENT</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#9CA3AF" }}>
                  No recent orders yet. Real customer orders will appear here.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => {
                const custName = getCustomerName(order);
                const orderId = order.id || order.orderId;
                const paymentStatus = order.paymentStatus || order.payment?.status || (order.paymentMethod === "COD" ? "Pending" : "Paid");
                const orderStatus = order.orderStatus || "Processing";
                const dateStr = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : (order.date || "Today");

                return (
                  <tr
                    key={orderId}
                    onClick={() => handleOrderClick(orderId)}
                    style={{ borderBottom: "1px solid #F4F4F0", cursor: "pointer", transition: "background-color 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFAF7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#1B1F8C" }}>{orderId}</td>
                    <td style={{ ...tdStyle, color: "#14151A", fontWeight: 500 }}>{custName}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#14151A" }}>{formatPrice(order.totalAmount ?? order.amount ?? order.total)}</td>
                    <td style={tdStyle}><StatusBadge status={paymentStatus} /></td>
                    <td style={tdStyle}><StatusBadge status={orderStatus} /></td>
                    <td style={{ ...tdStyle, color: "#6B6B75", fontSize: "12px" }}>{dateStr}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="admin-mobile-only" style={{ display: "none", flexDirection: "column", gap: "8px" }}>
        {recentOrders.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "12px" }}>
            No recent orders.
          </div>
        ) : (
          recentOrders.map((order) => {
            const custName = getCustomerName(order);
            const orderId = order.id || order.orderId;
            const paymentStatus = order.paymentStatus || order.payment?.status || "Paid";
            const orderStatus = order.orderStatus || "Processing";
            const dateStr = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : (order.date || "Today");

            return (
              <div
                key={orderId}
                onClick={() => handleOrderClick(orderId)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #EEEEE9",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#1B1F8C", fontSize: "13px" }}>{orderId}</span>
                  <StatusBadge status={orderStatus} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#14151A", fontWeight: 600 }}>
                  <span>{custName}</span>
                  <span>{formatPrice(order.totalAmount ?? order.amount ?? order.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#6B6B75" }}>
                  <span>Payment: <StatusBadge status={paymentStatus} /></span>
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top Selling Panel
// ─────────────────────────────────────────────────────────────────────────────
function TopSellingPanel({ orders = [], products = [], navigateTo }) {
  const topProducts = useMemo(() => {
    return calculateTopSellingProducts(orders, products, 4);
  }, [orders, products]);

  return (
    <div className="analytics-box" style={sectionBoxStyle}>
      <div style={sectionHeaderStyle}>
        <h3 style={sectionTitleStyle}>Top Selling</h3>
        {navigateTo && (
          <button onClick={() => navigateTo("products")} style={viewAllBtnStyle}>
            All &gt;
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
        {topProducts.length === 0 ? (
          <div style={{ padding: "28px 12px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
            No sales data yet.
          </div>
        ) : (
          topProducts.map((item) => (
            <div
              key={item.productId}
              onClick={() => navigateTo && navigateTo("products")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFAF7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {/* Rank */}
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", width: "14px", textAlign: "center" }}>
                {item.rank}
              </span>

              {/* Product Thumbnail */}
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  backgroundColor: "#F7F7F2",
                  border: "1px solid #E7E7E2",
                  flexShrink: 0,
                }}
              />

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#14151A",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </p>
                <p style={{ fontSize: "11px", color: "#6B6B75", margin: "2px 0 0" }}>
                  <span style={{ fontWeight: 600, color: "#0D9488" }}>{item.unitsSold} sold</span> • {formatPrice(item.revenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory Overview Panel
// ─────────────────────────────────────────────────────────────────────────────
function InventoryOverviewPanel({ products = [], navigateTo }) {
  const metrics = useMemo(() => {
    return calculateInventoryMetrics(products, LOW_STOCK_THRESHOLD);
  }, [products]);

  return (
    <div className="analytics-box" style={{ ...sectionBoxStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Inventory Overview</h3>
        </div>

        {/* Total SKUs */}
        <div style={{ paddingBottom: "10px", borderBottom: "1px solid #EEEEE9", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Total SKUs</span>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#14151A" }}>{metrics.totalSkus}</span>
          </div>
          <div style={{ height: "4px", backgroundColor: "#E7E7E2", borderRadius: "2px", marginTop: "6px", width: "100%" }} />
        </div>

        {/* In Stock */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "#4B5563" }}>In Stock</span>
            <span style={{ fontWeight: 700, color: "#14151A" }}>{metrics.inStock}</span>
          </div>
          <div style={{ height: "5px", backgroundColor: "#E7E7E2", borderRadius: "3px", marginTop: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${metrics.inStockPercent}%`, backgroundColor: "#16A34A", borderRadius: "3px" }} />
          </div>
        </div>

        {/* Low Stock */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "#4B5563" }}>Low Stock</span>
            <span style={{ fontWeight: 700, color: "#D97706" }}>{metrics.lowStock}</span>
          </div>
          <div style={{ height: "5px", backgroundColor: "#E7E7E2", borderRadius: "3px", marginTop: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${metrics.lowStockPercent}%`, backgroundColor: "#F59E0B", borderRadius: "3px" }} />
          </div>
        </div>

        {/* Out of Stock */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "#4B5563" }}>Out of Stock</span>
            <span style={{ fontWeight: 700, color: "#DC2626" }}>{metrics.outOfStock}</span>
          </div>
          <div style={{ height: "5px", backgroundColor: "#E7E7E2", borderRadius: "3px", marginTop: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${metrics.outOfStockPercent}%`, backgroundColor: "#DC2626", borderRadius: "3px" }} />
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      {navigateTo && (
        <button
          onClick={() => navigateTo("inventory")}
          style={{
            width: "100%",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: "8px",
            color: "#14151A",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            marginTop: "auto",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1B1F8C"; e.currentTarget.style.color = "#1B1F8C"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E7E2"; e.currentTarget.style.color = "#14151A"; }}
        >
          <span>Manage Inventory</span>
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Low Stock Alerts Panel (Compact Table without restock buttons)
// ─────────────────────────────────────────────────────────────────────────────
function LowStockAlertsPanel({ products = [], navigateTo }) {
  const lowStockItems = useMemo(() => {
    return getLowStockAlerts(products, LOW_STOCK_THRESHOLD, 6);
  }, [products]);

  return (
    <div className="analytics-box" style={sectionBoxStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertTriangle size={16} color="#F59E0B" />
          <h3 style={sectionTitleStyle}>Low Stock Alerts</h3>
        </div>
        {navigateTo && (
          <button onClick={() => navigateTo("inventory")} style={viewAllBtnStyle}>
            View all &gt;
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="admin-desktop-only" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #EEEEE9", textAlign: "left" }}>
              <th style={thStyle}>PRODUCT</th>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>VARIANT</th>
              <th style={{ ...thStyle, textAlign: "center" }}>STOCK</th>
              <th style={{ ...thStyle, textAlign: "center" }}>MIN STOCK</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#16A34A", fontWeight: 600 }}>
                  ✓ All products are sufficiently stocked.
                </td>
              </tr>
            ) : (
              lowStockItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigateTo && navigateTo("inventory")}
                  style={{ borderBottom: "1px solid #F4F4F0", cursor: "pointer", transition: "background-color 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFAF7"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#14151A" }}>{item.product}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "11px", color: "#6B6B75" }}>{item.sku}</td>
                  <td style={{ ...tdStyle, color: "#4B5563", fontSize: "12px" }}>{item.variant}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: item.stock === 0 ? "#DC2626" : "#D97706" }}>
                    {item.stock}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#6B6B75", fontSize: "12px" }}>{item.minStock}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="admin-mobile-only" style={{ display: "none", flexDirection: "column", gap: "8px" }}>
        {lowStockItems.length === 0 ? (
          <div style={{ padding: "14px", textAlign: "center", color: "#16A34A", fontSize: "12px" }}>
            ✓ All products are sufficiently stocked.
          </div>
        ) : (
          lowStockItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateTo && navigateTo("inventory")}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #EEEEE9",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#14151A", fontSize: "13px" }}>{item.product}</span>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "#6B6B75" }}>
                <span>{item.variant} (SKU: {item.sku})</span>
                <span style={{ fontWeight: 800, color: item.stock === 0 ? "#DC2626" : "#D97706" }}>
                  Stock: {item.stock} / Min: {item.minStock}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SalesAnalyticsCard (Redesigned Dashboard View)
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesAnalyticsCard({ navigateTo }) {
  const { orders = [], customers = [], products = [], setSelectedOrderId } = useAdmin();
  const [selectedTopPeriod, setSelectedTopPeriod] = useState("7Days");
  const [chartMetric, setChartMetric] = useState("both"); // "both" | "revenue" | "sales"
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter orders by top period for KPI cards & order status overview
  const periodOrders = useMemo(() => {
    return getOrdersForPeriod(orders, selectedTopPeriod);
  }, [orders, selectedTopPeriod]);

  // Derived live KPI metrics
  const totalRevenue = useMemo(() => calculateTotalRevenue(periodOrders), [periodOrders]);
  const totalOrdersCount = useMemo(() => periodOrders.length, [periodOrders]);
  const totalCustomersCount = useMemo(() => (customers || []).length, [customers]);
  const totalProductsCount = useMemo(() => (products || []).filter((p) => p.status !== "Inactive" && p.status !== "Deleted").length, [products]);

  // Inventory summary metrics
  const inventoryMetrics = useMemo(() => {
    return calculateInventoryMetrics(products, LOW_STOCK_THRESHOLD);
  }, [products]);

  // Growth rates
  const { revenueGrowth, ordersGrowth } = useMemo(() => {
    return calculatePeriodGrowth(orders, selectedTopPeriod);
  }, [orders, selectedTopPeriod]);

  // Chart data synced with selected period
  const chartData = useMemo(() => {
    return generateDashboardChartData(orders, selectedTopPeriod);
  }, [orders, selectedTopPeriod]);

  const hasChartData = useMemo(() => {
    return chartData.some((d) => d.orders > 0 || d.revenue > 0);
  }, [chartData]);

  // Order status breakdown for Order Overview card
  const orderBreakdown = useMemo(() => {
    return getOrderStatusBreakdown(periodOrders);
  }, [periodOrders]);

  const topPeriodLabel = TOP_PERIOD_FILTERS.find((f) => f.id === selectedTopPeriod)?.label || "7 Days";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Top Dashboard Header with Time Filter ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#14151A", margin: 0, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "3px", margin: "3px 0 0" }}>
            Showing metrics for <strong style={{ color: "#14151A" }}>{topPeriodLabel}</strong>
          </p>
        </div>

        {/* Top Time Filter Buttons */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#FFFFFF", padding: "4px", borderRadius: "8px", border: "1px solid #E7E7E2" }}>
          {TOP_PERIOD_FILTERS.map((filter) => {
            const isActive = selectedTopPeriod === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedTopPeriod(filter.id)}
                style={{
                  border: "none",
                  backgroundColor: isActive ? "#0F766E" : "transparent",
                  color: isActive ? "#FFFFFF" : "#6B6B75",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  padding: "5px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI Row: 5 compact cards matching reference ── */}
      <div
        className="analytics-kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "14px",
        }}
      >
        <CompactKpiCard
          label="TOTAL REVENUE"
          value={totalRevenue}
          isCurrency={true}
          change={revenueGrowth}
          icon={IndianRupee}
          iconColor="#0D9488"
          iconBg="#CCFBF1"
        />
        <CompactKpiCard
          label="ORDERS"
          value={totalOrdersCount}
          change={ordersGrowth}
          icon={ShoppingCart}
          iconColor="#0D9488"
          iconBg="#CCFBF1"
        />
        <CompactKpiCard
          label="PRODUCTS"
          value={totalProductsCount}
          subtitle="Active listings"
          icon={Package}
          iconColor="#0D9488"
          iconBg="#CCFBF1"
        />
        <CompactKpiCard
          label="LOW STOCK"
          value={inventoryMetrics.lowStock}
          subtitle={`${inventoryMetrics.outOfStock} out of stock`}
          icon={AlertTriangle}
          iconColor="#D97706"
          iconBg="#FEF3C7"
          alertBorder={inventoryMetrics.outOfStock > 0 || inventoryMetrics.lowStock > 0}
        />
        <CompactKpiCard
          label="CUSTOMERS"
          value={totalCustomersCount}
          subtitle="Active accounts"
          icon={Users}
          iconColor="#0D9488"
          iconBg="#CCFBF1"
        />
      </div>

      {/* ── Second Row: Sales Overview (65%) + Order Overview (35%) ── */}
      <div
        className="analytics-chart-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        {/* Sales Overview Chart */}
        <div className="analytics-box" style={{ ...sectionBoxStyle, display: "flex", flexDirection: "column" }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h3 style={sectionTitleStyle}>Revenue & Sales Overview</h3>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>
                Trend for <strong style={{ color: "#14151A" }}>{topPeriodLabel}</strong>
              </p>
            </div>

            {/* Revenue & Sales Series Filters / Legend */}
            <div style={{ display: "flex", gap: "4px", backgroundColor: "#F7F7F2", padding: "3px", borderRadius: "8px", border: "1px solid #E7E7E2" }}>
              <button
                type="button"
                onClick={() => setChartMetric("both")}
                style={{
                  border: "none",
                  backgroundColor: chartMetric === "both" ? "#FFFFFF" : "transparent",
                  color: chartMetric === "both" ? "#14151A" : "#6B6B75",
                  fontSize: "11px",
                  fontWeight: chartMetric === "both" ? 700 : 500,
                  padding: "4px 9px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: chartMetric === "both" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontFamily: "inherit",
                }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("revenue")}
                style={{
                  border: "none",
                  backgroundColor: chartMetric === "revenue" ? "#FFFFFF" : "transparent",
                  color: chartMetric === "revenue" ? "#0D9488" : "#6B6B75",
                  fontSize: "11px",
                  fontWeight: chartMetric === "revenue" ? 700 : 500,
                  padding: "4px 9px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: chartMetric === "revenue" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#0D9488" }} />
                <span>Revenue</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("sales")}
                style={{
                  border: "none",
                  backgroundColor: chartMetric === "sales" ? "#FFFFFF" : "transparent",
                  color: chartMetric === "sales" ? "#1B1F8C" : "#6B6B75",
                  fontSize: "11px",
                  fontWeight: chartMetric === "sales" ? 700 : 500,
                  padding: "4px 9px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: chartMetric === "sales" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#1B1F8C" }} />
                <span>Sales (Sell)</span>
              </button>
            </div>
          </div>

          {/* Chart Container (compact height: 230px) */}
          <div style={{ position: "relative", width: "100%", height: "230px", marginTop: "8px", minHeight: 0 }}>
            {isMounted ? (
              <ResponsiveContainer width="99%" height="100%" debounce={50}>
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mellosoftSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    dy={4}
                  />
                  <YAxis
                    yAxisId="rev"
                    orientation="left"
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    hide={chartMetric === "sales"}
                    tickFormatter={(v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    hide={chartMetric === "revenue"}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {(chartMetric === "both" || chartMetric === "revenue") && (
                    <Area
                      yAxisId="rev"
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      fill="url(#mellosoftSalesGrad)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF", fill: "#0D9488" }}
                      animationDuration={300}
                    />
                  )}
                  {(chartMetric === "both" || chartMetric === "sales") && (
                    <Line
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      name="orders"
                      stroke="#1B1F8C"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: "#1B1F8C" }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#FFFFFF", fill: "#1B1F8C" }}
                      animationDuration={300}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: "100%", height: "230px", backgroundColor: "#FAFAF7", borderRadius: "8px" }} />
            )}

            {!hasChartData && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.75)",
                  color: "#9CA3AF",
                  fontSize: "12px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                No sales activity for this period.
              </div>
            )}
          </div>
        </div>

        {/* Order Overview Breakdown */}
        <div className="analytics-box" style={{ ...sectionBoxStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={sectionHeaderStyle}>
              <div>
                <h3 style={sectionTitleStyle}>Order Overview</h3>
              </div>
              <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>
                {topPeriodLabel}
              </span>
            </div>

            {/* Status Breakdown list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
              {orderBreakdown.map((item) => (
                <div key={item.status} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                  <span style={{ color: "#4B5563", fontWeight: 500, flex: "0 0 80px" }}>{item.status}</span>
                  <div style={{ flex: 1, height: "4px", backgroundColor: "#F0F0EC", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.percent}%`, backgroundColor: item.color, borderRadius: "2px" }} />
                  </div>
                  <span style={{ fontWeight: 700, color: "#14151A", flexShrink: 0, minWidth: "20px", textAlign: "right" }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View All Orders button */}
          {navigateTo && (
            <button
              onClick={() => navigateTo("orders")}
              style={{
                width: "100%",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E7E7E2",
                borderRadius: "8px",
                color: "#14151A",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                marginTop: "16px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1B1F8C"; e.currentTarget.style.color = "#1B1F8C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E7E2"; e.currentTarget.style.color = "#14151A"; }}
            >
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Third Row: Recent Orders (65%) + Top Selling (35%) ── */}
      <div
        className="analytics-middle-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <RecentOrdersPanel
          orders={orders}
          customers={customers}
          navigateTo={navigateTo}
          setSelectedOrderId={setSelectedOrderId}
        />
        <TopSellingPanel
          orders={orders}
          products={products}
          navigateTo={navigateTo}
        />
      </div>

      {/* ── Fourth Row: Inventory Overview (30%) + Low Stock Alerts (70%) ── */}
      <div
        className="analytics-bottom-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2.1fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <InventoryOverviewPanel
          products={products}
          navigateTo={navigateTo}
        />
        <LowStockAlertsPanel
          products={products}
          navigateTo={navigateTo}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────────────────────
const sectionBoxStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  padding: "16px 18px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
};

const sectionTitleStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#14151A",
  margin: 0,
};

const viewAllBtnStyle = {
  background: "none",
  border: "none",
  color: "#0D9488",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "2px 6px",
  borderRadius: "4px",
};

const thStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "0 8px 8px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  fontSize: "13px",
  color: "#14151A",
  padding: "10px 8px",
  verticalAlign: "middle",
};
