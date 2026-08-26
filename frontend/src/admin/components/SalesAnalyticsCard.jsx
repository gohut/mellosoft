"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { TIME_FILTERS } from "../../data/dashboardAnalytics";
import { useAdmin } from "../context/AdminContext";
import StatusBadge from "./StatusBadge";
import { formatPrice } from "../../utils/currency";
import {
  calculateTotalRevenue,
  getOrdersForPeriod,
  generateDashboardChartData,
  getLowStockItems,
  LOW_STOCK_THRESHOLD,
  calculatePeriodGrowth
} from "../utils/dashboardHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Animated number hook – counts from previous to next value on change
// ─────────────────────────────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 500) {
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

    const isFloat = !Number.isInteger(to);

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(isFloat ? parseFloat(current.toFixed(2)) : Math.round(current));
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
// KPI card config
// ─────────────────────────────────────────────────────────────────────────────
const KPI_CONFIG = [
  { key: "totalRevenue",   label: "Total Revenue",   icon: DollarSign,   color: "#16A34A", bg: "#DCFCE7", prefix: "₹", suffix: "",  decimals: 0 },
  { key: "totalOrders",   label: "Total Orders",    icon: ShoppingCart, color: "#1B1F8C", bg: "#E8E9F8", prefix: "",  suffix: "",  decimals: 0 },
  { key: "totalCustomers", label: "Total Customers", icon: Users,        color: "#F59E0B", bg: "#FEF3C7", prefix: "",  suffix: "",  decimals: 0 },
  { key: "totalProducts",  label: "Total Products",  icon: Package,      color: "#8B5CF6", bg: "#EDE9FE", prefix: "",  suffix: "",  decimals: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Custom dark tooltip
// ─────────────────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: "#14151A",
      borderRadius: "10px",
      padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      border: "1px solid rgba(255,255,255,0.07)",
      minWidth: "168px",
    }}>
      <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px", fontWeight: 600, margin: "0 0 10px" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: entry.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
            {entry.name === "orders" ? "Orders" : "Revenue"}:
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFF", marginLeft: "auto" }}>
            {entry.name === "orders" ? entry.value : `₹${Number(entry.value).toLocaleString("en-IN")}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated KPI Card
// ─────────────────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, display, change, color, bg, prefix, suffix, decimals }) {
  const animatedValue = useAnimatedNumber(value, 480);
  const hasChange = typeof change === "number" && !isNaN(change);
  const isPositive = hasChange && change >= 0;

  // Format the animated number for display
  const formatted = (() => {
    if (label === "Total Revenue") {
      return `₹${Math.round(animatedValue).toLocaleString("en-IN")}`;
    }
    return Math.round(animatedValue).toLocaleString("en-IN");
  })();

  return (
    <div className="analytics-mini-card" style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #E7E7E2",
      borderRadius: "12px",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      flex: 1,
      minWidth: 0,
      boxSizing: "border-box",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
    }}>
      {/* Icon + badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
        {hasChange && (
          <div className="analytics-mini-badge" style={{
            display: "flex", alignItems: "center", gap: 3,
            fontSize: "12px", fontWeight: 700,
            color: isPositive ? "#16A34A" : "#DC2626",
            backgroundColor: isPositive ? "#DCFCE7" : "#FEE2E2",
            padding: "3px 8px", borderRadius: 999,
            whiteSpace: "nowrap",
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="analytics-mini-value" style={{ fontSize: "22px", fontWeight: 800, color: "#14151A", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {formatted}
        </p>
        <p className="analytics-mini-label" style={{ fontSize: "12px", color: "#6B6B75", marginTop: 4, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
      </div>

      {/* Trend line */}
      {hasChange ? (
        <p className="analytics-mini-trend" style={{ fontSize: "11px", color: isPositive ? "#16A34A" : "#DC2626", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% vs last period
        </p>
      ) : (
        <p className="analytics-mini-trend" style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Live store metric
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Orders panel — Derived from canonical orders (newest first)
// ─────────────────────────────────────────────────────────────────────────────
function RecentOrdersPanel({ navigateTo }) {
  const { orders = [], customers = [], setSelectedOrderId } = useAdmin();
  const recentOrders = useMemo(() => {
    return (orders || []).slice(0, 5);
  }, [orders]);

  const handleOrderClick = (orderId) => {
    if (setSelectedOrderId) {
      setSelectedOrderId(orderId);
    }
    if (navigateTo) {
      navigateTo("orders");
    }
  };

  return (
    <div className="analytics-panel" style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCart size={16} color="#1B1F8C" />
          <span style={panelTitleStyle}>Recent Orders</span>
        </div>
        {navigateTo && (
          <button onClick={() => navigateTo("orders")} style={viewAllStyle}>View All</button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="admin-desktop-only" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #EEEEE9", textAlign: "left" }}>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#9CA3AF" }}>
                  No recent orders yet. Real customer orders will appear here.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => {
                const cust = (customers || []).find((c) => c.id === order.customerId || c.id === order.userId || c.email === order.email) || {
                  name: order.customerName || order.deliveryAddress?.fullName || "Guest Customer",
                };
                return (
                  <tr
                    key={order.id || order.orderId}
                    style={{ borderBottom: "1px solid #F4F4F0", cursor: "pointer", transition: "background-color 0.15s ease" }}
                    onClick={() => handleOrderClick(order.id || order.orderId)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9F9F7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#1B1F8C" }}>{order.id || order.orderId}</td>
                    <td style={{ ...tdStyle, color: "#14151A", fontWeight: 500 }}>{cust.name}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#14151A" }}>{formatPrice(order.totalAmount ?? order.amount ?? order.total)}</td>
                    <td style={tdStyle}><StatusBadge status={order.orderStatus} /></td>
                    <td style={{ ...tdStyle, color: "#6B6B75", fontSize: "12px" }}>{order.createdAt || order.date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="admin-mobile-only" style={{ display: "none", flexDirection: "column", gap: "8px" }}>
        {recentOrders.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
            No recent orders yet. Real customer orders will appear here.
          </div>
        ) : (
          recentOrders.map((order) => {
            const cust = (customers || []).find((c) => c.id === order.customerId || c.id === order.userId || c.email === order.email) || {
              name: order.customerName || order.deliveryAddress?.fullName || "Guest Customer",
            };
            return (
              <div
                key={order.id || order.orderId}
                onClick={() => handleOrderClick(order.id || order.orderId)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "10px 12px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #EEEEE9",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#1B1F8C", fontSize: "13px" }}>{order.id || order.orderId}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <span style={{ color: "#14151A", fontWeight: 600 }}>{cust.name}</span>
                  <span style={{ fontWeight: 700, color: "#14151A" }}>{formatPrice(order.totalAmount ?? order.amount ?? order.total)}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#6B6B75" }}>{order.createdAt || order.date}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Low Stock panel — Derived from canonical products & variant stock
// ─────────────────────────────────────────────────────────────────────────────
function LowStockPanel({ navigateTo }) {
  const { products, setSelectedProductId } = useAdmin();
  const lowStock = useMemo(() => {
    return getLowStockItems(products, LOW_STOCK_THRESHOLD).slice(0, 5);
  }, [products]);

  const stockColors = {
    "Out of Stock": { bg: "#FEE2E2", text: "#DC2626" },
    "Low Stock":    { bg: "#FEF3C7", text: "#B45309" },
  };

  const handleRestockClick = (productId) => {
    if (navigateTo) {
      navigateTo("products");
    }
  };

  return (
    <div className="analytics-panel" style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color="#F59E0B" />
          <span style={panelTitleStyle}>Low Stock Products</span>
        </div>
        {navigateTo && (
          <button onClick={() => navigateTo("products")} style={viewAllStyle}>View All</button>
        )}
      </div>

      {/* Desktop List View */}
      <div className="admin-desktop-only" style={{ display: "flex", flexDirection: "column" }}>
        {lowStock.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", color: "#16A34A", fontSize: "13px", fontWeight: 600 }}>
            ✓ All products have healthy inventory levels!
          </div>
        ) : (
          lowStock.map((item, idx) => {
            const c = stockColors[item.status] || { bg: "#F3F4F6", text: "#374151" };
            return (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0",
                borderBottom: idx < lowStock.length - 1 ? "1px solid #F4F4F0" : "none",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
                  🛏️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product}</p>
                  <p style={{ fontSize: "11px", color: "#6B6B75", margin: "2px 0 0" }}>{item.variant}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: item.available === 0 ? "#DC2626" : "#14151A", margin: 0 }}>{item.available}</p>
                  <p style={{ fontSize: "10px", color: "#6B6B75", margin: "2px 0 0" }}>units left</p>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: c.text, backgroundColor: c.bg, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                  {item.status}
                </span>
                <button
                  onClick={() => handleRestockClick(item.productId)}
                  style={{ border: "1px solid #1B1F8C", backgroundColor: "transparent", color: "#1B1F8C", fontSize: "11px", fontWeight: 700, padding: "5px 10px", borderRadius: 7, cursor: "pointer", flexShrink: 0, transition: "background-color 0.15s, color 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1B1F8C"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1B1F8C"; }}
                >
                  Restock
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Card List View */}
      <div className="admin-mobile-only" style={{ display: "none", flexDirection: "column", gap: "8px" }}>
        {lowStock.length === 0 ? (
          <div style={{ padding: "12px", textAlign: "center", color: "#16A34A", fontSize: "12px" }}>
            ✓ All products have healthy inventory levels!
          </div>
        ) : (
          lowStock.map((item) => {
            const c = stockColors[item.status] || { bg: "#F3F4F6", text: "#374151" };
            return (
              <div key={item.id} style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "10px 12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #EEEEE9",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                    🛏️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.product}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6B6B75", margin: "1px 0 0" }}>{item.variant}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px dashed #F4F4F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: item.available === 0 ? "#DC2626" : "#14151A" }}>
                      {item.available} units left
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: c.text, backgroundColor: c.bg, padding: "2px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      {item.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestockClick(item.productId)}
                    style={{ border: "1px solid #1B1F8C", backgroundColor: "transparent", color: "#1B1F8C", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Restock
                  </button>
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
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function SalesAnalyticsCard({ navigateTo }) {
  const { orders = [], customers = [], products = [] } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState("last7Days");
  const [hiddenLines, setHiddenLines]       = useState({});
  const [isMounted, setIsMounted]           = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Derived dynamic KPI metrics strictly from canonical datasets ───────────
  const totalRevenue = useMemo(() => calculateTotalRevenue(orders), [orders]);
  const totalOrdersCount = useMemo(() => orders.length, [orders]);
  const totalCustomersCount = useMemo(() => customers.length, [customers]);
  const totalProductsCount = useMemo(() => products.length, [products]);

  // Derived chart data & time filter metrics
  const chartData = useMemo(() => {
    return generateDashboardChartData(orders, selectedPeriod);
  }, [orders, selectedPeriod]);

  const { revenueGrowth, ordersGrowth } = useMemo(() => {
    return calculatePeriodGrowth(orders, selectedPeriod);
  }, [orders, selectedPeriod]);

  const kpis = useMemo(() => {
    return {
      totalRevenue:   { value: totalRevenue, change: revenueGrowth },
      totalOrders:    { value: totalOrdersCount, change: ordersGrowth },
      totalCustomers: { value: totalCustomersCount, change: null },
      totalProducts:  { value: totalProductsCount, change: null },
    };
  }, [totalRevenue, totalOrdersCount, totalCustomersCount, totalProductsCount, revenueGrowth, ordersGrowth]);

  // ── Handle filter click ──────────────────────────────────────────────────
  const handleFilterChange = useCallback((periodId) => {
    setSelectedPeriod(periodId);
  }, []);

  const toggleLine = useCallback((dataKey) => {
    setHiddenLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  }, []);

  return (
    <div className="analytics-card-container" style={cardStyle}>

      {/* ── Card Header ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#E8E9F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={17} color="#1B1F8C" />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: 0, letterSpacing: "-0.01em" }}>
              Sales &amp; Orders Overview
            </h2>
          </div>
          <p className="analytics-header-subtitle" style={{ fontSize: "13px", color: "#6B6B75", margin: "0 0 0 42px" }}>
            Track daily sales performance and customer orders.
          </p>
        </div>

        {/* ── Time Filter Buttons ── */}
        <div className="analytics-time-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TIME_FILTERS.map((f) => {
            const isActive = selectedPeriod === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id)}
                className="analytics-time-filter-btn"
                style={{
                  border: isActive ? "none" : "1px solid #E7E7E2",
                  backgroundColor: isActive ? "#1B1F8C" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#6B6B75",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  padding: "6px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  fontFamily: "inherit",
                  outline: "none",
                  boxShadow: isActive ? "0 2px 8px rgba(27,31,140,0.25)" : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Animated KPI Cards ────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="analytics-mini-grid">
        {KPI_CONFIG.map((cfg) => {
          const kpi = kpis[cfg.key];
          return (
            <KpiCard
              key={cfg.key}
              icon={cfg.icon}
              label={cfg.label}
              value={kpi.value}
              display={kpi.display}
              change={kpi.change}
              color={cfg.color}
              bg={cfg.bg}
              prefix={cfg.prefix}
              suffix={cfg.suffix}
              decimals={cfg.decimals}
            />
          );
        })}
      </div>

      {/* ── Recharts Area Chart ───────────────────────────────────────────── */}
      <div className="analytics-chart-box" style={{ backgroundColor: "#FAFAF8", borderRadius: 12, border: "1px solid #EEEEE9", padding: "20px 8px 8px 4px", minWidth: 0, overflow: "hidden" }}>

        {/* Legend toggle */}
        <div style={{ display: "flex", gap: 16, paddingLeft: 12, marginBottom: 12 }}>
          {[{ key: "orders", color: "#1B1F8C", label: "Orders" }, { key: "revenue", color: "#16A34A", label: "Revenue" }].map(({ key, color, label }) => (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              title={hiddenLines[key] ? `Show ${label}` : `Hide ${label}`}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 8px", borderRadius: 7,
                opacity: hiddenLines[key] ? 0.35 : 1,
                transition: "opacity 0.2s",
                fontFamily: "inherit",
              }}
            >
              <span style={{ width: 24, height: 3, borderRadius: 999, backgroundColor: color, display: "inline-block" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#14151A" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* The chart – key on AreaChart forces re-animation without remounting ResponsiveContainer */}
        <div className="analytics-chart-container" style={{ position: "relative", width: "100%", height: "280px", minWidth: 0, minHeight: 0 }}>
          {isMounted ? (
            <ResponsiveContainer width="99%" height="100%" debounce={100}>
              <AreaChart key={selectedPeriod} data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1B1F8C" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1B1F8C" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E2" vertical={false} />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="left"
                  tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#9CA3AF", fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) => `₹${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />

                <Tooltip content={<CustomTooltip />} />

                {!hiddenLines.orders && (
                  <Area
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    name="orders"
                    stroke="#1B1F8C"
                    strokeWidth={2.5}
                    fill="url(#analyticsOrdersGrad)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#1B1F8C" }}
                    animationDuration={300}
                    animationEasing="ease-out"
                  />
                )}
                {!hiddenLines.revenue && (
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    fill="url(#analyticsRevenueGrad)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#16A34A" }}
                    animationDuration={300}
                    animationEasing="ease-out"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: "100%", height: "280px" }} />
          )}
        </div>
      </div>

      {/* ── Two-column: Recent Orders + Low Stock ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="analytics-bottom-grid">
        <RecentOrdersPanel navigateTo={navigateTo} />
        <LowStockPanel navigateTo={navigateTo} />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared style objects
// ─────────────────────────────────────────────────────────────────────────────
const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
};

const panelStyle = {
  backgroundColor: "#FAFAF8",
  borderRadius: "10px",
  border: "1px solid #EEEEE9",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const panelTitleStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#14151A",
};

const viewAllStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "3px 8px",
  borderRadius: 6,
};

const thStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "0 8px 10px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  fontSize: "13px",
  color: "#14151A",
  padding: "11px 8px",
  verticalAlign: "middle",
};
