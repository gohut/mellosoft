import { MOCK_PRODUCTS } from "../../data/products";

// Sales chart data for different time filters
export const SALES_CHART_DATA = {
  today: [
    { label: "12AM", orders: 2, revenue: 1890 },
    { label: "3AM", orders: 0, revenue: 0 },
    { label: "6AM", orders: 4, revenue: 3120 },
    { label: "9AM", orders: 11, revenue: 9870 },
    { label: "12PM", orders: 18, revenue: 16450 },
    { label: "3PM", orders: 22, revenue: 20100 },
    { label: "6PM", orders: 15, revenue: 13890 },
    { label: "9PM", orders: 9, revenue: 8240 },
  ],
  last7Days: [
    { label: "Mon", orders: 42, revenue: 38600 },
    { label: "Tue", orders: 58, revenue: 51200 },
    { label: "Wed", orders: 35, revenue: 31900 },
    { label: "Thu", orders: 71, revenue: 64800 },
    { label: "Fri", orders: 89, revenue: 82300 },
    { label: "Sat", orders: 94, revenue: 91500 },
    { label: "Sun", orders: 63, revenue: 57400 },
  ],
  last30Days: [
    { label: "Jul 3", orders: 29, revenue: 26400 },
    { label: "Jul 6", orders: 41, revenue: 37800 },
    { label: "Jul 9", orders: 55, revenue: 50200 },
    { label: "Jul 12", orders: 38, revenue: 34600 },
    { label: "Jul 15", orders: 62, revenue: 57100 },
    { label: "Jul 18", orders: 73, revenue: 67400 },
    { label: "Jul 21", orders: 48, revenue: 44000 },
    { label: "Jul 24", orders: 81, revenue: 74800 },
    { label: "Jul 27", orders: 91, revenue: 84200 },
    { label: "Jul 30", orders: 68, revenue: 62500 },
  ],
  last6Months: [
    { label: "Feb", orders: 312, revenue: 285600 },
    { label: "Mar", orders: 398, revenue: 364200 },
    { label: "Apr", orders: 445, revenue: 408100 },
    { label: "May", orders: 502, revenue: 461300 },
    { label: "Jun", orders: 478, revenue: 439000 },
    { label: "Jul", orders: 589, revenue: 541800 },
  ],
  thisYear: [
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

// Re-export products
export { MOCK_PRODUCTS };

// Dashboard statistics
export const DASHBOARD_STATS = {
  totalRevenue: 2847500,
  totalOrders: 342,
  totalCustomers: 1205,
  totalProducts: MOCK_PRODUCTS.length,
  revenueChange: 12.5,
  ordersChange: 8.2,
  customersChange: 15.3,
  productsChange: 2.1,
};

// Mock orders
export const MOCK_ORDERS = [
  {
    id: "MS-92841",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    products: ["Mellosoft Classic Mattress", "Organic Mattress Protector"],
    amount: 968,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    date: "2026-08-01",
  },
  {
    id: "MS-92840",
    customer: "Priya Patel",
    email: "priya@example.com",
    products: ["Mellosoft Luxe Hybrid"],
    amount: 1299,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    date: "2026-08-01",
  },
  {
    id: "MS-92839",
    customer: "Ankit Gupta",
    email: "ankit@example.com",
    products: ["Luxury Down Pillow", "Luxury Down Pillow"],
    amount: 178,
    paymentStatus: "Paid",
    orderStatus: "Pending",
    date: "2026-07-31",
  },
  {
    id: "MS-92838",
    customer: "Sneha Reddy",
    email: "sneha@example.com",
    products: ["Solid Oak Bed Frame"],
    amount: 799,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    date: "2026-07-30",
  },
  {
    id: "MS-92837",
    customer: "Vikram Singh",
    email: "vikram@example.com",
    products: ["Mellosoft Ergo Air", "Organic Mattress Protector"],
    amount: 1068,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    date: "2026-07-30",
  },
  {
    id: "MS-92836",
    customer: "Meera Joshi",
    email: "meera@example.com",
    products: ["Mellosoft Ortho Support"],
    amount: 949,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    date: "2026-07-29",
  },
  {
    id: "MS-92835",
    customer: "Arjun Nair",
    email: "arjun@example.com",
    products: ["Mellosoft Latex Serene"],
    amount: 1099,
    paymentStatus: "Failed",
    orderStatus: "Cancelled",
    date: "2026-07-28",
  },
  {
    id: "MS-92834",
    customer: "Kavitha Menon",
    email: "kavitha@example.com",
    products: ["Luxury Down Pillow"],
    amount: 89,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    date: "2026-07-27",
  },
];

// Mock customers
export const MOCK_CUSTOMERS = [
  { id: "C001", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", totalOrders: 5, totalSpending: 4250, status: "Active", avatar: "R" },
  { id: "C002", name: "Priya Patel", email: "priya@example.com", phone: "+91 87654 32109", totalOrders: 3, totalSpending: 2890, status: "Active", avatar: "P" },
  { id: "C003", name: "Ankit Gupta", email: "ankit@example.com", phone: "+91 76543 21098", totalOrders: 2, totalSpending: 1780, status: "Active", avatar: "A" },
  { id: "C004", name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 65432 10987", totalOrders: 4, totalSpending: 3560, status: "Active", avatar: "S" },
  { id: "C005", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 54321 09876", totalOrders: 1, totalSpending: 1068, status: "Active", avatar: "V" },
  { id: "C006", name: "Meera Joshi", email: "meera@example.com", phone: "+91 43210 98765", totalOrders: 6, totalSpending: 5340, status: "Active", avatar: "M" },
  { id: "C007", name: "Arjun Nair", email: "arjun@example.com", phone: "+91 32109 87654", totalOrders: 1, totalSpending: 0, status: "Inactive", avatar: "A" },
  { id: "C008", name: "Kavitha Menon", email: "kavitha@example.com", phone: "+91 21098 76543", totalOrders: 2, totalSpending: 1580, status: "Active", avatar: "K" },
];

// Mock reviews for moderation
export const MOCK_REVIEWS = [
  { id: "RV001", customer: "Helen M.", product: "Mellosoft Classic Mattress", rating: 5, review: "Excellent mattress! It conforms to the body and turns very sharply on the comfort. Best sleep I've had in years.", date: "2026-08-01", status: "Approved" },
  { id: "RV002", customer: "Michael F.", product: "Mellosoft Luxe Hybrid", rating: 5, review: "This hybrid is outstanding. The pocket coils give it a nice bounce while the foam top cradles your body.", date: "2026-07-31", status: "Approved" },
  { id: "RV003", customer: "Diana C.", product: "Mellosoft Latex Serene", rating: 5, review: "I wanted a chemical-free mattress and this is perfect. It smells like sweet natural wool.", date: "2026-07-30", status: "Pending" },
  { id: "RV004", customer: "Gregory P.", product: "Mellosoft Ortho Support", rating: 5, review: "Finally, a mattress that is actually firm. My chiropractor recommended it and it has drastically reduced my back aches.", date: "2026-07-29", status: "Approved" },
  { id: "RV005", customer: "Laura W.", product: "Mellosoft Ergo Air", rating: 5, review: "This mattress is insanely comfortable. Like a soft hug but still supports you.", date: "2026-07-28", status: "Pending" },
  { id: "RV006", customer: "Tyler F.", product: "Organic Mattress Protector", rating: 5, review: "Saved our new mattress from a coffee spill on day three. Totally waterproof. Lifesaver.", date: "2026-07-27", status: "Approved" },
  { id: "RV007", customer: "Anonymous", product: "Mellosoft Classic Mattress", rating: 1, review: "Very bad quality. Do not buy.", date: "2026-07-26", status: "Rejected" },
];

// Mock coupons
export const MOCK_COUPONS = [
  { id: "CP001", code: "SUMMER30", discount: "30%", type: "percentage", usageCount: 145, usageLimit: 500, expiryDate: "2026-08-15", status: "Active" },
  { id: "CP002", code: "NEWUSER500", discount: "₹500", type: "fixed", usageCount: 89, usageLimit: 200, expiryDate: "2026-09-30", status: "Active" },
  { id: "CP003", code: "DIWALI25", discount: "25%", type: "percentage", usageCount: 320, usageLimit: 1000, expiryDate: "2026-11-01", status: "Active" },
  { id: "CP004", code: "FLAT1000", discount: "₹1,000", type: "fixed", usageCount: 50, usageLimit: 50, expiryDate: "2026-07-31", status: "Expired" },
  { id: "CP005", code: "FREESHIP", discount: "Free Shipping", type: "shipping", usageCount: 210, usageLimit: 0, expiryDate: "2026-12-31", status: "Active" },
];

// Mock categories
export const MOCK_CATEGORIES = [
  { id: "CAT001", name: "Mattresses", slug: "mattress", productCount: 5, image: "/asset/img1.jpg", description: "Premium sleep mattresses" },
  { id: "CAT002", name: "Pillows", slug: "pillows", productCount: 1, image: "/asset/pillow.png", description: "Luxury comfort pillows" },
  { id: "CAT003", name: "Bed Frames", slug: "bed frames", productCount: 1, image: "/asset/bedframe.png", description: "Solid wood bed frames" },
  { id: "CAT004", name: "Protectors", slug: "protectors", productCount: 1, image: "/asset/texture.png", description: "Mattress protectors" },
  { id: "CAT005", name: "Accessories", slug: "accessories", productCount: 0, image: "/asset/texture.png", description: "Sleep accessories" },
];

// Mock inventory
export const MOCK_INVENTORY = [
  { id: "INV001", product: "Mellosoft Classic Mattress", variant: "Queen / Medium", stock: 42, reserved: 5, available: 37, status: "In Stock" },
  { id: "INV002", product: "Mellosoft Classic Mattress", variant: "King / Firm", stock: 18, reserved: 3, available: 15, status: "In Stock" },
  { id: "INV003", product: "Mellosoft Luxe Hybrid", variant: "Queen / Medium", stock: 8, reserved: 2, available: 6, status: "Low Stock" },
  { id: "INV004", product: "Mellosoft Luxe Hybrid", variant: "King / Firm", stock: 3, reserved: 1, available: 2, status: "Low Stock" },
  { id: "INV005", product: "Mellosoft Latex Serene", variant: "Queen / Medium", stock: 25, reserved: 4, available: 21, status: "In Stock" },
  { id: "INV006", product: "Luxury Down Pillow", variant: "Standard / Soft", stock: 4, reserved: 2, available: 2, status: "Low Stock" },
  { id: "INV007", product: "Luxury Down Pillow", variant: "King / Medium", stock: 0, reserved: 0, available: 0, status: "Out of Stock" },
  { id: "INV008", product: "Solid Oak Bed Frame", variant: "Queen / Standard", stock: 12, reserved: 1, available: 11, status: "In Stock" },
  { id: "INV009", product: "Organic Mattress Protector", variant: "Queen / Standard", stock: 65, reserved: 8, available: 57, status: "In Stock" },
  { id: "INV010", product: "Mellosoft Ergo Air", variant: "Twin / Soft", stock: 0, reserved: 0, available: 0, status: "Out of Stock" },
];

// Recent activity feed
export const RECENT_ACTIVITY = [
  { id: 1, type: "order", text: "Rahul Sharma placed order #MS-92841", time: "2 min ago" },
  { id: 2, type: "review", text: "New 5-star review on Luxe Hybrid", time: "18 min ago" },
  { id: 3, type: "stock", text: "Low stock alert: Luxury Down Pillow (4 units)", time: "45 min ago" },
  { id: 4, type: "customer", text: "New customer registration: Kavitha Menon", time: "1 hr ago" },
  { id: 5, type: "order", text: "Priya Patel's order #MS-92840 shipped", time: "2 hrs ago" },
  { id: 6, type: "coupon", text: "Coupon FLAT1000 has expired", time: "5 hrs ago" },
  { id: 7, type: "order", text: "Sneha Reddy's order #MS-92838 delivered", time: "1 day ago" },
];
