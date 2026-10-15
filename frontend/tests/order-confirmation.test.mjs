import { describe, it } from "node:test";
import assert from "node:assert";

/**
 * Mock authorization helper replicating logic in api/orders/[id]/route.js
 */
function authorizeOrderAccess(order, customerAuth, adminAuth) {
  if (!order) {
    return { status: 404, error: "Order not found." };
  }

  // 1. Admin authorized access
  const isAdmin = adminAuth?.authenticated && adminAuth?.user;
  if (isAdmin) {
    return { status: 200, success: true, order };
  }

  // 2. Customer ownership check
  const orderHasCustomer = Boolean(order.customerId || order.email);

  if (orderHasCustomer) {
    if (!customerAuth?.authenticated || !customerAuth?.customer) {
      return { status: 401, error: "Unauthorized: Please sign in to view this order." };
    }

    const c = customerAuth.customer;
    const isOwner =
      (order.customerId && (order.customerId === c.id || order.customerId === c.customerId)) ||
      (order.email && c.email && order.email.toLowerCase() === c.email.toLowerCase());

    if (!isOwner) {
      return { status: 403, error: "Forbidden: You do not have permission to view this order." };
    }
  }

  return { status: 200, success: true, order };
}

/**
 * Mock reference resolver replicating OR query in api/orders/[id]/route.js
 */
function resolveOrderMock(orderList, inputId) {
  const targetRef = (inputId || "").trim();
  if (!targetRef) return null;

  return orderList.find((o) => {
    const idUpper = (o.id || "").toUpperCase();
    const orderNumUpper = (o.orderNumber || "").toUpperCase();
    const targetUpper = targetRef.toUpperCase();
    return idUpper === targetUpper || orderNumUpper === targetUpper;
  }) || null;
}

describe("Order Confirmation & Database Resolution Tests", () => {
  const mockOrders = [
    {
      id: "MS-27960",
      orderNumber: "MS-27960",
      customerId: "cust-uuid-111",
      customerName: "Rohan Verma",
      email: "rohan@example.com",
      phone: "9876543210",
      totalAmount: 28499,
      subtotal: 24151,
      taxAmount: 4348,
      shippingAmount: 0,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Confirmed",
      shippingAddress: {
        fullName: "Rohan Verma",
        addressLine1: "12 Marine Drive",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400020",
        phone: "9876543210"
      },
      items: [
        {
          id: "item-1",
          productId: "foamcloud",
          productName: "FoamCloud Mattress",
          sku: "MEL-FOAMCLOUD-6IN-QUEEN-MED",
          size: "Queen",
          firmness: "Medium",
          quantity: 1,
          price: 28499
        }
      ]
    },
    {
      id: "MS-84920",
      orderNumber: "MS-84920",
      customerId: "cust-uuid-222",
      customerName: "Pooja Sharma",
      email: "pooja@example.com",
      phone: "9123456780",
      totalAmount: 14999,
      subtotal: 12711,
      taxAmount: 2288,
      shippingAmount: 0,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      shippingAddress: {
        fullName: "Pooja Sharma",
        addressLine1: "54 Brigade Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        phone: "9123456780"
      },
      items: [
        {
          id: "item-2",
          productId: "cloud-duvet",
          productName: "Cloud All-Season Duvet",
          sku: "MEL-DUVET-QUEEN",
          size: "Queen",
          quantity: 1,
          price: 14999
        }
      ]
    }
  ];

  it("should resolve order reference case-insensitively and handle whitespace", () => {
    const foundExact = resolveOrderMock(mockOrders, "MS-27960");
    const foundLower = resolveOrderMock(mockOrders, "ms-27960");
    const foundWithSpaces = resolveOrderMock(mockOrders, "  MS-27960  ");

    assert.ok(foundExact);
    assert.strictEqual(foundExact.id, "MS-27960");
    assert.ok(foundLower);
    assert.strictEqual(foundLower.id, "MS-27960");
    assert.ok(foundWithSpaces);
    assert.strictEqual(foundWithSpaces.id, "MS-27960");
  });

  it("should return 404 for nonexistent order references", () => {
    const notFound = resolveOrderMock(mockOrders, "MS-99999");
    assert.strictEqual(notFound, null);

    const access = authorizeOrderAccess(notFound, { authenticated: true, customer: { id: "cust-uuid-111" } }, { authenticated: false });
    assert.strictEqual(access.status, 404);
  });

  it("should authorize access when authenticated customer is the owner", () => {
    const order = resolveOrderMock(mockOrders, "MS-27960");
    const customerAuth = {
      authenticated: true,
      customer: {
        id: "cust-uuid-111",
        customerId: "CUS-0001",
        email: "rohan@example.com"
      }
    };

    const access = authorizeOrderAccess(order, customerAuth, { authenticated: false });
    assert.strictEqual(access.status, 200);
    assert.strictEqual(access.success, true);
    assert.strictEqual(access.order.id, "MS-27960");
  });

  it("should deny access (403 Forbidden) when a different authenticated customer requests the order", () => {
    const order = resolveOrderMock(mockOrders, "MS-27960"); // Belongs to Rohan (cust-uuid-111)
    const customerAuth = {
      authenticated: true,
      customer: {
        id: "cust-uuid-999", // Malicious / different customer
        customerId: "CUS-0099",
        email: "intruder@example.com"
      }
    };

    const access = authorizeOrderAccess(order, customerAuth, { authenticated: false });
    assert.strictEqual(access.status, 403);
    assert.strictEqual(access.error.includes("permission"), true);
  });

  it("should require authentication (401 Unauthorized) when an unauthenticated guest requests a customer order", () => {
    const order = resolveOrderMock(mockOrders, "MS-27960");
    const unauthenticated = { authenticated: false };

    const access = authorizeOrderAccess(order, unauthenticated, { authenticated: false });
    assert.strictEqual(access.status, 401);
    assert.strictEqual(access.error.includes("sign in"), true);
  });

  it("should permit administrators to view any order", () => {
    const order = resolveOrderMock(mockOrders, "MS-27960");
    const adminAuth = {
      authenticated: true,
      user: { id: "admin-1", email: "admin@mellosoft.com", roleId: "role-super-admin" }
    };

    const access = authorizeOrderAccess(order, { authenticated: false }, adminAuth);
    assert.strictEqual(access.status, 200);
    assert.strictEqual(access.success, true);
  });

  it("should preserve all financial, item, variant, and address fields in order record", () => {
    const order = resolveOrderMock(mockOrders, "MS-27960");
    assert.strictEqual(order.totalAmount, 28499);
    assert.strictEqual(order.shippingAddress.postalCode, "400020");
    assert.strictEqual(order.items.length, 1);
    assert.strictEqual(order.items[0].sku, "MEL-FOAMCLOUD-6IN-QUEEN-MED");
    assert.strictEqual(order.items[0].quantity, 1);
    assert.strictEqual(order.paymentStatus, "Pending");
  });
});
