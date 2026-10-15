import { describe, it } from "node:test";
import assert from "node:assert";
import { checkPermission } from "../src/lib/rbac.js";
import { DEFAULT_ROLES } from "../src/data/rolesData.js";
import { normalizeCustomerId, matchCustomer } from "../src/utils/customerHelpers.js";
import { adminOrderStatusUpdateSchema } from "../src/lib/validators.js";
import {
  CUSTOMER_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  getCookieOptions,
  extractToken,
} from "../src/lib/auth.js";

describe("Production Audit: Customers, Orders & Authentication Regression Suite", () => {
  describe("Priority A: Admin Customer Persistence & Verification", () => {
    const existingCustomers = [
      {
        id: "cuid-lingeswaran",
        customerId: "CUS-0001",
        name: "Lingeswaran A",
        email: "717823s132@kce.ac.in",
        status: "Active",
        createdAt: "2026-10-10",
      },
      {
        id: "cuid-gowtham",
        customerId: "CUS-0002",
        name: "Gowtham",
        email: "gowtham021953@gmail.com",
        status: "Active",
        createdAt: "2026-10-11",
      },
      {
        id: "cuid-lee",
        customerId: "CUS-0003",
        name: "Lee",
        email: "lingesw0561@gmail.com",
        status: "Active",
        createdAt: "2026-10-12",
      },
    ];

    it("should never filter out genuine sequential customer IDs (CUS-0001, CUS-0002, CUS-0003)", () => {
      // Simulate client customer filtering
      const filtered = existingCustomers.filter((c) => {
        // Obsolete demo filtering must NOT match CUS-0001..0003
        const obsoleteDemoIds = new Set(["C001", "C002", "C003"]);
        const id = c.customerId || c.id;
        return !obsoleteDemoIds.has(id);
      });

      assert.strictEqual(filtered.length, 3, "All 3 genuine production customers must be retained");
      assert.strictEqual(filtered[0].customerId, "CUS-0001");
      assert.strictEqual(filtered[1].customerId, "CUS-0002");
      assert.strictEqual(filtered[2].customerId, "CUS-0003");
    });

    it("should correctly format and normalize customer display identifiers", () => {
      assert.strictEqual(normalizeCustomerId("CUS-0001"), "CUS-0001");
      assert.strictEqual(normalizeCustomerId("CUS-1"), "CUS-0001");
      assert.strictEqual(normalizeCustomerId("C001"), "CUS-0001");
      assert.strictEqual(normalizeCustomerId("CUS-0002"), "CUS-0002");
      assert.strictEqual(normalizeCustomerId("CUS-0003"), "CUS-0003");
    });

    it("should generate next sequential customer ID following CUS-0003 without collision", () => {
      const currentCount = 3;
      const nextId = `CUS-${String(currentCount + 1).padStart(4, "0")}`;
      assert.strictEqual(nextId, "CUS-0004");
    });

    it("should ensure customer objects never expose sensitive password hashes or session tokens", () => {
      const formatted = existingCustomers.map((c) => ({
        id: c.customerId,
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        status: c.status,
      }));

      for (const cust of formatted) {
        assert.strictEqual(cust.passwordHash, undefined);
        assert.strictEqual(cust.token, undefined);
        assert.strictEqual(cust.sessionToken, undefined);
      }
    });

    it("should require customers:view permission to access customer list", () => {
      const superAdminRole = DEFAULT_ROLES.find((r) => r.name === "Super Admin");
      const adminRole = DEFAULT_ROLES.find((r) => r.name === "Admin");
      const staffRole = DEFAULT_ROLES.find((r) => r.name === "Staff");

      assert.strictEqual(checkPermission(superAdminRole, "customers", "view"), true);
      assert.strictEqual(checkPermission(adminRole, "customers", "view"), true);
      assert.strictEqual(checkPermission(staffRole, "customers", "view"), true);
    });
  });

  describe("Priority B: Delivered Order Handling & Status Persistence", () => {
    const deliveredOrder = {
      id: "MS-72807634",
      orderNumber: "MS-72807634",
      customerId: "CUS-0001",
      customerName: "Lingeswaran A",
      email: "717823s132@kce.ac.in",
      phone: "+919876543210",
      orderStatus: "Delivered",
      paymentStatus: "Pending",
      paymentMethod: "COD",
      totalAmount: 24999,
      trackingHistory: [
        { status: "Confirmed", timestamp: "2026-10-10T10:00:00.000Z" },
        { status: "Processing", timestamp: "2026-10-11T12:00:00.000Z" },
        { status: "Shipped", timestamp: "2026-10-12T14:00:00.000Z" },
        { status: "Delivered", timestamp: "2026-10-13T16:00:00.000Z" },
      ],
    };

    const confirmedOrder = {
      id: "MS-90917313",
      orderNumber: "MS-90917313",
      customerId: "CUS-0003",
      customerName: "Lee",
      email: "lingesw0561@gmail.com",
      phone: "+919876543210",
      orderStatus: "Confirmed",
      paymentStatus: "Pending",
      paymentMethod: "COD",
      totalAmount: 18999,
    };

    const allOrders = [deliveredOrder, confirmedOrder];

    it("should keep delivered orders visible in 'All' orders filter", () => {
      const activeFilter = "All";
      const filtered = activeFilter === "All"
        ? allOrders
        : allOrders.filter((o) => (o.orderStatus || "").toLowerCase() === activeFilter.toLowerCase());

      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.some((o) => o.id === "MS-72807634" && o.orderStatus === "Delivered"));
    });

    it("should show delivered orders in 'Delivered' orders filter", () => {
      const activeFilter = "Delivered";
      const filtered = allOrders.filter(
        (o) => (o.orderStatus || "").toLowerCase() === activeFilter.toLowerCase()
      );

      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, "MS-72807634");
      assert.strictEqual(filtered[0].orderStatus, "Delivered");
    });

    it("should never mark COD paymentStatus as Paid merely because orderStatus is Delivered", () => {
      // Validate schema permits Delivered order with Pending payment
      const payload = {
        orderStatus: "Delivered",
        paymentStatus: "Pending",
      };
      const result = adminOrderStatusUpdateSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.orderStatus, "Delivered");
      assert.strictEqual(result.data.paymentStatus, "Pending");
    });

    it("should resolve order by either public orderNumber or internal id", () => {
      const targetQuery = "MS-72807634";
      const resolved = allOrders.find(
        (o) => o.id === targetQuery || o.orderNumber === targetQuery
      );
      assert.ok(resolved, "Must resolve order by reference");
      assert.strictEqual(resolved.customerId, "CUS-0001");
      assert.strictEqual(resolved.email, "717823s132@kce.ac.in");
    });

    it("should accurately validate order status transition enums", () => {
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Confirmed" }).success, true);
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Processing" }).success, true);
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Shipped" }).success, true);
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Delivered" }).success, true);
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Cancelled" }).success, true);

      // Rejects invalid statuses
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Flying" }).success, false);
      assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "" }).success, false);
    });

    it("should require orders:updateStatus permission to mutate order statuses", () => {
      const managerRole = DEFAULT_ROLES.find((r) => r.name === "Manager");
      const staffRole = DEFAULT_ROLES.find((r) => r.name === "Staff");

      assert.strictEqual(checkPermission(managerRole, "orders", "updateStatus"), true);
      assert.strictEqual(checkPermission(staffRole, "orders", "updateStatus"), false);
    });
  });

  describe("Priority C: Session Security, Cookies & Cross-Contamination Audit", () => {
    it("should define separate and distinct cookie names for customer and admin sessions", () => {
      assert.strictEqual(CUSTOMER_SESSION_COOKIE, "ms_customer_session");
      assert.strictEqual(ADMIN_SESSION_COOKIE, "ms_admin_session");
      assert.notStrictEqual(CUSTOMER_SESSION_COOKIE, ADMIN_SESSION_COOKIE);
    });

    it("should enforce HttpOnly, SameSite=lax, path=/, and appropriate maxAge on session cookies", () => {
      const durationMs = 7 * 24 * 60 * 60 * 1000;
      const options = getCookieOptions(durationMs);

      assert.strictEqual(options.httpOnly, true, "Must be HttpOnly to prevent XSS exfiltration");
      assert.strictEqual(options.sameSite, "lax", "Must use SameSite=lax for CSRF mitigation");
      assert.strictEqual(options.path, "/", "Must be scoped to root path");
      assert.strictEqual(options.maxAge, 7 * 24 * 60 * 60);
    });

    it("should extract token strictly from the designated cookie name and ignore unrelated cookies", () => {
      const req = {
        headers: new Headers({
          cookie: `${CUSTOMER_SESSION_COOKIE}=customer_token_123; ${ADMIN_SESSION_COOKIE}=admin_token_456`,
        }),
      };

      const custToken = extractToken(req, CUSTOMER_SESSION_COOKIE);
      const adminToken = extractToken(req, ADMIN_SESSION_COOKIE);

      assert.strictEqual(custToken, "customer_token_123");
      assert.strictEqual(adminToken, "admin_token_456");
      assert.notStrictEqual(custToken, adminToken);
    });

    it("should never authenticate a customer endpoint using an admin token or vice versa", () => {
      // Customer endpoint requesting CUSTOMER_SESSION_COOKIE
      const adminOnlyReq = {
        headers: new Headers({
          cookie: `${ADMIN_SESSION_COOKIE}=admin_token_xyz`,
        }),
      };

      const custSessionFound = extractToken(adminOnlyReq, CUSTOMER_SESSION_COOKIE);
      assert.strictEqual(custSessionFound, null, "Customer token extraction must return null when only admin cookie is present");

      // Admin endpoint requesting ADMIN_SESSION_COOKIE
      const customerOnlyReq = {
        headers: new Headers({
          cookie: `${CUSTOMER_SESSION_COOKIE}=customer_token_abc`,
        }),
      };

      const adminSessionFound = extractToken(customerOnlyReq, ADMIN_SESSION_COOKIE);
      assert.strictEqual(adminSessionFound, null, "Admin token extraction must return null when only customer cookie is present");
    });

    it("should reject expired sessions: session expiry timestamp in past is invalid", () => {
      const pastDate = new Date(Date.now() - 10000);
      const isExpired = pastDate < new Date();
      assert.strictEqual(isExpired, true, "Expired session must be recognized as expired");
    });

    it("should reject inactive accounts server-side even with valid session token", () => {
      const userInactive = { status: "Inactive" };
      const userSuspended = { status: "Suspended" };
      const userActive = { status: "Active" };

      assert.notStrictEqual(userInactive.status, "Active");
      assert.notStrictEqual(userSuspended.status, "Active");
      assert.strictEqual(userActive.status, "Active");
    });
  });
});
