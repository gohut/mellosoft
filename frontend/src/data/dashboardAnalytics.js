/**
 * dashboardAnalytics.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised data source for the Sales & Orders analytics section.
 * Each period exports:
 *   kpis        – scalar values shown in the four stat cards
 *   chartData   – array consumed by the Recharts AreaChart
 *
 * "change" values represent period-over-period percentage change.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── TODAY ─────────────────────────────────────────────────────────────────────
export const todayData = {
  kpis: {
    totalRevenue:    { value: 73560,  display: "₹73,560",   change: 9.3  },
    totalOrders:     { value: 81,     display: "81",         change: 14.1 },
    totalCustomers:  { value: 47,     display: "47",         change: 6.8  },
    totalProducts:   { value: 28,     display: "28",         change: 2.1  },
  },
  chartData: [
    { label: "12 AM", orders: 2,  revenue: 1890  },
    { label: "3 AM",  orders: 0,  revenue: 0     },
    { label: "6 AM",  orders: 4,  revenue: 3120  },
    { label: "9 AM",  orders: 11, revenue: 9870  },
    { label: "12 PM", orders: 18, revenue: 16450 },
    { label: "3 PM",  orders: 22, revenue: 20100 },
    { label: "6 PM",  orders: 15, revenue: 13890 },
    { label: "9 PM",  orders: 9,  revenue: 8240  },
  ],
};

// ── LAST 7 DAYS ───────────────────────────────────────────────────────────────
export const last7DaysData = {
  kpis: {
    totalRevenue:    { value: 417700, display: "₹4,17,700",  change: 8.4  },
    totalOrders:     { value: 452,    display: "452",         change: 12.0 },
    totalCustomers:  { value: 318,    display: "318",         change: 10.5 },
    totalProducts:   { value: 28,     display: "28",          change: 2.1  },
  },
  chartData: [
    { label: "Mon", orders: 42, revenue: 38600 },
    { label: "Tue", orders: 58, revenue: 51200 },
    { label: "Wed", orders: 35, revenue: 31900 },
    { label: "Thu", orders: 71, revenue: 64800 },
    { label: "Fri", orders: 89, revenue: 82300 },
    { label: "Sat", orders: 94, revenue: 91500 },
    { label: "Sun", orders: 63, revenue: 57400 },
  ],
};

// ── LAST 30 DAYS ──────────────────────────────────────────────────────────────
export const last30DaysData = {
  kpis: {
    totalRevenue:    { value: 1186400, display: "₹11,86,400", change: 15.2 },
    totalOrders:     { value: 1284,    display: "1,284",       change: 18.6 },
    totalCustomers:  { value: 876,     display: "876",         change: 13.4 },
    totalProducts:   { value: 28,      display: "28",          change: 2.1  },
  },
  chartData: [
    { label: "Jul 3",  orders: 29, revenue: 26400  },
    { label: "Jul 6",  orders: 41, revenue: 37800  },
    { label: "Jul 9",  orders: 55, revenue: 50200  },
    { label: "Jul 12", orders: 38, revenue: 34600  },
    { label: "Jul 15", orders: 62, revenue: 57100  },
    { label: "Jul 18", orders: 73, revenue: 67400  },
    { label: "Jul 21", orders: 48, revenue: 44000  },
    { label: "Jul 24", orders: 81, revenue: 74800  },
    { label: "Jul 27", orders: 91, revenue: 84200  },
    { label: "Jul 30", orders: 68, revenue: 62500  },
  ],
};

// ── LAST 6 MONTHS ─────────────────────────────────────────────────────────────
export const last6MonthsData = {
  kpis: {
    totalRevenue:    { value: 2504000, display: "₹25,04,000", change: 19.1 },
    totalOrders:     { value: 2724,    display: "2,724",       change: 22.4 },
    totalCustomers:  { value: 1205,    display: "1,205",       change: 15.3 },
    totalProducts:   { value: 28,      display: "28",          change: 2.1  },
  },
  chartData: [
    { label: "Feb", orders: 312, revenue: 285600 },
    { label: "Mar", orders: 398, revenue: 364200 },
    { label: "Apr", orders: 445, revenue: 408100 },
    { label: "May", orders: 502, revenue: 461300 },
    { label: "Jun", orders: 478, revenue: 439000 },
    { label: "Jul", orders: 589, revenue: 541800 },
  ],
};

// ── THIS YEAR ─────────────────────────────────────────────────────────────────
export const thisYearData = {
  kpis: {
    totalRevenue:    { value: 3447800, display: "₹34,47,800", change: 27.8 },
    totalOrders:     { value: 3746,    display: "3,746",       change: 31.2 },
    totalCustomers:  { value: 1205,    display: "1,205",       change: 15.3 },
    totalProducts:   { value: 28,      display: "28",          change: 2.1  },
  },
  chartData: [
    { label: "Jan", orders: 280, revenue: 256800 },
    { label: "Feb", orders: 312, revenue: 285600 },
    { label: "Mar", orders: 398, revenue: 364200 },
    { label: "Apr", orders: 445, revenue: 408100 },
    { label: "May", orders: 502, revenue: 461300 },
    { label: "Jun", orders: 478, revenue: 439000 },
    { label: "Jul", orders: 589, revenue: 541800 },
    { label: "Aug", orders: 342, revenue: 314500 },
  ],
};

// ── Period map for useMemo lookup ─────────────────────────────────────────────
export const PERIOD_DATA_MAP = {
  today:       todayData,
  last7Days:   last7DaysData,
  last30Days:  last30DaysData,
  last6Months: last6MonthsData,
  thisYear:    thisYearData,
};

export const TIME_FILTERS = [
  { id: "today",       label: "Today"        },
  { id: "last7Days",   label: "Last 7 Days"  },
  { id: "last30Days",  label: "Last 30 Days" },
  { id: "last6Months", label: "Last 6 Months"},
  { id: "thisYear",    label: "This Year"    },
];
