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
export const MOCK_ORDERS = [];

// Normalized Mock Customers
export const MOCK_CUSTOMERS = [];

// Normalized Mock Wishlists
export const MOCK_WISHLISTS = [];

// Normalized Mock Customer Carts
export const MOCK_CARTS = [];

// Mock reviews for moderation
export const MOCK_REVIEWS = [
  { id: "RV001", customer: "Helen M.", customerName: "Helen M.", productId: "classic-mattress", product: "Mellosoft Classic Mattress", productName: "Mellosoft Classic Mattress", rating: 5, review: "Excellent mattress! It conforms to the body and turns very sharply on the comfort. Best sleep I've had in years.", comment: "Excellent mattress! It conforms to the body and turns very sharply on the comfort. Best sleep I've had in years.", date: "2026-08-01", status: "Approved", showOnHome: true },
  { id: "RV002", customer: "Michael F.", customerName: "Michael F.", productId: "luxe-hybrid", product: "Mellosoft Luxe Hybrid", productName: "Mellosoft Luxe Hybrid", rating: 5, review: "This hybrid is outstanding. The pocket coils give it a nice bounce while the foam top cradles your body.", comment: "This hybrid is outstanding. The pocket coils give it a nice bounce while the foam top cradles your body.", date: "2026-07-31", status: "Approved", showOnHome: true },
  { id: "RV003", customer: "Diana C.", customerName: "Diana C.", productId: "latex-serene", product: "Mellosoft Latex Serene", productName: "Mellosoft Latex Serene", rating: 5, review: "I wanted a chemical-free mattress and this is perfect. It smells like sweet natural wool.", comment: "I wanted a chemical-free mattress and this is perfect. It smells like sweet natural wool.", date: "2026-07-30", status: "Pending", showOnHome: false },
  { id: "RV004", customer: "Gregory P.", customerName: "Gregory P.", productId: "ortho-support", product: "Mellosoft Ortho Support", productName: "Mellosoft Ortho Support", rating: 5, review: "Finally, a mattress that is actually firm. My chiropractor recommended it and it has drastically reduced my back aches.", comment: "Finally, a mattress that is actually firm. My chiropractor recommended it and it has drastically reduced my back aches.", date: "2026-07-29", status: "Approved", showOnHome: true },
  { id: "RV005", customer: "Laura W.", customerName: "Laura W.", productId: "ergo-air", product: "Mellosoft Ergo Air", productName: "Mellosoft Ergo Air", rating: 5, review: "This mattress is insanely comfortable. Like a soft hug but still supports you.", comment: "This mattress is insanely comfortable. Like a soft hug but still supports you.", date: "2026-07-28", status: "Pending", showOnHome: false },
  { id: "RV006", customer: "Tyler F.", customerName: "Tyler F.", productId: "organic-protector", product: "Organic Mattress Protector", productName: "Organic Mattress Protector", rating: 5, review: "Saved our new mattress from a coffee spill on day three. Totally waterproof. Lifesaver.", comment: "Saved our new mattress from a coffee spill on day three. Totally waterproof. Lifesaver.", date: "2026-07-27", status: "Approved", showOnHome: true },
  { id: "RV007", customer: "Anonymous", customerName: "Anonymous", productId: "classic-mattress", product: "Mellosoft Classic Mattress", productName: "Mellosoft Classic Mattress", rating: 1, review: "Very bad quality. Do not buy.", comment: "Very bad quality. Do not buy.", date: "2026-07-26", status: "Rejected", showOnHome: false },
];

// Mock coupons
export const MOCK_COUPONS = [
  { id: "CP001", code: "SUMMER30", discount: "30%", type: "percentage", usageCount: 145, usageLimit: 500, expiryDate: "2026-08-15", status: "Active" },
  { id: "CP002", code: "NEWUSER500", discount: "₹500", type: "fixed", usageCount: 89, usageLimit: 200, expiryDate: "2026-09-30", status: "Active" },
  { id: "CP003", code: "DIWALI25", discount: "25%", type: "percentage", usageCount: 320, usageLimit: 1000, expiryDate: "2026-11-01", status: "Active" },
  { id: "CP004", code: "FLAT1000", discount: "₹1,000", type: "fixed", usageCount: 50, usageLimit: 50, expiryDate: "2026-07-31", status: "Expired" },
  { id: "CP005", code: "FREESHIP", discount: "Free Shipping", type: "shipping", usageCount: 210, usageLimit: 0, expiryDate: "2026-12-31", status: "Active" },
];

