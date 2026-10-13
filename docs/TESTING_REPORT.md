# Mellosoft Quality Assurance & Automated Testing Report

**Date:** 2026-10-13  
**Environment:** Node.js v24.11.1 / Next.js 16.2.10 (Turbopack) / PostgreSQL 16 (Prisma 6.4.1)  
**Branch:** `Backend_hostinger`  

---

## 1. Automated Test Suite Summary

All automated tests are integrated via `node:test` and executed using `npm test`.

```
> frontend@0.1.0 test
> node --test tests/*.test.mjs

✔ Password Security & Hashing Tests (4 tests) - PASS (2.59s)
✔ Payment Gateway Verification Tests (3 tests) - PASS (12.7ms)
✔ Pricing Engine & Tax Calculation Tests (4 tests) - PASS (4.5ms)
✔ Role-Based Access Control (RBAC) Permission Tests (5 tests) - PASS (11.2ms)
✔ File Uploads & Magic Byte Verification Tests (4 tests) - PASS (4.0ms)
✔ Input Validation & Zod Schema Tests (7 tests) - PASS (9.2ms)

TOTAL: 27 tests passed, 0 failed, 0 skipped
DURATION: 2.75 seconds
EXIT CODE: 0 (SUCCESS)
```

---

## 2. Test Suite Breakdown

### A. Password Security (`tests/password.test.mjs`)
- [x] Generates valid bcrypt hash with 12 salt rounds (`$2a$` / `$2b$`).
- [x] Correctly verifies matching password.
- [x] Strictly rejects incorrect password.
- [x] Handles empty, null, or undefined password inputs safely without throwing unhandled exceptions.

### B. Payment Gateway Verification (`tests/payments.test.mjs`)
- [x] Defines supported payment methods (`COD`, `UPI`, `RAZORPAY`, `STRIPE`).
- [x] Computes and verifies authentic Razorpay HMAC-SHA256 signatures using timing-safe comparisons.
- [x] Rejects forged or mismatched signatures.

### C. Server-Side Pricing Engine (`tests/pricing.test.mjs`)
- [x] Calculates correct subtotal and applies ₹499 standard shipping fee when under the ₹5,000 threshold.
- [x] Automatically grants free shipping when subtotal reaches or exceeds ₹5,000.
- [x] Calculates exact GST (18%) and applies percentage coupons with configured maximum discount caps.
- [x] Rejects coupons when subtotal is below minimum order value.

### D. Role-Based Access Control (`tests/rbac.test.mjs`)
- [x] Grants Super Admin unrestricted access across all modules and actions.
- [x] Enforces granular permissions for Admin role (allows product/order management, denies role deletion).
- [x] Prevents Manager role from deleting products or creating administrative accounts.
- [x] Restricts Staff role strictly to read-only views, rejecting all mutations.
- [x] Denies access when role object is invalid or permissions are missing.

### E. File Upload & Magic Bytes (`tests/uploads.test.mjs`)
- [x] Validates binary magic bytes for PNG (`89 50 4E 47`).
- [x] Validates binary magic bytes for JPEG (`FF D8 FF`).
- [x] Rejects malicious PHP or executable binaries disguised with image extensions.
- [x] Rejects files exceeding the 5MB upload limit.

### F. Input Validation & Schemas (`tests/validators.test.mjs`)
- [x] Validates customer registration payloads with Indian phone number regex.
- [x] Rejects invalid email formats and short passwords.
- [x] Validates login payloads.
- [x] Validates delivery addresses with mandatory 6-digit Indian PIN codes.
- [x] Validates checkout payloads and rejects zero or negative quantities.
- [x] Validates admin order status transition enums.
- [x] Validates customer review ratings (1 to 5 inclusive).

---

## 3. Production Build Verification

The application was compiled for production using `npm run build`:

```
▲ Next.js 16.2.10 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 28.2s
  Running TypeScript ...
  Finished TypeScript in 118ms ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (70/70) in 872ms
✓ Generating static pages using 11 workers (70/70)
  Finalizing page optimization ...

70 Total Routes Compiled:
- 38 API route handlers (Dynamic)
- 32 Storefront & Admin Portal views (Static & Dynamic)
- 0 Compilation Errors
- 0 TypeScript / Linting Errors
- Exit code: 0
```

---

## 4. End-to-End User Journey Verification

| Journey | Steps Tested | Verification Result |
|---|---|---|
| **Customer Registration & Session** | Form submission -> `/api/auth/register` -> bcrypt hash -> HttpOnly cookie -> Session retrieval | **PASSED** |
| **Catalog Browsing & Variant Pricing** | Filter mattresses -> select Queen + Soft -> authoritative price calculated | **PASSED** |
| **Cart & Persisted State** | Add item -> `/api/cart/items` -> change quantity -> recalculate totals | **PASSED** |
| **Checkout & Order Creation** | Delivery address -> Select COD/UPI -> `/api/checkout` -> order snapshot saved | **PASSED** |
| **Payment Verification** | Submit UPI VPA / Gateway token -> `/api/payments/verify` -> status updated to Paid | **PASSED** |
| **Customer Order Isolation** | `/api/orders` retrieves only authenticated customer's orders | **PASSED** |
| **Admin Order Status Updates** | Admin login -> `/api/admin/orders/[id]` -> status updated -> tracking history appended | **PASSED** |
| **Super Admin Protection** | Attempt to demote/delete last Super Admin -> rejected with 400 Bad Request | **PASSED** |
