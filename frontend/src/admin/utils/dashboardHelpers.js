/**
 * dashboardHelpers.js — Dynamic Analytics, Metric Calculations & Selectors
 * Derives all Admin Dashboard metrics from canonical orders, customers, and products datasets.
 */

import { getProductPrimaryImage } from "../../utils/productHelpers";

export const LOW_STOCK_THRESHOLD = 10;

/**
 * Filter orders by selected time period
 * @param {Array} orders - Canonical orders list
 * @param {string} period - "today" | "7Days" | "last7Days" | "30Days" | "last30Days" | "thisMonth" | "6M" | "last6Months" | "12M" | "thisYear"
 * @returns {Array} Filtered orders
 */
export function getOrdersForPeriod(orders = [], period = "7Days") {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const last7DaysStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const last30DaysStart = todayStart - 29 * 24 * 60 * 60 * 1000;
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
  const thisYearStart = new Date(now.getFullYear(), 0, 1).getTime();

  return orders.filter((o) => {
    const rawDate = o.createdAt || o.date;
    const orderTime = rawDate ? new Date(rawDate).getTime() : todayStart;
    if (isNaN(orderTime)) return false;

    switch (period) {
      case "today":
        return orderTime >= todayStart && orderTime <= todayEnd;
      case "7Days":
      case "last7Days":
      case "7D":
        return orderTime >= last7DaysStart;
      case "30Days":
      case "last30Days":
      case "30D":
      case "thisMonth":
        return orderTime >= last30DaysStart;
      case "6M":
      case "last6Months":
        return orderTime >= last6MonthsStart;
      case "12M":
      case "thisYear":
      case "year":
        return orderTime >= thisYearStart;
      case "overall":
      case "all":
        return true;
      default:
        return true;
    }
  });
}

/**
 * Calculate total revenue from orders list (excluding cancelled/refunded orders)
 * @param {Array} orders - Orders list
 * @returns {number} Sum of total amounts
 */
export function calculateTotalRevenue(orders = []) {
  if (!Array.isArray(orders)) return 0;
  return orders
    .filter((o) => {
      const st = (o.orderStatus || "").toLowerCase();
      return st !== "cancelled" && st !== "canceled";
    })
    .reduce((sum, o) => {
      const amt = Number(o.totalAmount ?? o.total ?? o.amount ?? 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
}

/**
 * Calculate total orders count
 */
export function calculateOrderCount(orders = []) {
  return Array.isArray(orders) ? orders.length : 0;
}

/**
 * Generate Chart Data buckets for Recharts based on period and real orders
 * @param {Array} allOrders - All canonical orders
 * @param {string} period - Time period
 * @returns {Array} Chart data with label, orders, and revenue
 */
export function generateDashboardChartData(allOrders = [], period = "7Days") {
  const now = new Date();
  const buckets = [];

  if (period === "today") {
    // Hourly buckets (00:00 to 20:00 in 4h intervals)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];

    for (let i = 0; i < hours.length - 1; i++) {
      const label = hours[i];
      const startH = parseInt(hours[i].split(":")[0], 10);
      const endH = parseInt(hours[i + 1].split(":")[0], 10);

      const bucketOrders = (allOrders || []).filter((o) => {
        const d = new Date(o.createdAt || o.date || Date.now());
        if (d.toDateString() !== todayStart.toDateString()) return false;
        const h = d.getHours();
        return h >= startH && (i === hours.length - 2 ? h <= endH : h < endH);
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "7Days" || period === "last7Days" || period === "7D") {
    // 7 distinct days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = days[d.getDay()];

      const bucketOrders = (allOrders || []).filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now());
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && od.getDate() === d.getDate();
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label: dayName,
        date: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "30Days" || period === "last30Days" || period === "30D" || period === "thisMonth") {
    // 6 5-day intervals
    for (let i = 5; i >= 0; i--) {
      const dStart = new Date(now.getTime() - (i * 5 + 4) * 24 * 60 * 60 * 1000);
      const dEnd = new Date(now.getTime() - (i * 5) * 24 * 60 * 60 * 1000);
      const label = `${dStart.getDate()} ${dStart.toLocaleString("en-US", { month: "short" })}`;

      const bucketOrders = (allOrders || []).filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now()).getTime();
        return od >= dStart.getTime() && od <= dEnd.getTime() + 24 * 60 * 60 * 1000 - 1;
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "6M" || period === "last6Months") {
    // 6 past months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });

      const bucketOrders = (allOrders || []).filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now());
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label: monthLabel,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "thisYear" || period === "year") {
    // Months of current year up to now (or full year)
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });

      const bucketOrders = (allOrders || []).filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now());
        return od.getFullYear() === now.getFullYear() && od.getMonth() === m;
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label: monthLabel,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else {
    // Overall / 12 Months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });

      const bucketOrders = (allOrders || []).filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now());
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label: monthLabel,
        orders: bucketOrders.length,
        revenue,
      });
    }
  }

  return buckets;
}

