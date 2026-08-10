import crypto from "crypto";

/**
 * Hash a plain text password using SHA-256 with a salt
 */
export function hashPassword(password, salt = "mellosoft_salt_2026") {
  if (!password) return "";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

/**
 * Verify a plain text password against a stored hash
 */
export function verifyPassword(password, storedHash, salt = "mellosoft_salt_2026") {
  if (!password || !storedHash) return false;
  return hashPassword(password, salt) === storedHash;
}

/**
 * Check if a role has specific module permission
 */
export function checkPermission(role, moduleName, action) {
  if (!role || !role.permissions) return false;
  const modulePerms = role.permissions[moduleName];
  if (!modulePerms || !Array.isArray(modulePerms)) return false;
  return modulePerms.includes(action);
}
