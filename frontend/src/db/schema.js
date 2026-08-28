import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// 1. System Admin Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  roleId: text("role_id").notNull(),
  status: text("status").default("Active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 2. System RBAC Roles
export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  permissions: text("permissions").notNull(), // JSON string
  isSystem: integer("is_system").default(0).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 3. Storefront Customers
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  googleId: text("google_id"),
  avatar: text("avatar"),
  sleepPos: text("sleep_pos").default("Side"),
  preferredTemp: text("preferred_temp").default("Cool"),
  status: text("status").default("Active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 4. Products Catalog
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  category: text("category").notNull(),
  badge: text("badge"),
  price: real("price").notNull(),
  actualPrice: real("actual_price").notNull(),
  discountPercent: real("discount_percent").default(0),
  rating: real("rating").default(5.0),
  reviewCount: integer("review_count").default(0),
  images: text("images"), // JSON array string
  description: text("description"),
  specs: text("specs"),
  features: text("features"), // JSON array string
  firmnessOptions: text("firmness_options"), // JSON array string
  sizeOptions: text("size_options"), // JSON array string
  sizePrices: text("size_prices"), // JSON object string
  firmnessPrices: text("firmness_prices"), // JSON object string
  status: text("status").default("Active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 5. Product Variants
export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  variantId: text("variant_id").notNull(),
  productId: text("product_id").notNull(),
  size: text("size").notNull(),
  firmness: text("firmness").notNull(),
  sku: text("sku").notNull(),
  actualPrice: real("actual_price").notNull(),
  stock: integer("stock").default(10).notNull(),
  threshold: integer("threshold").default(2).notNull(),
  status: text("status").default("Active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 6. Categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  productCount: integer("product_count").default(0),
  status: text("status").default("Active").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 7. Orders
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"), // JSON object string
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  taxAmount: real("tax_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentStatus: text("payment_status").default("Pending").notNull(),
  paymentMethod: text("payment_method").default("Razorpay").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  orderStatus: text("order_status").default("Processing").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 8. Order Items
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  variantId: text("variant_id"),
  variantSize: text("variant_size"),
  variantFirmness: text("variant_firmness"),
  variantSKU: text("variant_sku"),
  unitPrice: real("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  itemTotal: real("item_total").notNull(),
});

// 9. Shopping Carts
export const carts = sqliteTable("carts", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  productId: text("product_id").notNull(),
  variantId: text("variant_id"),
  variantSize: text("variant_size").notNull(),
  variantFirmness: text("variant_firmness").notNull(),
  variantSKU: text("variant_sku"),
  quantity: integer("quantity").default(1).notNull(),
  actualPrice: real("actual_price").notNull(),
  discountPercent: real("discount_percent").default(0),
  addedAt: text("added_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 10. Wishlists
export const wishlists = sqliteTable("wishlists", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  productId: text("product_id").notNull(),
  createdAt: text("created_at").notNull(),
});

// 11. Customer Reviews
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  customerId: text("customer_id"),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  helpfulCount: integer("helpful_count").default(0),
  replyCount: integer("reply_count").default(0),
  status: text("status").default("Published").notNull(),
  adminReply: text("admin_reply"),
  createdAt: text("created_at").notNull(),
});

// 12. OTP Verification Tokens
export const otps = sqliteTable("otps", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  otpCode: text("otp_code").notNull(),
  purpose: text("purpose").notNull(), // "signup", "login", "password_reset"
  expiresAt: text("expires_at").notNull(),
  verified: integer("verified").default(0).notNull(),
  createdAt: text("created_at").notNull(),
});
