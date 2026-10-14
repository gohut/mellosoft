import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeCustomerId, matchCustomer } from "../src/utils/customerHelpers.js";
import { checkoutOrderSchema, addressSchema } from "../src/lib/validators.js";

describe("Customer Isolation & Identification Tests", () => {
  it("should normalize sequential customer IDs correctly without false positive collisions", () => {
    assert.strictEqual(normalizeCustomerId("C1"), "CUS-0001");
    assert.strictEqual(normalizeCustomerId("C2"), "CUS-0002");
    assert.strictEqual(normalizeCustomerId("CUS-0005"), "CUS-0005");
    assert.strictEqual(normalizeCustomerId("10"), "CUS-0010");
  });

  it("should not corrupt or collide alphanumeric CUIDs or UUIDs starting with c", () => {
    const cuid1 = "clx123abc456def";
    const cuid2 = "clx234abc456def";
    const cuidStartingWithCDigit = "c12a89df0012";

    assert.strictEqual(normalizeCustomerId(cuid1), cuid1);
    assert.strictEqual(normalizeCustomerId(cuid2), cuid2);
    // Even if it starts with c followed by digits and letters, it should not be parsed as CUS-0012
    assert.strictEqual(normalizeCustomerId(cuidStartingWithCDigit), cuidStartingWithCDigit);
  });

  it("should return empty string for null, undefined, or empty customer IDs instead of defaulting to CUS-0001", () => {
    assert.strictEqual(normalizeCustomerId(null), "");
    assert.strictEqual(normalizeCustomerId(undefined), "");
    assert.strictEqual(normalizeCustomerId(""), "");
    assert.notStrictEqual(normalizeCustomerId(""), "CUS-0001");
  });

  it("should strictly prevent two different customers from matching each other", () => {
    const customerA = { id: "cust-uuid-001", customerId: "CUS-0001", email: "alice@example.com" };
    const customerB = { id: "cust-uuid-002", customerId: "CUS-0002", email: "bob@example.com" };

    const orderA = { id: "ord-1", customerId: "cust-uuid-001", email: "alice@example.com" };
    const orderB = { id: "ord-2", customerId: "cust-uuid-002", email: "bob@example.com" };

    assert.strictEqual(matchCustomer(orderA, customerA), true);
    assert.strictEqual(matchCustomer(orderB, customerB), true);
    assert.strictEqual(matchCustomer(orderA, customerB), false);
    assert.strictEqual(matchCustomer(orderB, customerA), false);
  });

  it("should accept checkout payload with deliveryAddress and pincode, normalizing them", () => {
    const legacyPayload = {
      items: [
        {
          id: "foamcloud",
          name: "FoamCloud Mattress",
          price: 24999,
          size: "Queen",
          firmness: "Medium",
          qty: 1
        }
      ],
      deliveryAddress: {
        fullName: "Vikram Malhotra",
        phone: "9876543210",
        addressLine1: "Flat 402, Green Heights",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      },
      paymentMethod: "COD"
    };

    const parsed = checkoutOrderSchema.safeParse(legacyPayload);
    assert.strictEqual(parsed.success, true);
    assert.ok(parsed.data.shippingAddress);
    assert.strictEqual(parsed.data.shippingAddress.postalCode, "400001");
    assert.strictEqual(parsed.data.items[0].productId, "foamcloud");
    assert.strictEqual(parsed.data.items[0].quantity, 1);
  });

  it("should accept address with either postalCode or pincode in addressSchema", () => {
    const addrWithPincode = {
      fullName: "Anita Roy",
      phone: "9123456789",
      addressLine1: "12 Lake Road",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029"
    };

    const parsed = addressSchema.safeParse(addrWithPincode);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.data.postalCode, "700029");
  });
});
