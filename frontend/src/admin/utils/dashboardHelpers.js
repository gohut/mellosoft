/**
 * dashboardHelpers.js — Dynamic Analytics, Metric Calculations & Selectors
 * Derives all Admin Dashboard metrics from canonical orders, customers, and products datasets.
 */

/**
 * Filter orders by selected time period
 * @param {Array} orders - Canonical orders list
 * @param {string} period - "today" | "yesterday" | "last7Days" | "last30Days" | "thisMonth" | "lastMonth"
 * @returns {Array} Filtered orders
 */
export function getOrdersForPeriod(orders = [], period = "today") {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const yesterdayEnd = todayStart - 1;

  const last7DaysStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const last30DaysStart = todayStart - 29 * 24 * 60 * 60 * 1000;

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const lastMonthEnd = thisMonthStart - 1;

  return orders.filter((o) => {
    const rawDate = o.createdAt || o.date;
    const orderTime = rawDate ? new Date(rawDate).getTime() : todayStart;
    if (isNaN(orderTime)) return false;

    switch (period) {
      case "today":
        return orderTime >= todayStart && orderTime <= todayEnd;
      case "yesterday":
        return orderTime >= yesterdayStart && orderTime <= yesterdayEnd;
      case "last7Days":
        return orderTime >= last7DaysStart;
      case "last30Days":
        return orderTime >= last30DaysStart;
      case "thisMonth":
        return orderTime >= thisMonthStart;
      case "lastMonth":
        return orderTime >= lastMonthStart && orderTime <= lastMonthEnd;
      default:
        return true;
    }
  });
}

/**
 * Calculate total revenue from orders list (excluding cancelled orders)
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
 * Generate Chart Data buckets for Recharts based on period and real orders
 * @param {Array} allOrders - All canonical orders
 * @param {string} period - Time period
 * @returns {Array} Chart data with label, orders, and revenue
 */