// Mock categories (Hierarchical Structure)
export const MOCK_CATEGORIES = [
  {
    id: "CAT-MATTRESSES",
    name: "Mattresses",
    slug: "mattresses",
    parentId: null,
    isParent: true,
    type: "main",
    showInNavigation: true,
    active: true,
    order: 1,
    image: "/assets/categories/memory-foam.png",
    description: "Premium sleep mattresses handcrafted for deep rest",
    subcategories: [
      { id: "SUB-FOAM", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Foam Mattress", slug: "foam", aliases: ["foam", "foam-mattress", "foam mattress"], active: true, order: 1 },
      { id: "SUB-ORTHO", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Ortho Mattress", slug: "ortho", aliases: ["ortho", "ortho-mattress", "ortho mattress"], active: true, order: 2 },
      { id: "SUB-SPRING", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Spring Mattress", slug: "spring", aliases: ["spring", "spring-mattress", "spring mattress"], active: true, order: 3 },
      { id: "SUB-LATEX", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Latex Mattress", slug: "latex", aliases: ["latex", "latex-mattress", "latex mattress"], active: true, order: 4 },
      { id: "SUB-MEMORY-FOAM", parentId: "CAT-MATTRESSES", parentSlug: "mattresses", name: "Memory Foam Mattress", slug: "memory-foam", aliases: ["memory-foam", "memory-foam-mattress", "memory foam mattress"], active: true, order: 5 }
    ]
  },
  {
    id: "CAT-ACCESSORIES",
    name: "Accessories",
    slug: "accessories",
    parentId: null,
    isParent: true,
    type: "main",
    showInNavigation: true,
    active: true,
    order: 2,
    image: "/assets/categories/pillows.png",
    description: "Luxury pillows, protectors & sleep essentials",
    subcategories: [
      { id: "SUB-MEMORY-FOAM-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Memory Foam Pillow", slug: "memory-foam-pillow", aliases: ["memory-foam-pillow", "memory foam pillow", "pillows", "pillow"], active: true, order: 1 },
      { id: "SUB-LATEX-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Latex Pillow", slug: "latex-pillow", aliases: ["latex-pillow", "latex pillow"], active: true, order: 2 },
      { id: "SUB-FIBER-PILLOW", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Fiber Pillow", slug: "fiber-pillow", aliases: ["fiber-pillow", "fiber pillow"], active: true, order: 3 },
      { id: "SUB-MATTRESS-PROTECTOR", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Mattress Protector", slug: "mattress-protector", aliases: ["mattress-protector", "mattress protector", "protectors", "protector"], active: true, order: 4 },
      { id: "SUB-FITTED-BEDSPREAD", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Fitted Bedspread", slug: "fitted-bedspread", aliases: ["fitted-bedspread", "fitted bedspread"], active: true, order: 5 },
      { id: "SUB-BLANKET-DUVET", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Blanket / Duvet", slug: "blanket-duvet", aliases: ["blanket-duvet", "blanket / duvet"], active: true, order: 6 },
      { id: "SUB-TRAVEL-BED", parentId: "CAT-ACCESSORIES", parentSlug: "accessories", name: "Travel Bed", slug: "travel-bed", aliases: ["travel-bed", "travel bed"], active: true, order: 7 }
    ]
  },
  {
    id: "CAT-BED-FRAMES",
    name: "Bed Frames",
    slug: "bed-frames",
    parentId: null,
    isParent: true,
    type: "main",
    showInNavigation: true,
    active: true,
    order: 3,
    image: "/assets/categories/bed-frames.png",
    description: "Bed frames designed for stylish and supportive sleep spaces.",
    subcategories: [
      { id: "SUB-WOODEN-BED-FRAME", parentId: "CAT-BED-FRAMES", parentSlug: "bed-frames", name: "Wooden Bed Frame", slug: "wooden-bed-frame", aliases: ["wooden-bed-frame", "wooden bed frame", "haven-bed-frame", "luxe-timber-frame", "ortho-support-frame", "teak", "timber", "wooden"], active: true, order: 1 },
      { id: "SUB-PLATFORM-BED", parentId: "CAT-BED-FRAMES", parentSlug: "bed-frames", name: "Platform Bed", slug: "platform-bed", aliases: ["platform-bed", "platform bed", "craft-platform-bed", "minimal-platform-bed", "platform"], active: true, order: 2 }
    ]
  }
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
export const RECENT_ACTIVITY = [];

// Mock promotional banners & hero slides
export const MOCK_BANNERS = [
  // Hero Slides (type: "Offer")
  {
    id: "hero-001",
    productId: "classic-mattress",
    title: "Mellosoft Classic Mattress",
    type: "Offer",
    image: "/asset/img2.jpg",
    subtitle: "Enjoy 60% savings",
    description: "Handcrafted memory foam & hybrid mattresses at up to 60% off.",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    isActive: true,
    displayOrder: 1
  },
  {
    id: "hero-002",
    productId: "luxe-hybrid",
    title: "Mellosoft Luxe Hybrid",
    type: "Offer",
    image: "/asset/img1.jpg",
    subtitle: "Luxe Hybrid Comfort",
    description: "Pocket coil bounce meets pressure-relieving memory foam layer.",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    isActive: true,
    displayOrder: 2
  },
  {
    id: "hero-003",
    productId: "ortho-support",
    title: "Mellosoft Ortho Support",
    type: "Offer",
    image: "/asset/img2.jpg",
    subtitle: "Spinal Alignment Care",
    description: "Extra firm orthopedic support for healthy spinal posture.",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    isActive: true,
    displayOrder: 3
  },
  {
    id: "hero-004",
    productId: "ergo-air",
    title: "Mellosoft Ergo Air",
    type: "Offer",
    image: "/asset/img1.jpg",
    subtitle: "Breathable Airflow Tech",
    description: "Advanced cooling gel foam with ergonomic body contours.",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    isActive: true,
    displayOrder: 4
  },

  // 3 Homepage Promo Banners (type: "Promotion")
  {
    id: "promo-001",
    title: "Classic Comfort",
    type: "Promotion",
    image: "/asset/img2.jpg",
    subtitle: "Limited Mattress Event",
    description: "Handcrafted memory foam & hybrid mattresses at up to 60% off.",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    isActive: true,
    displayOrder: 1
  },
  {
    id: "promo-002",
    title: "Get 30% off essentials",
    type: "Promotion",
    image: "/asset/pillow.png",
    subtitle: "Pillows and protectors",
    description: "Luxury down pillows and organic bamboo protectors for ultimate sleep care.",
    ctaText: "Explore Now",
    ctaLink: "pillows",
    isActive: true,
    displayOrder: 2
  },
  {
    id: "promo-003",
    title: "Free assembly included",
    type: "Promotion",
    image: "/asset/bedframe.png",
    subtitle: "New bed frame collection",
    description: "Handcrafted platform frames made from solid sustainable oak.",
    ctaText: "Discover Frames",
    ctaLink: "bed frames",
    isActive: true,
    displayOrder: 3
  }
];

