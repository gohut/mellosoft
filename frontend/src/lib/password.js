import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password securely using bcrypt with 12 salt rounds.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text candidate password against a stored bcrypt hash.
 * Never allows plaintext password bypasses or hardcoded shortcuts.
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }
  // Standard bcrypt hash verification
  try {
    return await bcrypt.compare(password, storedHash);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}
