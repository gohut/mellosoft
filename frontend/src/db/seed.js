import { getDb } from "./index";
import {
  roles,
  users,
  customers,
  categories,
  products,
  productVariants,
  orders,
  orderItems,
  carts,
  wishlists,
  reviews,
} from "./schema";
import { DEFAULT_ROLES } from "../data/rolesData";
import { DEFAULT_USERS } from "../data/usersData";
import {
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_CARTS,
  MOCK_WISHLISTS,
  MOCK_REVIEWS,
  MOCK_CATEGORIES,
} from "../admin/data/adminMockData";
import { MOCK_PRODUCTS } from "../data/products";
import { hashPassword } from "../utils/security";

export async function seedDatabase(env) {
  const db = getDb(env);
  if (!db) {
    console.warn("Skipping DB seed: Database instance unavailable.");
    return;
  }

  const now = new Date().toISOString();

  try {
    // 1. Seed Roles
    for (const r of DEFAULT_ROLES) {
      await db.insert(roles).values({
        id: r.id,
        name: r.name,
        description: r.description,
        color: r.color || "#1B1F8C",
        permissions: JSON.stringify(r.permissions || {}),
        isSystem: r.isSystemRole ? 1 : 0,
        createdAt: r.createdAt || now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 2. Seed Admin Users
    for (const u of DEFAULT_USERS) {
      await db.insert(users).values({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: u.passwordHash,
        phone: u.phone || "",
        roleId: u.roleId,
        status: u.status || "Active",
        createdAt: u.createdAt || now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 3. Seed Customers
    const defaultCustomerPassHash = hashPassword("Password123");
    for (const c of MOCK_CUSTOMERS) {
      await db.insert(customers).values({
        id: c.id,
        customerId: c.customerId || `CUS-${c.id}`,
        name: c.name,
        email: c.email.toLowerCase(),
        passwordHash: defaultCustomerPassHash,
        phone: c.phone || "",
        avatar: c.avatar || c.name.charAt(0).toUpperCase(),
        sleepPos: "Side",
        preferredTemp: "Cool",
        status: c.status || "Active",
        createdAt: c.createdAt || now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 4. Seed Categories
    for (const cat of MOCK_CATEGORIES) {
      await db.insert(categories).values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        image: cat.image || "",
        productCount: cat.productCount || 0,
        status: cat.active !== false ? "Active" : "Inactive",
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 5. Seed Products & Product Variants
    for (const p of MOCK_PRODUCTS) {
      await db.insert(products).values({
        id: p.id,
        productId: p.Product_Id || `PROD-${p.id}`,
        name: p.name,
        tagline: p.tagline || "",
        category: p.category,
        badge: p.badge || "",
        price: p.price,
        actualPrice: p.Actual_Price || p.price,
        discountPercent: p.discountPercent || 0,
        rating: p.rating || 5.0,
        reviewCount: p.reviewCount || 0,
        images: JSON.stringify(p.images || []),
        description: p.description || "",
        specs: p.specs || "",
        features: JSON.stringify(p.features || []),
        firmnessOptions: JSON.stringify(p.firmnessOptions || []),
        sizeOptions: JSON.stringify(p.sizeOptions || []),
        sizePrices: JSON.stringify(p.sizePrices || {}),
        firmnessPrices: JSON.stringify(p.firmnessPrices || {}),
        status: "Active",
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();

      // Seed Product Variants
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          const variantId = `${p.id}-${v.Firmness || 'Default'}-${v.Size || 'Default'}`;
          await db.insert(productVariants).values({
            id: variantId,
            variantId: v.Variant_Id || `VAR-${p.id}-${v.SKU}`,
            productId: p.id,
            size: v.Size || "Standard",
            firmness: v.Firmness || "Medium",
            sku: v.SKU || `SKU-${v.Variant_Id}`,
            actualPrice: v.Actual_Price || p.price,
            stock: v.Stock !== undefined ? v.Stock : 10,
            threshold: v.Threshold !== undefined ? v.Threshold : 2,
            status: v.Status || "Active",
            createdAt: now,
            updatedAt: now,
          }).onConflictDoNothing();
        }
      }
    }

    // 6. Seed Orders & Order Items
    for (const ord of MOCK_ORDERS) {
      const orderDbId = ord.id;
      await db.insert(orders).values({
        id: orderDbId,
        orderId: `ORD-${ord.id.replace("MS-", "")}`,
        customerId: ord.customerId,
        customerName: ord.customerName || "Customer",
        customerEmail: ord.customerEmail || "customer@example.com",
        customerPhone: ord.customerPhone || "",
        shippingAddress: JSON.stringify(ord.shippingAddress || { street: "123 Sleep St", city: "Bengaluru", pincode: "560001" }),
        subtotal: ord.totalAmount,
        deliveryFee: 0,
        taxAmount: 0,
        totalAmount: ord.totalAmount,
        paymentStatus: ord.paymentStatus || "Paid",
        paymentMethod: "Razorpay",
        orderStatus: ord.orderStatus || "Delivered",
        createdAt: ord.createdAt || now,
        updatedAt: now,
      }).onConflictDoNothing();

      if (Array.isArray(ord.items)) {
        for (let idx = 0; idx < ord.items.length; idx++) {
          const item = ord.items[idx];
          await db.insert(orderItems).values({
            id: `${orderDbId}-item-${idx}`,
            orderId: orderDbId,
            productId: item.productId,
            productName: item.productName || item.productId,
            variantId: `${item.productId}-${item.variantFirmness}-${item.variantSize}`,
            variantSize: item.variantSize || "Standard",
            variantFirmness: item.variantFirmness || "Medium",
            variantSKU: item.variantSKU || `SKU-${item.productId}`,
            unitPrice: item.price,
            quantity: item.quantity,
            itemTotal: item.price * item.quantity,
          }).onConflictDoNothing();
        }
      }
    }

    // 7. Seed Carts
    for (const c of MOCK_CARTS) {
      await db.insert(carts).values({
        id: c.cartItemId,
        customerId: c.customerId,
        productId: c.productId,
        variantId: `${c.productId}-${c.variantFirmness}-${c.variantSize}`,
        variantSize: c.variantSize,
        variantFirmness: c.variantFirmness,
        variantSKU: c.variantSKU,
        quantity: c.quantity,
        actualPrice: c.actualPrice,
        discountPercent: c.discountPercent || 10,
        addedAt: c.addedAt || now,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    // 8. Seed Wishlists
    for (const w of MOCK_WISHLISTS) {
      await db.insert(wishlists).values({
        id: `${w.customerId}-${w.productId}`,
        customerId: w.customerId,
        productId: w.productId,
        createdAt: w.addedAt || now,
      }).onConflictDoNothing();
    }

    // 9. Seed Reviews
    for (const rv of MOCK_REVIEWS) {
      await db.insert(reviews).values({
        id: rv.id,
        productId: rv.productId,
        customerId: rv.customerId,
        author: rv.author || rv.customerName || "Customer",
        rating: rv.rating,
        content: rv.review || rv.comment || "",
        date: rv.date || now,
        helpfulCount: 0,
        replyCount: rv.adminReply ? 1 : 0,
        status: rv.status || "Published",
        adminReply: rv.adminReply || null,
        createdAt: now,
      }).onConflictDoNothing();
    }

    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Database seed error:", err);
  }
}