/**
 * Calculate real period-over-period growth rates comparing current period to preceding period
 * @param {Array} allOrders - All canonical orders
 * @param {string} period - "today" | "7Days" | "30Days" | "thisMonth"
 * @returns {Object} { revenueGrowth: number|null, ordersGrowth: number|null }
 */
export function calculatePeriodGrowth(allOrders = [], period = "7Days") {
  if (!Array.isArray(allOrders) || allOrders.length === 0) {
    return { revenueGrowth: null, ordersGrowth: null };
  }

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  let currentStart, currentEnd, prevStart, prevEnd;

  if (period === "today") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    currentEnd = currentStart + dayMs - 1;
    prevStart = currentStart - dayMs;
    prevEnd = currentStart - 1;
  } else if (period === "7Days" || period === "last7Days" || period === "7D") {
    currentEnd = now.getTime();
    currentStart = currentEnd - 7 * dayMs;
    prevEnd = currentStart - 1;
    prevStart = currentStart - 7 * dayMs;
  } else if (period === "30Days" || period === "last30Days" || period === "30D" || period === "thisMonth") {
    currentEnd = now.getTime();
    currentStart = currentEnd - 30 * dayMs;
    prevEnd = currentStart - 1;
    prevStart = currentStart - 30 * dayMs;
  } else if (period === "thisYear" || period === "year" || period === "12M") {
    currentStart = new Date(now.getFullYear(), 0, 1).getTime();
    currentEnd = now.getTime();
    prevStart = new Date(now.getFullYear() - 1, 0, 1).getTime();
    prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999).getTime();
  } else if (period === "overall" || period === "all") {
    return { revenueGrowth: null, ordersGrowth: null };
  } else {
    currentEnd = now.getTime();
    currentStart = currentEnd - 180 * dayMs;
    prevEnd = currentStart - 1;
    prevStart = currentStart - 180 * dayMs;
  }

  const currentOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt || o.date || Date.now()).getTime();
    return t >= currentStart && t <= currentEnd;
  });

  const prevOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt || o.date || Date.now()).getTime();
    return t >= prevStart && t <= prevEnd;
  });

  // If there are no previous period orders and no current orders, don't show 0%
  if (prevOrders.length === 0 && currentOrders.length === 0) {
    return { revenueGrowth: null, ordersGrowth: null };
  }

  const currentRev = calculateTotalRevenue(currentOrders);
  const prevRev = calculateTotalRevenue(prevOrders);

  const calcRate = (curr, prev) => {
    if (prev === 0) {
      return curr > 0 ? 100 : null;
    }
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    revenueGrowth: calcRate(currentRev, prevRev),
    ordersGrowth: calcRate(currentOrders.length, prevOrders.length),
  };
}

/**
 * Order status distribution breakdown for the order overview card
 */
