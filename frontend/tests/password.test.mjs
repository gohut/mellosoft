import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "../src/lib/password.js";

describe("Password Security & Hashing Tests", () => {
  it("should generate a valid bcrypt hash with salt rounds", async () => {
    const raw = "SecureAdmin@2026";
    const hash = await hashPassword(raw);
    assert.ok(hash);
    assert.strictEqual(typeof hash, "string");
    assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
    assert.notStrictEqual(hash, raw);
  });

  it("should verify matching password correctly", async () => {
    const raw = "CustomerPass#99";
    const hash = await hashPassword(raw);
    const isValid = await verifyPassword(raw, hash);
    assert.strictEqual(isValid, true);
  });

  it("should reject incorrect password", async () => {
    const raw = "CorrectPassword123";
    const hash = await hashPassword(raw);
    const isValid = await verifyPassword("WrongPassword456", hash);
    assert.strictEqual(isValid, false);
  });

  it("should reject empty or null passwords safely", async () => {
    const hash = await hashPassword("ValidPass123");
    assert.strictEqual(await verifyPassword("", hash), false);
    assert.strictEqual(await verifyPassword(null, hash), false);
    assert.strictEqual(await verifyPassword(undefined, hash), false);
  });
});
