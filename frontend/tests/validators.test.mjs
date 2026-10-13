import { describe, it } from "node:test";
import assert from "node:assert";
import {
  customerRegisterSchema,
  customerLoginSchema,
  addressSchema,
  checkoutOrderSchema,
  adminOrderStatusUpdateSchema,
  createReviewSchema,
} from "../src/lib/validators.js";

describe("Input Validation & Zod Schema Tests", () => {
  it("should validate valid customer registration data", () => {
    const valid = {
      name: "Rohit Sharma",
      email: "rohit.sharma@example.com",
      password: "StrongPassword@123",
      phone: "+91 9876543210"
    };
    const parsed = customerRegisterSchema.safeParse(valid);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.data.email, "rohit.sharma@example.com");
  });

  it("should reject customer registration with invalid email or weak password", () => {
    const badEmail = {
      name: "Test User",
      email: "not-an-email",
      password: "123"
    };
    const parsed = customerRegisterSchema.safeParse(badEmail);
    assert.strictEqual(parsed.success, false);
    assert.ok(parsed.error.issues.length >= 2);
  });

  it("should validate customer login credentials", () => {
    const valid = { email: "admin@mellosoft.com", password: "Password@123" };
    const parsed = customerLoginSchema.safeParse(valid);
    assert.strictEqual(parsed.success, true);

    const invalid = { email: "bad-email", password: "" };
    assert.strictEqual(customerLoginSchema.safeParse(invalid).success, false);
  });

  it("should validate and enforce delivery address constraints", () => {
    const validAddress = {
      label: "Home",
      fullName: "Priya Nair",
      phone: "+91 9876543210",
      addressLine1: "123 Palm Avenue",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      isDefault: true
    };
    const parsed = addressSchema.safeParse(validAddress);
    assert.strictEqual(parsed.success, true);

    const missingPostalCode = {
      fullName: "Priya Nair",
      phone: "12345",
      addressLine1: "123",
      city: "BLR",
      state: "KA",
      postalCode: ""
    };
    assert.strictEqual(addressSchema.safeParse(missingPostalCode).success, false);
  });

  it("should validate checkout payload and line item quantities", () => {
    const checkout = {
      items: [
        {
          productId: "foamcloud",
          size: "Queen",
          firmness: "Medium",
          quantity: 2
        }
      ],
      shippingAddress: {
        fullName: "Rahul Verma",
        phone: "+91 9876543210",
        addressLine1: "42 MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001"
      },
      paymentMethod: "COD"
    };
    const parsed = checkoutOrderSchema.safeParse(checkout);
    assert.strictEqual(parsed.success, true);

    // Negative quantity check
    const badCheckout = {
      ...checkout,
      items: [{ productId: "foamcloud", size: "Queen", firmness: "Medium", quantity: -1 }]
    };
    assert.strictEqual(checkoutOrderSchema.safeParse(badCheckout).success, false);
  });

  it("should validate admin order status update enum", () => {
    assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Processing" }).success, true);
    assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Shipped" }).success, true);
    assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "Delivered" }).success, true);
    assert.strictEqual(adminOrderStatusUpdateSchema.safeParse({ orderStatus: "InvalidStatusXYZ" }).success, false);
  });

  it("should validate review rating range between 1 and 5", () => {
    assert.strictEqual(createReviewSchema.safeParse({ productId: "foamcloud", rating: 5, comment: "Incredible comfort and support!" }).success, true);
    assert.strictEqual(createReviewSchema.safeParse({ productId: "foamcloud", rating: 6, comment: "Too high rating" }).success, false);
    assert.strictEqual(createReviewSchema.safeParse({ productId: "foamcloud", rating: 0, comment: "Too low rating" }).success, false);
  });
});
