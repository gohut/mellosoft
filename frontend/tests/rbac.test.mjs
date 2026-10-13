import { describe, it } from "node:test";
import assert from "node:assert";
import { checkPermission } from "../src/lib/rbac.js";

describe("Role-Based Access Control (RBAC) Permission Tests", () => {
  const superAdminRole = {
    id: "role-super-admin",
    name: "Super Admin",
    permissions: {}
  };

  const adminRole = {
    id: "role-admin",
    name: "Admin",
    permissions: {
      dashboard: ["view"],
      products: ["view", "create", "edit", "delete"],
      orders: ["view", "edit", "updateStatus"],
      customers: ["view", "edit"],
      reviews: ["view", "moderate"],
      users: ["view", "create", "edit"],
      roles: ["view"],
      settings: ["view", "edit"]
    }
  };

  const managerRole = {
    id: "role-manager",
    name: "Manager",
    permissions: {
      dashboard: ["view"],
      products: ["view", "edit"],
      orders: ["view", "updateStatus"],
      customers: ["view"],
      reviews: ["view", "moderate"]
    }
  };

  const staffRole = {
    id: "role-staff",
    name: "Staff",
    permissions: {
      dashboard: ["view"],
      products: ["view"],
      orders: ["view"],
      customers: ["view"],
      reviews: ["view"]
    }
  };

  it("should grant Super Admin unrestricted access to any module and action", () => {
    assert.strictEqual(checkPermission(superAdminRole, "dashboard", "view"), true);
    assert.strictEqual(checkPermission(superAdminRole, "roles", "delete"), true);
    assert.strictEqual(checkPermission(superAdminRole, "users", "delete"), true);
    assert.strictEqual(checkPermission(superAdminRole, "settings", "edit"), true);
  });

  it("should enforce explicit permissions for Admin role", () => {
    assert.strictEqual(checkPermission(adminRole, "products", "create"), true);
    assert.strictEqual(checkPermission(adminRole, "products", "delete"), true);
    assert.strictEqual(checkPermission(adminRole, "orders", "updateStatus"), true);
    assert.strictEqual(checkPermission(adminRole, "roles", "delete"), false); // Admin cannot delete roles
  });

  it("should prevent Manager from deleting products or managing users/roles", () => {
    assert.strictEqual(checkPermission(managerRole, "products", "edit"), true);
    assert.strictEqual(checkPermission(managerRole, "products", "delete"), false);
    assert.strictEqual(checkPermission(managerRole, "users", "create"), false);
    assert.strictEqual(checkPermission(managerRole, "roles", "edit"), false);
  });

  it("should restrict Staff to read-only views and deny mutations", () => {
    assert.strictEqual(checkPermission(staffRole, "products", "view"), true);
    assert.strictEqual(checkPermission(staffRole, "orders", "view"), true);
    assert.strictEqual(checkPermission(staffRole, "products", "create"), false);
    assert.strictEqual(checkPermission(staffRole, "orders", "edit"), false);
    assert.strictEqual(checkPermission(staffRole, "reviews", "moderate"), false);
    assert.strictEqual(checkPermission(staffRole, "settings", "view"), false);
  });

  it("should deny access when role is missing or permissions object is invalid", () => {
    assert.strictEqual(checkPermission(null, "products", "view"), false);
    assert.strictEqual(checkPermission(undefined, "products", "view"), false);
    assert.strictEqual(checkPermission({}, "products", "view"), false);
  });
});
