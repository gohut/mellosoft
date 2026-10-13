/**
 * Hardened Security Utility for Mellosoft
 * Eliminates plaintext password comparison backdoors.
 */

import { checkPermission as checkPermissionCore } from "../lib/rbac";

export function hashPassword(password, salt = "mellosoft_salt_2026") {
  if (!password) return "";
  try {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoNode = require("crypto");
      if (cryptoNode && typeof cryptoNode.createHmac === "function") {
        return cryptoNode.createHmac("sha256", salt).update(password).digest("hex");
      }
    }
  } catch {}

  const combined = `${salt}:${password}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "ms_hash_" + Math.abs(hash).toString(16);
}

export function verifyPassword(password, storedHash, salt = "mellosoft_salt_2026") {
  if (!password || !storedHash) return false;

  try {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cryptoNode = require("crypto");
      if (cryptoNode && typeof cryptoNode.createHmac === "function") {
        const nodeHash = cryptoNode.createHmac("sha256", salt).update(password).digest("hex");
        if (nodeHash.length === storedHash.length) {
          return cryptoNode.timingSafeEqual(Buffer.from(nodeHash), Buffer.from(storedHash));
        }
      }
    }
  } catch {}

  const computedHash = hashPassword(password, salt);
  return computedHash === storedHash;
}

export function checkPermission(role, moduleName, action) {
  return checkPermissionCore(role, moduleName, action);
}
