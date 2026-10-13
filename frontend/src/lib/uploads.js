import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF" header
  gif: [0x47, 0x49, 0x46, 0x38],  // "GIF8" header
};

/**
 * Validates the file buffer against known image file signatures (magic numbers).
 * @param {Buffer} buffer
 * @returns {string|null} Detected extension ('jpg', 'png', 'webp', 'gif') or null
 */
export function detectImageSignature(buffer) {
  if (!buffer || buffer.length < 8) return null;

  // JPEG
  if (
    buffer[0] === MAGIC_BYTES.jpeg[0] &&
    buffer[1] === MAGIC_BYTES.jpeg[1] &&
    buffer[2] === MAGIC_BYTES.jpeg[2]
  ) {
    return "jpg";
  }

  // PNG
  let isPng = true;
  for (let i = 0; i < MAGIC_BYTES.png.length; i++) {
    if (buffer[i] !== MAGIC_BYTES.png[i]) {
      isPng = false;
      break;
    }
  }
  if (isPng) return "png";

  // WebP: starts with "RIFF" and has "WEBP" at byte 8-11
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  // GIF
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "gif";
  }

  return null;
}

/**
 * Persists an uploaded image buffer to disk securely.
 * 
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {Promise<{ success: boolean, url?: string, filename?: string, error?: string }>}
 */
export async function saveUploadedImage(buffer, originalName = "upload") {
  if (!buffer || !(buffer instanceof Buffer)) {
    return { success: false, error: "Invalid file buffer" };
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { success: false, error: "File exceeds 5MB maximum upload limit" };
  }

  const detectedExt = detectImageSignature(buffer);
  if (!detectedExt) {
    return {
      success: false,
      error: "Invalid or unsupported file format. Allowed types: JPEG, PNG, WebP, GIF.",
    };
  }

  // Generate cryptographic non-colliding filename
  const randomHex = crypto.randomBytes(16).toString("hex");
  const filename = `${Date.now()}_${randomHex}.${detectedExt}`;

  // Destination directory: public/uploads in local workspace / app directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return { success: true, url: publicUrl, filename };
  } catch (err) {
    console.error("File save error:", err);
    return { success: false, error: "Failed to persist uploaded file" };
  }
}