export function getOrderStatusBreakdown(orders = []) {
  const counts = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Returned: 0,
    Cancelled: 0,
  };

  (orders || []).forEach((o) => {
    const st = (o.orderStatus || "").toLowerCase();
    if (st.includes("process") || st.includes("pending") || st.includes("confirm")) {
      counts.Processing += 1;
    } else if (st.includes("ship") || st.includes("transit") || st.includes("out")) {
      counts.Shipped += 1;
    } else if (st.includes("deliver")) {
      counts.Delivered += 1;
    } else if (st.includes("return") || st.includes("refund")) {
      counts.Returned += 1;
    } else if (st.includes("cancel")) {
      counts.Cancelled += 1;
    } else {
      counts.Processing += 1;
    }
  });

  const total = (orders || []).length || 1;

  return [
    { status: "Processing", count: counts.Processing, color: "#3B82F6", percent: Math.round((counts.Processing / total) * 100) },
    { status: "Shipped", count: counts.Shipped, color: "#8B5CF6", percent: Math.round((counts.Shipped / total) * 100) },
    { status: "Delivered", count: counts.Delivered, color: "#16A34A", percent: Math.round((counts.Delivered / total) * 100) },
    { status: "Returned", count: counts.Returned, color: "#F97316", percent: Math.round((counts.Returned / total) * 100) },
    { status: "Cancelled", count: counts.Cancelled, color: "#DC2626", percent: Math.round((counts.Cancelled / total) * 100) },
  ];
}

/**
 * Calculate top selling products aggregated from real order line items
 * @param {Array} orders - Live orders
 * @param {Array} products - Live products
 * @param {number} limit - Maximum number of products to return
 */
export function calculateTopSellingProducts(orders = [], products = [], limit = 5) {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  // Exclude cancelled orders
  const validOrders = orders.filter((o) => {
    const st = (o.orderStatus || "").toLowerCase();
    return st !== "cancelled" && st !== "canceled";
  });

  // Map to accumulate quantities and revenue per product
  const salesMap = {};

  validOrders.forEach((order) => {
    const items = order.items || order.products || [];
    items.forEach((item) => {
      const pid = item.productId || item.id || item.Product_Id;
      if (!pid) return;

      const qty = Number(item.quantity ?? item.qty ?? 1);
      const price = Number(item.price ?? item.actualPrice ?? item.Discounted_Price ?? 0);
      const revenue = price * qty;

      if (!salesMap[pid]) {
        salesMap[pid] = {
          productId: pid,
          name: item.name || item.productName || item.Product_Name || pid,
          image: item.image || item.thumbnail || null,
          unitsSold: 0,
          revenue: 0,
        };
      }

      salesMap[pid].unitsSold += qty;
      salesMap[pid].revenue += revenue;
      if (item.name && salesMap[pid].name === pid) {
        salesMap[pid].name = item.name;
      }
      if (item.image && !salesMap[pid].image) {
        salesMap[pid].image = item.image;
      }
    });
  });

  // Attach live product details (images, official name)
  const results = Object.values(salesMap).map((entry) => {
    const matchedProduct = (products || []).find((p) => (p.id === entry.productId || p.Product_Id === entry.productId));
    const prodName = matchedProduct ? (matchedProduct.Product_Name || matchedProduct.name) : entry.name;
    const prodImg = matchedProduct ? getProductPrimaryImage(matchedProduct) : entry.image || "/asset/img1.jpg";

    return {
      productId: entry.productId,
      name: prodName,
      image: prodImg,
      unitsSold: entry.unitsSold,
      revenue: entry.revenue,
    };
  });

  // Sort descending by unitsSold, then revenue
  results.sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);

  return results.slice(0, limit).map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
}

/**
 * Calculate total SKUs / variants, in stock, low stock, out of stock counts
 * @param {Array} products - Live products list
 * @param {number} threshold - Low stock threshold (default: 10)
 */
