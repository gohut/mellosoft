# Mellosoft Security Audit & Controls Checklist

This document details all security controls implemented across the Mellosoft application, database, and infrastructure layers.

---

## 1. Authentication & Session Security

- [x] **No Plaintext Password Storage:** All passwords hashed using bcrypt (`bcryptjs`) with 12 salt rounds.
- [x] **Timing-Safe Comparison:** Password checks and webhook signatures use timing-safe evaluations (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
- [x] **Elimination of Plaintext Backdoors:** Removed hardcoded credentials and plaintext bypasses previously present in `security.js` and `AdminAuthContext.jsx`.
- [x] **Opaque Session Identifiers:** Session tokens generated via CSPRNG (`crypto.randomBytes(48)`).
- [x] **HttpOnly & Secure Session Cookies:**
  - `HttpOnly`: Enabled (prevents JavaScript access and XSS token theft).
  - `SameSite`: `Lax` (protects against CSRF across untrusted origins).
  - `Secure`: Dynamically set to `true` in production (enforcing HTTPS transmission).
  - `Max-Age`: 30 days for customer sessions, 7 days for admin sessions.
- [x] **Server-Side Session Revocation:** `/api/auth/logout` explicitly deletes the database session record, preventing revoked token reuse.

---

## 2. Server-Side Authorization & RBAC

- [x] **Elimination of `x-user-id` Spoofing:** Abolished the vulnerability where attackers could supply an unverified `x-user-id` header to claim administrator privileges.
- [x] **Zero Trust in Client State:** Every protected endpoint verifies session cookies and resolves the authenticated identity strictly from the database.
- [x] **RBAC Matrix Enforcement:** Evaluates `[module, action]` against the user's role on every mutation (`requireAdminPermission`).
- [x] **Super Admin Account Protection:** Server explicitly rejects:
  - Deactivating or demoting the last active Super Admin.
  - Deleting the last active Super Admin.
  - Self-deletion of an active operator session.
- [x] **System Role Protection:** System default roles (`Super Admin`, `Admin`, `Manager`, `Staff`) cannot be deleted or renamed.
- [x] **Customer Data Isolation:** Customer queries filter strictly by `customerId === authenticatedCustomer.id`. Direct object references to other customers' orders, addresses, or carts return 404 or 403.

---

## 3. Commerce & Financial Integrity

- [x] **Authoritative Pricing Engine:** Product prices, variant adjustments, discounts, and taxes are calculated exclusively on the server (`calculateAuthoritativeTotals`). Client-submitted price fields are ignored.
- [x] **Exact Minor Unit Storage:** Currency amounts are stored in minor units or exact integer rupee representations to eliminate floating-point rounding errors.
- [x] **Atomic Inventory Decrement:** Checkout operations decrement variant stock inside atomic database transactions (`prisma.$transaction`), preventing overselling during concurrent purchases.
- [x] **Cryptographic Payment Verification:**
  - Razorpay: Signature validated via HMAC-SHA256 (`crypto.createHmac`) against `RAZORPAY_KEY_SECRET`.
  - Stripe: Payment Intent confirmed via server-to-server REST query against Stripe API.
  - Unverified client callbacks cannot mark orders as Paid.

---

## 4. File Upload & Storage Hardening

- [x] **Magic-Byte File Inspection:** File types validated via binary headers (`detectImageSignature` checks JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF...WEBP`, GIF `47 49 46 38`), rejecting executable or script files disguised with image extensions.
- [x] **File Size Limits:** Hard 5MB limit per uploaded file (`saveUploadedImage`).
- [x] **Path Traversal Protection:** Random hex UUIDs generated for all filenames (`${Date.now()}_${randomHex}.${ext}`). Client filenames are never used in filesystem paths.
- [x] **Non-Executable Upload Directory:** Uploads directory resides outside container application code layers, mounted as a persistent volume and served with static mime-types only.

---

## 5. Network & Deployment Hardening

- [x] **No Public Database Port:** PostgreSQL port 5432 is bound strictly to the private internal Docker bridge network (`mellosoft_net`). It is NOT exposed on `0.0.0.0`.
- [x] **Non-Root Container Execution:** Next.js container runs as unprivileged user `nextjs:nodejs` (UID/GID 1001).
- [x] **TLS Termination & HSTS:** Nginx configured with TLSv1.2/1.3, modern cipher suites, and `Strict-Transport-Security` (`max-age=31536000`).
- [x] **HTTP to HTTPS Redirection:** Port 80 unconditionally redirects all traffic to HTTPS.
- [x] **Security Headers Configured:**
  - `X-Frame-Options: SAMEORIGIN` (clickjacking prevention).
  - `X-Content-Type-Options: nosniff` (MIME sniffing prevention).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **Resource Constraints for Low RAM VPS:**
  - Next.js web container: 768MB limit.
  - PostgreSQL container: 384MB limit.
  - Nginx container: 128MB limit.
  - Node options: `--max-old-space-size=768`.
- [x] **Git & Secret Hygiene:**
  - Root and frontend `.gitignore` exclude all `.env*` files, database dumps, build artifacts, and logs.
  - Zero hardcoded production passwords or merchant API secrets in repository.
