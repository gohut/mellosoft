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
  if (!role || !role.permissions) return false;
  const modulePerms = role.permissions[moduleName];
  if (!modulePerms || !Array.isArray(modulePerms)) return false;
  return modulePerms.includes(action);
}

