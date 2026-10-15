import { describe, it } from "node:test";
import assert from "node:assert";

/**
 * Cart lifecycle verification logic simulating StoreContext and API behaviors
 */
describe("Cart Lifecycle, Guest Persistence & Reconciliation Tests", () => {
  it("should generate a valid anonymous guest token format", () => {
    const generateGuestToken = () => `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const token1 = generateGuestToken();
    const token2 = generateGuestToken();

    assert.ok(token1.startsWith("guest_"));
    assert.ok(token2.startsWith("guest_"));
    assert.notStrictEqual(token1, token2);
  });

  it("should generate composite cartItemId containing product, firmness, and size", () => {
    const makeCartItemId = (productId, firmness, size) => `${productId}-${firmness}-${size}`;
    const key = makeCartItemId("foamcloud", "Medium", "Queen");
    assert.strictEqual(key, "foamcloud-Medium-Queen");

    // Deconstructing composite key
    const parts = key.split("-");
    assert.strictEqual(parts[0], "foamcloud");
    assert.strictEqual(parts[1], "Medium");
    assert.strictEqual(parts[2], "Queen");
  });

  it("should maintain separate storage keys for guest and authenticated customers", () => {
    const getCartStorageKey = (customerId) => (customerId ? `mellosoft_cart_${customerId}` : "mellosoft_cart_guest");

    assert.strictEqual(getCartStorageKey(null), "mellosoft_cart_guest");
    assert.strictEqual(getCartStorageKey(undefined), "mellosoft_cart_guest");
    assert.strictEqual(getCartStorageKey("CUS-0001"), "mellosoft_cart_CUS-0001");
    assert.strictEqual(getCartStorageKey("CUS-0002"), "mellosoft_cart_CUS-0002");
  });

  it("should safely reconcile guest cart items into customer cart on login without duplicates", () => {
    const guestCart = [
      {
        cartItemId: "foamcloud-Medium-Queen",
        productId: "foamcloud",
        name: "FoamCloud Mattress",
        size: "Queen",
        firmness: "Medium",
        quantity: 1,
        price: 24999
      },
      {
        cartItemId: "cloud-pillow-Standard-Medium",
        productId: "cloud-pillow",
        name: "Cloud Pillow",
        size: "Standard",
        firmness: "Medium",
        quantity: 2,
        price: 1999
      }
    ];

    const existingCustomerCart = [
      {
        cartItemId: "foamcloud-Medium-Queen", // Same product & variant
        productId: "foamcloud",
        name: "FoamCloud Mattress",
        size: "Queen",
        firmness: "Medium",
        quantity: 1,
        price: 24999
      }
    ];

    // Reconcile algorithm: merge matching variant quantities, append new items
    const reconciled = [...existingCustomerCart];
    for (const gItem of guestCart) {
      const matchIdx = reconciled.findIndex((c) => c.cartItemId === gItem.cartItemId);
      if (matchIdx >= 0) {
        reconciled[matchIdx].quantity += gItem.quantity;
      } else {
        reconciled.push({ ...gItem });
      }
    }

    assert.strictEqual(reconciled.length, 2);
    // FoamCloud quantity should be 1 + 1 = 2
    assert.strictEqual(reconciled[0].productId, "foamcloud");
    assert.strictEqual(reconciled[0].quantity, 2);
    // Cloud Pillow added as new item
    assert.strictEqual(reconciled[1].productId, "cloud-pillow");
    assert.strictEqual(reconciled[1].quantity, 2);
  });

  it("should accurately resolve products by either canonical productId or slug", () => {
    const catalog = [
      { id: "haven", productId: "PROD-HAVEN", slug: "haven", name: "Haven Mattress", active: true },
      { id: "foamcloud", productId: "PROD-FOAMCLOUD", slug: "foamcloud", name: "FoamCloud Mattress", active: true }
    ];

    const resolveProduct = (lookupId) => {
      const clean = (lookupId || "").trim().toLowerCase();
      return catalog.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.productId.toLowerCase() === clean ||
          p.slug.toLowerCase() === clean
      ) || null;
    };

    assert.strictEqual(resolveProduct("haven")?.name, "Haven Mattress");
    assert.strictEqual(resolveProduct("PROD-HAVEN")?.name, "Haven Mattress");
    assert.strictEqual(resolveProduct("prod-haven")?.name, "Haven Mattress");
    assert.strictEqual(resolveProduct("foamcloud")?.name, "FoamCloud Mattress");
    assert.strictEqual(resolveProduct("PROD-FOAMCLOUD")?.name, "FoamCloud Mattress");
    assert.strictEqual(resolveProduct("non-existent"), null);
  });

  it("should handle cart item removal and quantity updates safely", () => {
    let cart = [
      { cartItemId: "item-1", quantity: 2 },
      { cartItemId: "item-2", quantity: 1 }
    ];

    // Update quantity
    const updateQty = (id, newQty) => {
      if (newQty <= 0) {
        cart = cart.filter((i) => i.cartItemId !== id);
      } else {
        cart = cart.map((i) => (i.cartItemId === id ? { ...i, quantity: newQty } : i));
      }
    };

    updateQty("item-1", 3);
    assert.strictEqual(cart.find((i) => i.cartItemId === "item-1")?.quantity, 3);

    // Decrement to zero should remove item
    updateQty("item-2", 0);
    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].cartItemId, "item-1");
  });
});
