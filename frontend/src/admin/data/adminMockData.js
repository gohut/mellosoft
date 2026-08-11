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

// Mock orders referencing customerId & productId
export const MOCK_ORDERS = [
  // Rahul Sharma (C001) - 5 Orders, Total: ₹4,250
  {
    id: "MS-92841",
    customerId: "C001",
    items: [
      { productId: "classic-mattress", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 899 },
      { productId: "organic-protector", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 69 },
    ],
    totalAmount: 968,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-08-01",
  },
  {
    id: "MS-92830",
    customerId: "C001",
    items: [
      { productId: "classic-mattress", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 899 },
    ],
    totalAmount: 899,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-15",
  },
  {
    id: "MS-92815",
    customerId: "C001",
    items: [
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Soft", quantity: 2, price: 89 },
    ],
    totalAmount: 178,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-20",
  },
  {
    id: "MS-92802",
    customerId: "C001",
    items: [
      { productId: "luxe-hybrid", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1299 },
    ],
    totalAmount: 1299,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-05-10",
  },
  {
    id: "MS-92790",
    customerId: "C001",
    items: [
      { productId: "classic-mattress", variantSize: "Twin", variantFirmness: "Soft", quantity: 1, price: 699 },
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Medium", quantity: 1, price: 89 },
      { productId: "organic-protector", variantSize: "Twin", variantFirmness: "Standard", quantity: 1, price: 118 },
    ],
    totalAmount: 906,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-04-01",
  },

  // Priya Patel (C002) - 3 Orders, Total: ₹2,890
  {
    id: "MS-92840",
    customerId: "C002",
    items: [
      { productId: "luxe-hybrid", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1299 },
    ],
    totalAmount: 1299,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    createdAt: "2026-08-01",
  },
  {
    id: "MS-92825",
    customerId: "C002",
    items: [
      { productId: "oak-bedframe", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 799 },
    ],
    totalAmount: 799,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-10",
  },
  {
    id: "MS-92810",
    customerId: "C002",
    items: [
      { productId: "classic-mattress", variantSize: "Twin", variantFirmness: "Soft", quantity: 1, price: 699 },
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Soft", quantity: 1, price: 93 },
    ],
    totalAmount: 792,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-05",
  },

  // Ankit Gupta (C003) - 2 Orders, Total: ₹1,780
  {
    id: "MS-92839",
    customerId: "C003",
    items: [
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Soft", quantity: 2, price: 89 },
    ],
    totalAmount: 178,
    paymentStatus: "Paid",
    orderStatus: "Pending",
    createdAt: "2026-07-31",
  },
  {
    id: "MS-92820",
    customerId: "C003",
    items: [
      { productId: "latex-serene", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1099 },
      { productId: "classic-mattress", variantSize: "Twin", variantFirmness: "Soft", quantity: 1, price: 503 },
    ],
    totalAmount: 1602,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-15",
  },

  // Sneha Reddy (C004) - 4 Orders, Total: ₹3,560
  {
    id: "MS-92838",
    customerId: "C004",
    items: [
      { productId: "oak-bedframe", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 799 },
    ],
    totalAmount: 799,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-30",
  },
  {
    id: "MS-92828",
    customerId: "C004",
    items: [
      { productId: "luxe-hybrid", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1299 },
    ],
    totalAmount: 1299,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-01",
  },
  {
    id: "MS-92812",
    customerId: "C004",
    items: [
      { productId: "ortho-support", variantSize: "Queen", variantFirmness: "Firm", quantity: 1, price: 949 },
    ],
    totalAmount: 949,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-05-25",
  },
  {
    id: "MS-92798",
    customerId: "C004",
    items: [
      { productId: "luxury-pillow", variantSize: "King", variantFirmness: "Medium", quantity: 3, price: 109 },
      { productId: "organic-protector", variantSize: "Queen", variantFirmness: "Standard", quantity: 2, price: 93 },
    ],
    totalAmount: 513,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-04-15",
  },

  // Vikram Singh (C005) - 1 Order
  {
    id: "MS-92837",
    customerId: "C005",
    items: [
      { productId: "ergo-air", variantSize: "Queen", variantFirmness: "Soft", quantity: 1, price: 999 },
      { productId: "organic-protector", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 69 },
    ],
    totalAmount: 1068,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    createdAt: "2026-07-30",
  },

  // Meera Joshi (C006) - 6 Orders, Total: ₹5,340
  {
    id: "MS-92836",
    customerId: "C006",
    items: [
      { productId: "ortho-support", variantSize: "Queen", variantFirmness: "Firm", quantity: 1, price: 949 },
    ],
    totalAmount: 949,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-29",
  },
  {
    id: "MS-92832",
    customerId: "C006",
    items: [
      { productId: "luxe-hybrid", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1299 },
    ],
    totalAmount: 1299,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-20",
  },
  {
    id: "MS-92822",
    customerId: "C006",
    items: [
      { productId: "classic-mattress", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 899 },
    ],
    totalAmount: 899,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-28",
  },
  {
    id: "MS-92816",
    customerId: "C006",
    items: [
      { productId: "latex-serene", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1099 },
    ],
    totalAmount: 1099,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-01",
  },
  {
    id: "MS-92805",
    customerId: "C006",
    items: [
      { productId: "oak-bedframe", variantSize: "Queen", variantFirmness: "Standard", quantity: 1, price: 799 },
    ],
    totalAmount: 799,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-05-15",
  },
  {
    id: "MS-92792",
    customerId: "C006",
    items: [
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Medium", quantity: 2, price: 89 },
      { productId: "organic-protector", variantSize: "Full", variantFirmness: "Standard", quantity: 1, price: 117 },
    ],
    totalAmount: 295,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-04-20",
  },

  // Arjun Nair (C007) - 1 Order (Cancelled)
  {
    id: "MS-92835",
    customerId: "C007",
    items: [
      { productId: "latex-serene", variantSize: "Queen", variantFirmness: "Medium", quantity: 1, price: 1099 },
    ],
    totalAmount: 1099,
    paymentStatus: "Failed",
    orderStatus: "Cancelled",
    createdAt: "2026-07-28",
  },

  // Kavitha Menon (C008) - 2 Orders, Total: ₹1,580
  {
    id: "MS-92834",
    customerId: "C008",
    items: [
      { productId: "luxury-pillow", variantSize: "Standard", variantFirmness: "Medium", quantity: 1, price: 89 },
    ],
    totalAmount: 89,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-07-27",
  },
  {
    id: "MS-92818",
    customerId: "C008",
    items: [
      { productId: "classic-mattress", variantSize: "King", variantFirmness: "Firm", quantity: 1, price: 1099 },
      { productId: "luxury-pillow", variantSize: "King", variantFirmness: "Soft", quantity: 2, price: 109 },
      { productId: "organic-protector", variantSize: "King", variantFirmness: "Standard", quantity: 2, price: 87 },
    ],
    totalAmount: 1491,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-10",
  },
];

