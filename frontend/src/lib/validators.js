import { z } from "zod";

// Phone validation: Indian standard phone format (+91 or 10 digits starting with 6-9)
const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

// 1. Customer Authentication Schemas
export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  phone: z.string().trim().regex(phoneRegex, "Please provide a valid 10-digit Indian phone number").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password too long"),
});

export const customerLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// 2. Customer Address Schema
export const addressSchema = z.object({
  label: z.string().trim().default("Home"),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().regex(phoneRegex, "Valid 10-digit phone number is required"),
  addressLine1: z.string().trim().min(3, "Address line 1 is required"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  landmark: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Valid 6-digit PIN code is required"),
  country: z.string().trim().default("India"),
  isDefault: z.boolean().default(false),
});

// 3. Cart & Wishlist Schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  size: z.string().optional(),
  firmness: z.string().optional(),
  dimension: z.string().optional(),
  thickness: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(50),
});

export const toggleWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// 4. Checkout & Order Placement Schemas
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  productName: z.string().optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  size: z.string().optional(),
  firmness: z.string().optional(),
  dimension: z.string().optional(),
  thickness: z.string().optional(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Order must contain at least one item"),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["COD", "UPI", "RAZORPAY", "STRIPE"]),
  notes: z.string().max(500).optional(),
  couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});

// 5. Payment Schemas
export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["COD", "UPI", "RAZORPAY", "STRIPE"]),
  providerOrderId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  providerSignature: z.string().optional(),
  upiVpa: z.string().optional(),
});

// 6. Review Schemas
export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(5, "Review comment must be at least 5 characters").max(2000),
});

export const moderateReviewSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected"]),
  showOnHome: z.boolean().optional(),
});

// 7. Admin Schemas (RBAC, Products, Orders, Users, Settings)
export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  roleId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const adminRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional(),
  permissions: z.record(z.string(), z.array(z.string())),
});

export const adminOrderStatusUpdateSchema = z.object({
  orderStatus: z.enum(["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]).optional(),
  paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded"]).optional(),
});

export const adminProductCreateSchema = z.object({
  id: z.string().trim().min(2).max(100),
  productId: z.string().trim().min(2).max(50),
  name: z.string().trim().min(2).max(200),
  tagline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  specs: z.string().trim().optional(),
  categoryId: z.string().min(1),
  categorySlug: z.string().min(1),
  parentCategorySlug: z.string().optional(),
  badge: z.string().optional(),
  price: z.number().int().min(0),
  actualPrice: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(100).default(0),
  active: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  newArrivalOrder: z.number().int().default(999),
  isBestSeller: z.boolean().default(false),
  construction: z.string().optional(),
  thicknessOptions: z.array(z.string()).optional(),
  sizeOptions: z.array(z.string()).optional(),
  dimensions: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      sku: z.string().min(1),
      size: z.string().optional(),
      dimension: z.string().optional(),
      thickness: z.string().optional(),
      firmness: z.string().optional(),
      actualPrice: z.number().int().min(0),
      discountPercent: z.number().int().min(0).max(100).default(0),
      discountedPrice: z.number().int().min(0),
      stock: z.number().int().min(0).default(10),
      threshold: z.number().int().min(0).default(2),
      status: z.string().default("Active"),
    })
  ).optional(),
});
