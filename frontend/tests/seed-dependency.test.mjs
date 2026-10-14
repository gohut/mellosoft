import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Production Seed Dependency Graph & ESM Resolution Tests", () => {
  it("should resolve and load src/data/seedData.js with valid coupons and banners", async () => {
    const seedData = await import("../src/data/seedData.js");
    assert.ok(Array.isArray(seedData.SEED_COUPONS), "SEED_COUPONS should be an array");
    assert.ok(seedData.SEED_COUPONS.length > 0, "SEED_COUPONS should not be empty");
    assert.ok(Array.isArray(seedData.SEED_BANNERS), "SEED_BANNERS should be an array");
    assert.ok(seedData.SEED_BANNERS.length > 0, "SEED_BANNERS should not be empty");

    for (const coupon of seedData.SEED_COUPONS) {
      assert.ok(coupon.code, "Coupon must have a code");
      assert.ok(coupon.discount, "Coupon must have a discount value");
    }
  });

  it("should resolve and load src/data/rolesData.js with system roles", async () => {
    const rolesData = await import("../src/data/rolesData.js");
    assert.ok(Array.isArray(rolesData.DEFAULT_ROLES), "DEFAULT_ROLES should be an array");
    assert.ok(rolesData.DEFAULT_ROLES.length >= 4, "Should define at least 4 system roles");
    const superAdmin = rolesData.DEFAULT_ROLES.find((r) => r.id === "role-super-admin");
    assert.ok(superAdmin, "Super Admin role must exist");
  });

  it("should resolve and load src/data/mattressData.js with catalog products", async () => {
    const mattressData = await import("../src/data/mattressData.js");
    assert.ok(Array.isArray(mattressData.MATTRESS_PRODUCTS), "MATTRESS_PRODUCTS should be an array");
    assert.ok(mattressData.MATTRESS_PRODUCTS.length > 0, "MATTRESS_PRODUCTS should not be empty");
    assert.ok(Array.isArray(mattressData.ACCESSORY_PRODUCTS), "ACCESSORY_PRODUCTS should be an array");
    assert.ok(Array.isArray(mattressData.BED_FRAME_PRODUCTS), "BED_FRAME_PRODUCTS should be an array");
  });

  it("should resolve adminMockData.js without ERR_MODULE_NOT_FOUND", async () => {
    const adminData = await import("../src/admin/data/adminMockData.js");
    assert.ok(Array.isArray(adminData.MOCK_PRODUCTS), "MOCK_PRODUCTS should be imported and re-exported");
    assert.ok(adminData.MOCK_PRODUCTS.length > 0, "MOCK_PRODUCTS should not be empty");
  });

  it("should ensure prisma/seed.mjs has no extensionless relative imports", () => {
    const seedPath = path.join(__dirname, "../prisma/seed.mjs");
    const seedContent = fs.readFileSync(seedPath, "utf8");
    const relativeImports = [...seedContent.matchAll(/from\s+["'](\.[^"']+)["']/g)].map((m) => m[1]);

    for (const imp of relativeImports) {
      assert.ok(
        imp.endsWith(".js") || imp.endsWith(".mjs"),
        `Relative import "${imp}" in seed.mjs must have an explicit file extension (.js or .mjs)`
      );
    }
  });
});
