import { describe, it } from "node:test";
import assert from "node:assert";
import { detectImageSignature, saveUploadedImage } from "../src/lib/uploads.js";

describe("File Uploads & Magic Byte Verification Tests", () => {
  it("should accurately detect valid PNG file signatures", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    assert.strictEqual(detectImageSignature(pngBuffer), "png");
  });

  it("should accurately detect valid JPEG file signatures", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    assert.strictEqual(detectImageSignature(jpegBuffer), "jpg");
  });

  it("should reject malicious or executable files disguised with .png extensions", () => {
    const fakeFile = Buffer.from("<?php echo 'malicious script'; ?>");
    assert.strictEqual(detectImageSignature(fakeFile), null);

    const exeFile = Buffer.from("MZ\x90\x00\x03\x00\x00\x00\x04\x00");
    assert.strictEqual(detectImageSignature(exeFile), null);
  });

  it("should reject buffers exceeding the 5MB upload limit", async () => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const result = await saveUploadedImage(largeBuffer);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("5MB"));
  });
});
