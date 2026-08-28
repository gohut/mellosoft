import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mellosoft_dev_secret_key_2026_change_in_production";

/**
 * Sign a JWT token for Storefront Customer
 */
export function signCustomerToken(customer, expiresIn = "7d") {
  const payload = {
    sub: customer.id,
    customerId: customer.customerId || customer.id,
    name: customer.name,
    email: customer.email,
    type: "customer",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Sign a JWT token for Admin User (RBAC)
 */
export function signAdminToken(user, role, expiresIn = "24h") {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    roleName: role ? role.name : "User",
    permissions: role ? role.permissions : {},
    type: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode any JWT token
 */
export function verifyToken(token) {
  try {
    if (!token) return null;
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    return jwt.verify(cleanToken, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