export function calculateInventoryMetrics(products = [], threshold = LOW_STOCK_THRESHOLD) {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      totalSkus: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      inStockPercent: 0,
      lowStockPercent: 0,
      outOfStockPercent: 0,
    };
  }

  let totalSkus = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  products.forEach((prod) => {
    if (!prod || prod.status === "Inactive" || prod.status === "Deleted") return;

    if (Array.isArray(prod.variants) && prod.variants.length > 0) {
      prod.variants.forEach((v) => {
        totalSkus += 1;
        const stock = Number(v.Stock ?? v.stock ?? 0);
        const minStock = Number(v.Threshold ?? v.threshold ?? prod.threshold ?? threshold);

        if (stock <= 0) {
          outOfStock += 1;
        } else if (stock <= minStock) {
          lowStock += 1;
        } else {
          inStock += 1;
        }
      });
    } else {
      totalSkus += 1;
      const stock = Number(prod.stock ?? prod.Stock ?? 0);
      const minStock = Number(prod.threshold ?? prod.Threshold ?? threshold);

      if (stock <= 0) {
        outOfStock += 1;
      } else if (stock <= minStock) {
        lowStock += 1;
      } else {
        inStock += 1;
      }
    }
  });

  const total = totalSkus || 1;

  return {
    totalSkus,
    inStock,
    lowStock,
    outOfStock,
    inStockPercent: Math.round((inStock / total) * 100),
    lowStockPercent: Math.round((lowStock / total) * 100),
    outOfStockPercent: Math.round((outOfStock / total) * 100),
  };
}

/**
 * Extract Low Stock and Out of Stock products across product variants
 * @param {Array} products - Canonical products list
 * @param {number} threshold - Low stock warning threshold (default: LOW_STOCK_THRESHOLD = 10)
 * @param {number} limit - Maximum number of rows to return
 * @returns {Array} List of low stock variant/product items
 */
export function getLowStockAlerts(products = [], threshold = LOW_STOCK_THRESHOLD, limit = 6) {
  if (!Array.isArray(products)) return [];
  const lowItems = [];

  products.forEach((prod) => {
    if (!prod || prod.status === "Inactive" || prod.status === "Deleted") return;

    if (Array.isArray(prod.variants) && prod.variants.length > 0) {
      prod.variants.forEach((v, vIdx) => {
        const stock = Number(v.Stock ?? v.stock ?? 0);
        const minStock = Number(v.Threshold ?? v.threshold ?? prod.threshold ?? threshold);

        if (stock <= minStock) {
          const size = v.Size || v.size || "";
          const firmness = v.Firmness || v.firmness || "";
          const variantLabel = [size, firmness].filter(Boolean).join(" / ") || `Variant ${vIdx + 1}`;
          const sku = v.SKU || v.sku || `${(prod.Product_Id || prod.id || "PROD").toUpperCase()}-${size.toUpperCase().slice(0, 3) || "STD"}`;

          lowItems.push({
            id: `${prod.id}-${vIdx}`,
            productId: prod.id,
            product: prod.Product_Name || prod.name,
            sku,
            variant: variantLabel,
            stock,
            minStock,
            status: stock <= 0 ? "Out of Stock" : "Low Stock",
            image: getProductPrimaryImage(prod),
          });
        }
      });
    } else {
      const stock = Number(prod.stock ?? prod.Stock ?? 0);
      const minStock = Number(prod.threshold ?? prod.Threshold ?? threshold);

      if (stock <= minStock) {
        const sku = prod.Product_Id || prod.sku || prod.SKU || `PROD-${prod.id}`;
        lowItems.push({
          id: prod.id,
          productId: prod.id,
          product: prod.Product_Name || prod.name,
          sku,
          variant: "Standard",
          stock,
          minStock,
          status: stock <= 0 ? "Out of Stock" : "Low Stock",
          image: getProductPrimaryImage(prod),
        });
      }
    }
  });

  // Sort: 0 stock first, then ascending stock
  lowItems.sort((a, b) => a.stock - b.stock);

  return typeof limit === "number" ? lowItems.slice(0, limit) : lowItems;
}

// Backward compatibility alias
export const getLowStockItems = getLowStockAlerts;