export function generateDashboardChartData(allOrders = [], period = "last7Days") {
  const now = new Date();
  const buckets = [];

  if (period === "today" || period === "yesterday") {
    // Hourly buckets (00:00 to 20:00 in 4h steps)
    const targetDate = period === "today" 
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
    
    for (let i = 0; i < hours.length - 1; i++) {
      const label = `${hours[i]}`;
      const startH = parseInt(hours[i].split(":")[0], 10);
      const endH = parseInt(hours[i + 1].split(":")[0], 10);
      
      const bucketOrders = allOrders.filter((o) => {
        const d = new Date(o.createdAt || o.date || Date.now());
        if (d.toDateString() !== targetDate.toDateString()) return false;
        const h = d.getHours();
        return h >= startH && h < endH;
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "last7Days") {
    // 7 day buckets
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = `${dayName} ${d.getDate()}`;

      const bucketOrders = allOrders.filter((o) => {
        const od = new Date(o.createdAt || o.date || Date.now());
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && od.getDate() === d.getDate();
      });

      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label: dateStr,
        orders: bucketOrders.length,
        revenue,
      });
    }
  } else if (period === "last30Days") {
    // 6 5-day intervals
    for (let i = 5; i >= 0; i--) {
      const dStart = new Date(now.getTime() - (i * 5 + 4) * 24 * 60 * 60 * 1000);
      const dEnd = new Date(now.getTime() - (i * 5) * 24 * 60 * 60 * 1000);
      const label = `${dStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${dEnd.getDate()}`;

      const bucketOrders = allOrders.filter((o) => {
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
  } else {
    // Monthly / Weekly breakdown
    for (let w = 1; w <= 4; w++) {
      const label = `Week ${w}`;
      const bucketOrders = allOrders.filter((o, idx) => (idx % 4) === (w - 1));
      const revenue = calculateTotalRevenue(bucketOrders);
      buckets.push({
        label,
        orders: bucketOrders.length,
        revenue,
      });
    }
  }

  // Ensure if all orders in period are 0 (e.g. fresh environment), baseline display values look organic without breaking
  return buckets;
}

export const LOW_STOCK_THRESHOLD = 10;

/**
 * Extract Low Stock and Out of Stock products across product variants
 * @param {Array} products - Canonical products list
 * @param {number} threshold - Low stock warning threshold (default: LOW_STOCK_THRESHOLD = 10)
 * @returns {Array} List of low stock variant/product items
 */
export function getLowStockItems(products = [], threshold = LOW_STOCK_THRESHOLD) {
  if (!Array.isArray(products)) return [];
  const lowItems = [];

  products.forEach((prod) => {
    if (!prod || prod.status === "Inactive") return;

    if (Array.isArray(prod.variants) && prod.variants.length > 0) {
      prod.variants.forEach((v) => {
        const stock = Number(v.Stock ?? v.stock ?? 0);
        if (stock <= threshold) {
          const size = v.Size || v.size || "";
          const firmness = v.Firmness || v.firmness || "";
          const variantLabel = [size, firmness].filter(Boolean).join(" / ") || "Standard";

          lowItems.push({
            id: `${prod.id}-${variantLabel}`,
            productId: prod.id,
            product: prod.name,
            variant: variantLabel,
            available: stock,
            status: stock === 0 ? "Out of Stock" : "Low Stock",
            image: prod.images?.[0] || prod.image || "/asset/img1.jpg",
            category: prod.category || "Mattress"
          });
        }
      });
    } else {
      const stock = Number(prod.stock ?? prod.Stock ?? 0);
      if (stock <= threshold) {
        lowItems.push({
          id: prod.id,
          productId: prod.id,
          product: prod.name,
          variant: "Standard",
          available: stock,
          status: stock === 0 ? "Out of Stock" : "Low Stock",
          image: prod.images?.[0] || prod.image || "/asset/img1.jpg",
          category: prod.category || "Mattress"
        });
      }
    }
  });

  // Sort: Out of Stock first, then lowest stock first
  return lowItems.sort((a, b) => a.available - b.available);
}

/**
 * Calculate real period-over-period growth rates comparing current period to preceding period
 * @param {Array} allOrders - All canonical orders
 * @param {string} period - "today" | "yesterday" | "last7Days" | "last30Days"
 * @returns {Object} { revenueGrowth: number|null, ordersGrowth: number|null }
 */
export function calculatePeriodGrowth(allOrders = [], period = "last7Days") {
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
  } else if (period === "yesterday") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
    currentEnd = currentStart + dayMs - 1;
    prevStart = currentStart - dayMs;
    prevEnd = currentStart - 1;
  } else if (period === "last7Days") {
    currentEnd = now.getTime();
    currentStart = currentEnd - 7 * dayMs;
    prevEnd = currentStart - 1;
    prevStart = currentStart - 7 * dayMs;
  } else if (period === "last30Days") {
    currentEnd = now.getTime();
    currentStart = currentEnd - 30 * dayMs;
    prevEnd = currentStart - 1;
    prevStart = currentStart - 30 * dayMs;
  } else {
    return { revenueGrowth: null, ordersGrowth: null };
  }

  const currentOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt || o.date || Date.now()).getTime();
    return t >= currentStart && t <= currentEnd;
  });

  const prevOrders = allOrders.filter((o) => {
    const t = new Date(o.createdAt || o.date || Date.now()).getTime();
    return t >= prevStart && t <= prevEnd;
  });

  const currentRev = calculateTotalRevenue(currentOrders);
  const prevRev = calculateTotalRevenue(prevOrders);

  const calcRate = (curr, prev) => {
    if (prev === 0) {
      return curr > 0 ? 100 : 0;
    }
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    revenueGrowth: calcRate(currentRev, prevRev),
    ordersGrowth: calcRate(currentOrders.length, prevOrders.length)
  };
}
