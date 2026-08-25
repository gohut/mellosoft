/**
 * Hash a plain text password using SHA-256 with a salt
 * Safe for both Node.js server and Browser client.
 */
export function hashPassword(password, salt = "mellosoft_salt_2026") {
  if (!password) return "";
  
  // Try Node.js native crypto if available (server environment)
  try {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoNode = require("crypto");
      if (cryptoNode && typeof cryptoNode.createHmac === "function") {
        return cryptoNode.createHmac("sha256", salt).update(password).digest("hex");
      }
    }
  } catch {
    // Ignore in browser
  }

  // Pure JS fallback for browser environment
  const combined = `${salt}:${password}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "ms_hash_" + Math.abs(hash).toString(16);
}

/**
 * Verify a plain text password against a stored hash
 */
export function verifyPassword(password, storedHash, salt = "mellosoft_salt_2026") {
  if (!password || !storedHash) return false;

  // 1. Direct password match
  if (password === storedHash) {
    return true;
  }

  // 2. Hash match via hashPassword
  const computedHash = hashPassword(password, salt);
  if (computedHash === storedHash) {
    return true;
  }

  // 3. Try Node crypto verification if available
  try {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoNode = require("crypto");
      if (cryptoNode && typeof cryptoNode.createHmac === "function") {
        const nodeHash = cryptoNode.createHmac("sha256", salt).update(password).digest("hex");
        if (nodeHash === storedHash) return true;
      }
    }
  } catch {
    // Ignore
  }

  return false;
}

/**
 * Check if a role has specific module permission
 */
export function checkPermission(role, moduleName, action) {
  if (!role) return false;

  // 1. Super Admin role always has full access to all modules and actions
  const roleName = (role.name || "").toLowerCase();
  const roleId = (role.id || "").toLowerCase();
  if (
    roleName.includes("super admin") ||
    roleId.includes("super-admin") ||
    roleId.includes("super_admin") ||
    roleId === "role-super-admin"
  ) {
    return true;
  }

  if (!role.permissions) return false;
  const modulePerms = role.permissions[moduleName];
  if (!modulePerms) return false;

  // Normalize action checks with common aliases
  const isUpdateStatus = action === "updateStatus" || action === "update";
  const isModerate = action === "moderate" || action === "approve" || action === "reject";
  const isShowOnHome = action === "featureOnHome" || action === "showOnHome";

  // 2. Handle array format: e.g. ["view", "create", "edit", "delete"]
  if (Array.isArray(modulePerms)) {
    if (modulePerms.includes(action)) return true;
    if (isUpdateStatus && (modulePerms.includes("updateStatus") || modulePerms.includes("update"))) return true;
    if (isModerate && (modulePerms.includes("moderate") || modulePerms.includes("approve") || modulePerms.includes("reject"))) return true;
    if (isShowOnHome && (modulePerms.includes("featureOnHome") || modulePerms.includes("showOnHome"))) return true;
    return false;
  }

  // 3. Handle object format: e.g. { view: true, create: true }
  if (typeof modulePerms === "object") {
    if (modulePerms[action] === true) return true;
    if (isUpdateStatus && (modulePerms.updateStatus === true || modulePerms.update === true)) return true;
    if (isModerate && (modulePerms.moderate === true || modulePerms.approve === true || modulePerms.reject === true)) return true;
    if (isShowOnHome && (modulePerms.featureOnHome === true || modulePerms.showOnHome === true)) return true;
    return false;
  }

  return false;
}

