import { describe, it } from "node:test";
import assert from "node:assert";
import { checkPermission } from "../src/lib/rbac.js";
import { DEFAULT_ROLES } from "../src/data/rolesData.js";
import { checkoutOrderSchema, addressSchema, adminUserUpdateSchema } from "../src/lib/validators.js";
import { calculateAuthoritativeTotals } from "../src/lib/pricing.js";
import { normalizeCustomerId, matchCustomer } from "../src/utils/customerHelpers.js";

describe("Phase J — Independent Full-Stack Regression Pass", () => {
  describe("1. Identity, Session Isolation & RBAC Protection", () => {
    it("should strictly differentiate Super Admin, Admin, Manager, and Staff roles", () => {
      const superAdminRole = DEFAULT_ROLES.find((r) => r.name === "Super Admin");
      const adminRole = DEFAULT_ROLES.find((r) => r.name === "Admin");
      const managerRole = DEFAULT_ROLES.find((r) => r.name === "Manager");
      const staffRole = DEFAULT_ROLES.find((r) => r.name === "Staff");

      assert.ok(superAdminRole, "Super Admin role must exist");
      assert.ok(adminRole, "Admin role must exist");
      assert.ok(managerRole, "Manager role must exist");
      assert.ok(staffRole, "Staff role must exist");

      // Super Admin has unrestricted access
      assert.strictEqual(checkPermission(superAdminRole, "users", "create"), true);
      assert.strictEqual(checkPermission(superAdminRole, "roles", "delete"), true);
      assert.strictEqual(checkPermission(superAdminRole, "settings", "edit"), true);

      // Manager can view orders and update status, but CANNOT manage users or roles
      assert.strictEqual(checkPermission(managerRole, "orders", "view"), true);
      assert.strictEqual(checkPermission(managerRole, "orders", "updateStatus"), true);
      assert.strictEqual(checkPermission(managerRole, "users", "view"), false);
      assert.strictEqual(checkPermission(managerRole, "users", "create"), false);
      assert.strictEqual(checkPermission(managerRole, "roles", "edit"), false);

      // Staff has read-only access to orders, products, customers
      assert.strictEqual(checkPermission(staffRole, "orders", "view"), true);
      assert.strictEqual(checkPermission(staffRole, "products", "view"), true);
      assert.strictEqual(checkPermission(staffRole, "customers", "view"), true);
      assert.strictEqual(checkPermission(staffRole, "orders", "updateStatus"), false);
      assert.strictEqual(checkPermission(staffRole, "products", "create"), false);
      assert.strictEqual(checkPermission(staffRole, "products", "delete"), false);
    });

    it("should prevent privilege escalation: non-super admin cannot grant super admin privileges", () => {
      const adminRole = DEFAULT_ROLES.find((r) => r.name === "Admin");
      assert.strictEqual(checkPermission(adminRole, "roles", "create"), false);
      assert.strictEqual(checkPermission(adminRole, "roles", "delete"), false);
    });
  });

  describe("2. Customer Isolation & Data Segregation", () => {
    it("should never allow Customer A's session/ID to match or access Customer B's records", () => {
      const customerA = { id: "cuid-customer-001", customerId: "CUS-0001", email: "customerA@example.com" };
      const customerB = { id: "cuid-customer-002", customerId: "CUS-0002", email: "customerB@example.com" };

      const orderForA = {
        id: "MS-1001",
        customerId: "cuid-customer-001",
        email: "customerA@example.com",
      };

      const orderForB = {
        id: "MS-1002",
        customerId: "cuid-customer-002",
        email: "customerB@example.com",
      };

      assert.strictEqual(matchCustomer(orderForA, customerA), true);
      assert.strictEqual(matchCustomer(orderForB, customerB), true);

      // Cross-customer access checks
      assert.strictEqual(matchCustomer(orderForA, customerB), false);
      assert.strictEqual(matchCustomer(orderForB, customerA), false);
    });

    it("should preserve distinct CUIDs that start with letter 'c' followed by digits", () => {
      const c1 = "c1001xyz";
      const c2 = "c1002abc";
      assert.notStrictEqual(normalizeCustomerId(c1), normalizeCustomerId(c2));
      assert.strictEqual(normalizeCustomerId(c1), c1);
      assert.strictEqual(normalizeCustomerId(c2), c2);
    });
  });

  describe("3. Commerce & Checkout Verification", () => {
    it("should accurately calculate totals in Rupee integers without / 100 division errors", () => {
      const items = [
        {
          productId: "foamcloud",
          price: 24999, // ₹24,999 in Rupees
          actualPrice: 34999,
          quantity: 2,
        },
        {
          productId: "memorycloud",
          price: 18999, // ₹18,999 in Rupees
          actualPrice: 26999,
          quantity: 1,
        },
      ];

      const totals = calculateAuthoritativeTotals(items, { gstRate: 18, freeDeliveryThreshold: 50000 });

      // Subtotal should be (24999 * 2) + 18999 = 49998 + 18999 = 68997
      assert.strictEqual(totals.subtotal, 68997);
      // Because 68997 > 50000 threshold, shipping is 0
      assert.strictEqual(totals.shipping, 0);
      assert.ok(totals.finalTotal > 68997, "Final total includes GST");
    });

    it("should validate and normalize checkout with either shippingAddress or deliveryAddress", () => {
      const payloadDelivery = {
        items: [{ id: "foamcloud", qty: 1 }],
        deliveryAddress: {
          fullName: "Anand Kumar",
          phone: "9876543210",
          addressLine1: "123 Tech Park",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500081",
        },
        paymentMethod: "COD",
      };

      const parsedDelivery = checkoutOrderSchema.safeParse(payloadDelivery);
      assert.strictEqual(parsedDelivery.success, true);
      assert.ok(parsedDelivery.data.shippingAddress);
      assert.strictEqual(parsedDelivery.data.shippingAddress.postalCode, "500081");
      assert.strictEqual(parsedDelivery.data.items[0].productId, "foamcloud");
      assert.strictEqual(parsedDelivery.data.items[0].quantity, 1);

      const payloadShipping = {
        items: [{ productId: "orthocare", quantity: 2 }],
        shippingAddress: {
          fullName: "Sunita Sen",
          phone: "9812345678",
          addressLine1: "45 Salt Lake",
          city: "Kolkata",
          state: "West Bengal",
          postalCode: "700091",
        },
        paymentMethod: "UPI",
      };

      const parsedShipping = checkoutOrderSchema.safeParse(payloadShipping);
      assert.strictEqual(parsedShipping.success, true);
      assert.strictEqual(parsedShipping.data.shippingAddress.postalCode, "700091");
      assert.strictEqual(parsedShipping.data.items[0].productId, "orthocare");
      assert.strictEqual(parsedShipping.data.items[0].quantity, 2);
    });

    it("should reject checkout payloads with invalid PIN codes or non-positive quantities", () => {
      const badPinPayload = {
        items: [{ productId: "foamcloud", quantity: 1 }],
        shippingAddress: {
          fullName: "Invalid User",
          phone: "9876543210",
          addressLine1: "Bad Address",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "123", // Invalid PIN (not 6 digits)
        },
        paymentMethod: "COD",
      };

      assert.strictEqual(checkoutOrderSchema.safeParse(badPinPayload).success, false);

      const zeroQtyPayload = {
        items: [{ productId: "foamcloud", quantity: 0 }],
        shippingAddress: {
          fullName: "User",
          phone: "9876543210",
          addressLine1: "Road",
          city: "Pune",
          state: "Maharashtra",
          postalCode: "411001",
        },
        paymentMethod: "COD",
      };

      assert.strictEqual(checkoutOrderSchema.safeParse(zeroQtyPayload).success, false);
    });
  });

  describe("4. Administrative Protection & Account Constraints", () => {
    it("should validate admin user updates with partial schemas safely", () => {
      const validUpdate = {
        name: "Rahul Updated",
        status: "Active",
      };
      assert.strictEqual(adminUserUpdateSchema.safeParse(validUpdate).success, true);

      const invalidEmailUpdate = {
        email: "not-a-valid-email",
      };
      assert.strictEqual(adminUserUpdateSchema.safeParse(invalidEmailUpdate).success, false);
    });
  });
});