// Normalized Mock Customers
export const MOCK_CUSTOMERS = [
  { id: "C001", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", status: "Active", avatar: "R", createdAt: "2026-01-15", lastLogin: "2026-08-10 14:32" },
  { id: "C002", name: "Priya Patel", email: "priya@example.com", phone: "+91 87654 32109", status: "Active", avatar: "P", createdAt: "2026-02-01", lastLogin: "2026-08-09 11:20" },
  { id: "C003", name: "Ankit Gupta", email: "ankit@example.com", phone: "+91 76543 21098", status: "Active", avatar: "A", createdAt: "2026-03-10", lastLogin: "2026-08-08 16:45" },
  { id: "C004", name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 65432 10987", status: "Active", avatar: "S", createdAt: "2026-04-12", lastLogin: "2026-07-30 09:15" },
  { id: "C005", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 54321 09876", status: "Active", avatar: "V", createdAt: "2026-05-20", lastLogin: "2026-07-30 18:22" },
  { id: "C006", name: "Meera Joshi", email: "meera@example.com", phone: "+91 43210 98765", status: "Active", avatar: "M", createdAt: "2026-06-05", lastLogin: "2026-07-29 12:10" },
  { id: "C007", name: "Arjun Nair", email: "arjun@example.com", phone: "+91 32109 87654", status: "Inactive", avatar: "A", createdAt: "2026-06-18", lastLogin: "2026-07-25 14:05" },
  { id: "C008", name: "Kavitha Menon", email: "kavitha@example.com", phone: "+91 21098 76543", status: "Active", avatar: "K", createdAt: "2026-07-01", lastLogin: "2026-07-27 10:30" },
];

// Normalized Mock Wishlists
export const MOCK_WISHLISTS = [
  { customerId: "C001", productId: "classic-mattress", addedAt: "2026-07-20" },
  { customerId: "C001", productId: "luxe-hybrid", addedAt: "2026-07-25" },
  { customerId: "C002", productId: "luxe-hybrid", addedAt: "2026-07-28" },
  { customerId: "C003", productId: "luxury-pillow", addedAt: "2026-07-15" },
  { customerId: "C004", productId: "oak-bedframe", addedAt: "2026-06-10" },
  { customerId: "C004", productId: "organic-protector", addedAt: "2026-06-12" },
  { customerId: "C005", productId: "ergo-air", addedAt: "2026-07-01" },
  { customerId: "C006", productId: "ortho-support", addedAt: "2026-05-30" },
  { customerId: "C006", productId: "luxury-pillow", addedAt: "2026-06-02" },
  { customerId: "C008", productId: "luxury-pillow", addedAt: "2026-07-10" },
];

// Normalized Mock Customer Carts
// Each cart item references customerId, productId, and variant (size + firmness)
// Price stored is the discounted price as seen by the customer in the storefront
// stockStatus: "In Stock" | "Low Stock" | "Out of Stock"
export const MOCK_CARTS = [
  // Rahul Sharma (C001) — 2 items in cart
  {
    cartItemId: "classic-mattress-Firm-King",
    customerId: "C001",
    productId: "classic-mattress",
    variantSize: "King",
    variantFirmness: "Firm",
    variantSKU: "MEL-KING-FIRM",
    quantity: 2,
    actualPrice: 1099,
    discountPercent: 10,
    addedAt: "2026-08-09",
    stockStatus: "In Stock",
  },
  {
    cartItemId: "luxe-hybrid-Medium-Queen",
    customerId: "C001",
    productId: "luxe-hybrid",
    variantSize: "Queen",
    variantFirmness: "Medium",
    variantSKU: "MEL-QUEEN-MEDIUM",
    quantity: 1,
    actualPrice: 1199,
    discountPercent: 10,
    addedAt: "2026-08-10",
    stockStatus: "Low Stock",
  },

  // Priya Patel (C002) — 1 item in cart
  {
    cartItemId: "luxury-pillow-Soft-Standard",
    customerId: "C002",
    productId: "luxury-pillow",
    variantSize: "Standard",
    variantFirmness: "Soft",
    variantSKU: "MEL-STD-SOFT",
    quantity: 2,
    actualPrice: 89,
    discountPercent: 10,
    addedAt: "2026-08-08",
    stockStatus: "Low Stock",
  },

  // Ankit Gupta (C003) — 1 item in cart (out of stock variant)
  {
    cartItemId: "luxury-pillow-Medium-King",
    customerId: "C003",
    productId: "luxury-pillow",
    variantSize: "King",
    variantFirmness: "Medium",
    variantSKU: "MEL-KING-MEDIUM",
    quantity: 1,
    actualPrice: 109,
    discountPercent: 10,
    addedAt: "2026-08-07",
    stockStatus: "Out of Stock",
  },

  // Sneha Reddy (C004) — 2 items in cart
  {
    cartItemId: "organic-protector-Standard-Queen",
    customerId: "C004",
    productId: "organic-protector",
    variantSize: "Queen",
    variantFirmness: "Standard",
    variantSKU: "MEL-QUEEN-STD",
    quantity: 1,
    actualPrice: 79,
    discountPercent: 10,
    addedAt: "2026-08-06",
    stockStatus: "In Stock",
  },
  {
    cartItemId: "oak-bedframe-Standard-Queen",
    customerId: "C004",
    productId: "oak-bedframe",
    variantSize: "Queen",
    variantFirmness: "Standard",
    variantSKU: "MEL-QUEEN-STD",
    quantity: 1,
    actualPrice: 799,
    discountPercent: 10,
    addedAt: "2026-08-06",
    stockStatus: "In Stock",
  },

  // Kavitha Menon (C008) — 1 item in cart
  {
    cartItemId: "classic-mattress-Medium-Queen",
    customerId: "C008",
    productId: "classic-mattress",
    variantSize: "Queen",
    variantFirmness: "Medium",
    variantSKU: "MEL-QUEEN-MEDIUM",
    quantity: 1,
    actualPrice: 899,
    discountPercent: 10,
    addedAt: "2026-08-10",
    stockStatus: "In Stock",
  },
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
