# MELLOSOFT — SYSTEM & CODEBASE IMPLEMENTATION AUDIT
**Date:** October 2026  
**Auditor:** Senior Full-Stack & Systems Security Engineering  
**Branch:** `Backend_hostinger`  
**Repository:** `https://github.com/gohut/mellosoft`  
**Target Environment:** Hostinger KVM 1 VPS (Ubuntu LTS, Node.js 24 runtime, PostgreSQL)

---

## 1. Executive Summary

A comprehensive architectural and security audit of the Mellosoft codebase was executed on branch `Backend_hostinger`. 

### Key Findings
1. **Frontend Completeness:** The user interface for both the consumer storefront (mattresses, accessories, bed frames, configurator, cart, checkout, profile, search) and the administrative back-office (`/admin` dashboard, products, inventory, orders, customers, reviews, banners, roles, settings) is richly styled and fully interactive with modern React 19 and Next.js 16 components.
2. **Backend Non-Existence:** The application currently operates almost entirely as a **client-side simulation**. There is **no database**, no ORM, no migrations, no real backend persistence, no server-authoritative checkout, and no verified payment gateway integration.
3. **In-Memory & Storage Vulnerabilities:**
   - Administrative users and roles are held in a mutable Node.js process memory array (`src/utils/rolesStore.js`). Every server restart completely wipes user updates and new accounts.
   - Storefront customers, carts, orders, addresses, and settings are written directly to browser `localStorage` and `sessionStorage`.
   - File uploads are intercepted and stored inside browser `IndexedDB` (`MellosoftImageDB`), rendering uploaded product images invisible across browsers, devices, and administrators.
4. **Critical Application Security Flaws:**
   - **Authentication Bypass / Direct Object Reference:** `src/utils/apiAuth.js` honors a raw `x-user-id` HTTP header. Any unauthenticated caller can send `x-user-id: user-001` to gain full `Super Admin` privileges without providing any password or session token.
   - **Trivial Session Tokens:** Session tokens are unhashed, unsigned strings formatted as `ms_session_${Date.now()}_${user.id}`.
   - **Weak Password Verification:** `src/utils/security.js` accepts plaintext passwords (`if (password === storedHash) return true`), uses a static salt HMAC-SHA256, and defaults to hardcoded demo passwords (`Admin@123`).
   - **Client-Authoritative Pricing & Orders:** Orders are generated entirely in the browser (`PaymentView.jsx`), generating pseudo-random IDs (`MS-${randNum}`) and setting payment status to "Paid" for UPI without any payment gateway confirmation or inventory locking.

---

## 2. Source Tree & Runtime Architecture

### Runtime Environment
- **Runtime:** Node.js v24.11.1
- **Package Manager:** npm 11.6.2
- **Framework:** Next.js 16.2.10 (App Router with Turbopack)
- **UI Library:** React 19.2.4, React DOM 19.2.4
- **Charts & Icons:** Recharts 3.10.1, Lucide React 1.28.0
- **Document Generation:** jsPDF 4.2.1
- **Target OS:** Ubuntu 24.04 LTS (Hostinger KVM 1 VPS)

### Directory Breakdown
```
Melosoft/
├── docs/                                # System specifications & audit reports
├── frontend/
│   ├── public/                          # Static assets (product images, textures, logos)
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/              # Admin layout, sidebar, tables, status badges, analytics cards
│   │   │   ├── context/                 # AdminContext.js (102 KB monolithic client state manager)
│   │   │   ├── data/                    # adminMockData.js (MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_CATEGORIES)
│   │   │   └── views/                   # 17 Admin views (Dashboard, Products, Orders, Customers, RBAC, etc.)
│   │   ├── app/
│   │   │   ├── admin/                   # Next.js App Router admin pages
│   │   │   │   ├── (dashboard)/         # Grouped dashboard routes (/admin/products, /orders, etc.)
│   │   │   │   └── login/               # /admin/login
│   │   │   ├── api/                     # Backend API route handlers
│   │   │   │   ├── admin/
│   │   │   │   │   ├── roles/           # GET, POST /api/admin/roles
│   │   │   │   │   │   └── [id]/        # GET, PUT, DELETE /api/admin/roles/[id]
│   │   │   │   │   └── users/           # GET, POST /api/admin/users
│   │   │   │   │       └── [id]/        # GET, PUT, DELETE /api/admin/users/[id]
│   │   │   │   └── auth/
│   │   │   │       └── login/           # POST /api/auth/login
│   │   │   ├── cart/, checkout/, ...    # Storefront App Router pages
│   │   │   ├── globals.css              # Global storefront design tokens & styles
│   │   │   ├── layout.js                # Root layout with StoreProvider
│   │   │   └── page.js                  # Storefront entry page
│   │   ├── components/                  # Storefront reusable UI components (Header, Footer, ProductCard, etc.)
│   │   ├── context/                     # StoreContext.js, CustomerAuthContext.jsx, AdminAuthContext.jsx
│   │   ├── data/                        # products.js, mattressData.js, rolesData.js, usersData.js
│   │   ├── hooks/                       # usePageLoader.js
│   │   ├── utils/                       # Pricing engine, currency, security, variant helpers, imageStorage
│   │   └── views/                       # 23 Storefront view components
│   ├── next.config.mjs                  # React compiler enabled, HMR origins configured
│   └── package.json                     # Dependency manifests
```

---

## 3. Existing API Routes & Backend Coverage

| Route | Method(s) | Current Implementation | Backing Store | Security / Auth |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Validates credentials against in-memory user list or hardcoded passwords | `rolesStore.js` in-memory array | None (returns plain string token `ms_session_...`) |
| `/api/admin/roles` | `GET`, `POST` | Lists or creates roles in memory | `rolesStore.js` in-memory array | `verifyApiAuthAndPermission` (bypassed via `x-user-id`) |
| `/api/admin/roles/[id]` | `GET`, `PUT`, `DELETE` | Reads, modifies, or deletes role in memory | `rolesStore.js` in-memory array | `verifyApiAuthAndPermission` (bypassed via `x-user-id`) |
| `/api/admin/users` | `GET`, `POST` | Lists or creates users in memory | `rolesStore.js` in-memory array | `verifyApiAuthAndPermission` (bypassed via `x-user-id`) |
| `/api/admin/users/[id]` | `GET`, `PUT`, `DELETE` | Reads, updates, or deletes user in memory | `rolesStore.js` in-memory array | `verifyApiAuthAndPermission` (bypassed via `x-user-id`) |

### Missing API Endpoints Required for Production
- **Customer Auth:** `/api/auth/register`, `/api/auth/logout`, `/api/auth/session`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Customer Profile & Addresses:** `/api/customer/profile`, `/api/customer/addresses`, `/api/customer/addresses/[id]`
- **Product Catalog:** `/api/products`, `/api/products/[id]`, `/api/categories`, `/api/categories/[id]`
- **Discovery & Search:** `/api/search`
- **Cart & Wishlist:** `/api/cart`, `/api/cart/items`, `/api/cart/items/[id]`, `/api/wishlist`, `/api/wishlist/items`
- **Checkout & Orders:** `/api/checkout`, `/api/orders`, `/api/orders/[id]`, `/api/orders/[id]/cancel`
- **Payments:** `/api/payments/create-intent`, `/api/payments/verify`, `/api/payments/webhook`
- **Reviews:** `/api/reviews`, `/api/reviews/[id]`
- **Admin Management:**
  - `/api/admin/dashboard` (real SQL aggregated KPIs)
  - `/api/admin/products`, `/api/admin/products/[id]`
  - `/api/admin/categories`, `/api/admin/categories/[id]`
  - `/api/admin/orders`, `/api/admin/orders/[id]`, `/api/admin/orders/[id]/status`
  - `/api/admin/customers`, `/api/admin/customers/[id]`
  - `/api/admin/reviews`, `/api/admin/reviews/[id]`
  - `/api/admin/settings`
  - `/api/admin/uploads` (multipart file uploads with mime validation)
- **Health Check:** `/api/health`

---

## 4. Database & Persistence Audit

- **Existing Database Integrations:** None.
- **Existing Migrations:** None.
- **Current Data Stores:**
  - Browser `localStorage`: Products, orders, customers, carts, wishlists, reviews, banners, settings.
  - Browser `sessionStorage`: Checkout items, selected shipping address.
  - Browser `IndexedDB`: User-uploaded product images (`MellosoftImageDB`).
  - Node.js Process Memory: `activeRoles` and `activeUsers` in `rolesStore.js`.
- **Verdict:** Complete violation of production durability, data consistency, multi-user isolation, and security standards. A complete PostgreSQL schema with Prisma ORM must be established immediately.

---

## 5. State Management & Context Audit

### 1. `StoreContext.js`
- **Scope:** Storefront state (cart, wishlist, product catalog, search filters, orders, reviews, settings, banners).
- **Storage:** Hydrates from and syncs to `localStorage` (`mellosoft_cart`, `mellosoft_wishlist`, `mellosoft_orders`, `mellosoft_settings`, `mellosoft_reviews`, `mellosoft_banners`).
- **Issues:**
  - Cart calculation is done on the client.
  - Stock decrements are applied in local React state and `localStorage` only; not reflected on server or across other shoppers.
  - Orders are written directly into `mellosoft_orders` key.

### 2. `CustomerAuthContext.jsx`
- **Scope:** Customer authentication, profile management, addresses.
- **Storage:** `mellosoft_customer_session`, `mellosoft_customers`.
- **Issues:**
  - `login()` checks email match in `localStorage` without verifying password hash.
  - `signup()` generates customer IDs (`CUS-0001`) via client regex matching.
  - Filter logic artificially filters out hardcoded demo customers (`C001`–`C008`).

### 3. `AdminAuthContext.jsx`
- **Scope:** Administrator login, session state.
- **Storage:** `mellosoft_admin_session`, `mellosoft_current_user_id`.
- **Issues:**
  - Falls back to `DEFAULT_USERS` when API is unreachable.
  - Generates token `ms_session_${Date.now()}_${user.id}` on client.
  - Accepts demo credentials (`Admin@123`, `Priya@123`, `Ankit@123`, `Sneha@123`).

### 4. `AdminContext.js`
- **Scope:** Administrative CRUD for products, categories, orders, customers, reviews, banners, notifications, settings, roles, users.
- **Storage:** 10+ `localStorage` keys.
- **Issues:**
  - All admin KPIs and analytics are computed in-memory over `localStorage` arrays or hardcoded static series (`SALES_CHART_DATA`).
  - Order status updates call an unhandled `fetch('/api/admin/orders/${orderId}')` that 404s.

---

## 6. Discrepancy Analysis (Documentation vs. Code)

| Documented Feature | Markdown Claim | Actual Source Code Reality | Status |
| :--- | :--- | :--- | :--- |
| **Relational Data Architecture** | "Relational single-source-of-truth entity model linked via unique IDs" | Arrays linked by ID strings stored in client `localStorage` | **Simulated / Fictitious** |
| **RBAC API Middleware** | "Secure API route RBAC middleware checking permissions" | `apiAuth.js` allows arbitrary access if `x-user-id` header is set | **Vulnerable** |
| **AI Sleep Advisor** | "Questionnaire analyzing sleep positions and body temperature" | Only mentioned in `PrivacyView.jsx` text; no questionnaire component or API exists | **Missing / Non-Existent** |
| **Order Status Sync** | "Changes sync in real time to Dashboard, Customer Profile and backend" | Local state mutation only; backend PUT call 404s | **Broken** |
| **Payment Gateway** | "Seamless online payment integration" | Radio toggle in `PaymentView.jsx` that creates local JSON order without any payment gateway SDK or signature verification | **Simulated** |
| **Secure Password Storage** | "SHA-256 hashed passwords" | Static salt HMAC or pure JS shift; allows plaintext verification and hardcoded bypasses | **Insecure** |
| **Persistent Image Storage** | "Images persist across administrative sessions" | Stored in client IndexedDB; not accessible by other devices or servers | **Defective** |

---

## 7. Package Scripts, Build Baseline & Vulnerabilities

### Current Scripts
- `npm run dev`: `next dev`
- `npm run build`: `next build`
- `npm run start`: `next start`
- `npm run lint`: `eslint`
- `npm run deploy`: Netlify deployment script (obsolete for Hostinger VPS)

### Baseline Build Status
- **Build Command:** `npm run build`
- **Result:** **PASSED** (Exit code 0).
- **Compiler:** Next.js 16.2.10 with Turbopack and React Compiler enabled.
- **Output:** 43 routes generated (Static prerendered and Dynamic SSR routes).

### Audit & Security Vulnerabilities
- `npm audit`: 33 vulnerabilities detected (27 High, 2 Critical).
- Primary drivers: Deprecated CLI tools, outdated glob, and dev dependencies.
- Production Node.js build will be locked down with audited dependencies.

---

## 8. Feature Matrix & Implementation Inventory

| Feature | Existing UI Location | Current Implementation | Required API | Database Entities | Authorization | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Registration** | Storefront Header modal / `/signup` | Appends customer object to `localStorage` | `POST /api/auth/register` | `Customer`, `CustomerProfile` | Public | Simulated |
| **Customer Login** | Storefront Header modal / `/login` | Matches email in `localStorage`, ignores password | `POST /api/auth/login` | `Customer`, `Session` | Public | Simulated |
| **Customer Session** | Storefront Context | `localStorage` object | `GET /api/auth/session` | `Session` | Customer Session Cookie | Insecure |
| **Customer Logout** | Storefront Header / `/profile` | Removes `localStorage` key | `POST /api/auth/logout` | `Session` | Customer Session | Incomplete |
| **Profile & Addresses** | Storefront `/profile` | Modifies `localStorage` customer record | `GET/PUT /api/customer/profile`, `POST/DELETE /api/customer/addresses` | `Customer`, `CustomerAddress` | Customer Ownership | Simulated |
| **Product Catalog** | Storefront `/`, `/category/*`, `/mattresses`, etc. | Static arrays in `products.js` & `mattressData.js` | `GET /api/products`, `GET /api/categories` | `Product`, `Category`, `ProductVariant` | Public | Static |
| **Product Configurator** | Storefront `/product/[id]` | Client-side matrix math in `pricingEngine.js` | `GET /api/products/[id]` | `Product`, `ProductVariant`, `Inventory` | Public | Client-only |
| **Search & Discovery** | Storefront `/search` | In-memory string filtering over `products.js` | `GET /api/search?q=...` | `Product`, `Category` | Public | Client-only |
| **Shopping Cart** | Storefront `/cart` | Client `localStorage` array | `GET/POST/PUT/DELETE /api/cart` | `Cart`, `CartItem`, `ProductVariant` | Guest / Customer | Client-only |
| **Wishlist** | Storefront `/wishlist` | Client `localStorage` array | `GET/POST/DELETE /api/wishlist` | `Wishlist`, `WishlistItem` | Customer | Client-only |
| **Checkout & Validation**| Storefront `/checkout` | Client-side calculation; stores in `sessionStorage` | `POST /api/checkout` | `Order`, `OrderItem`, `CustomerAddress`, `Inventory` | Customer | Simulated |
| **Payment Processing** | Storefront `/checkout/payment`| Mock radio toggle (UPI / COD); marks Paid | `POST /api/payments/create-order`, `/verify`, `/webhook` | `Payment`, `PaymentEvent`, `Order` | Customer / Webhook | Simulated |
| **Order Confirmation** | Storefront `/order-confirmation` | Reads from `localStorage` order array | `GET /api/orders/[id]` | `Order`, `OrderItem`, `Payment` | Customer Ownership | Client-only |
| **Order History** | Storefront `/orders` | Filters `localStorage` orders by `customerId` | `GET /api/orders` | `Order`, `OrderItem` | Customer Ownership | Client-only |
| **Reviews & Ratings** | Storefront `/product/[id]` | Reads and appends to `localStorage` | `GET/POST /api/reviews` | `Review`, `Product`, `Customer` | Public (Read), Customer (Create) | Client-only |
| **Sleep Advisor** | Storefront `/profile` | Documented in README, non-existent in code | `POST /api/advisor/recommend` | N/A (Rule Engine Module) | Public | Missing |
| **Admin Login** | `/admin/login` | Hardcoded demo pass or in-memory API | `POST /api/auth/login` | `AdminUser`, `Role`, `Session` | Public | Insecure |
| **Admin Dashboard** | `/admin/dashboard` | Static `SALES_CHART_DATA` + `DASHBOARD_STATS` | `GET /api/admin/dashboard` | Aggregated SQL over `Order`, `Customer`, `Product` | Admin (`dashboard.view`) | Mock Data |
| **Product Management** | `/admin/products` | Writes to `mellosoft_products` in `localStorage` | `GET/POST/PUT/DELETE /api/admin/products` | `Product`, `ProductVariant`, `ProductImage` | Admin (`products.view/edit/create/delete`) | Client-only |
| **Inventory Management**| `/admin/inventory` | Reads mock inventory array in `adminMockData.js` | `GET/PUT /api/admin/inventory` | `Inventory`, `ProductVariant` | Admin (`products.edit`) | Mock Data |
| **Category Management** | `/admin/categories` | Writes to `mellosoft_categories` in `localStorage` | `GET/POST/PUT/DELETE /api/admin/categories` | `Category` | Admin (`products.edit`) | Client-only |
| **Orders Management** | `/admin/orders` | Reads/edits `mellosoft_orders`; 404s on API call | `GET/PUT /api/admin/orders/[id]` | `Order`, `OrderItem`, `Payment` | Admin (`orders.view/update`) | Broken |
| **Customer Insights** | `/admin/customers` | Computes spending client-side over mock orders | `GET /api/admin/customers` | `Customer`, `Order`, `Cart`, `Wishlist` | Admin (`customers.view`) | Client-only |
| **Users & Roles (RBAC)**| `/admin/users-roles` | In-memory API + `localStorage` fallback | `GET/POST/PUT/DELETE /api/admin/roles`, `/users` | `AdminUser`, `Role`, `Permission`, `RolePermission` | Super Admin (`roles/users.*`) | In-memory |
| **Reviews Moderation** | `/admin/reviews` | Updates `mellosoft_reviews` in `localStorage` | `GET/PUT/DELETE /api/admin/reviews/[id]` | `Review` | Admin (`reviews.moderate`) | Client-only |
| **Store Settings** | `/admin/settings` | Updates `mellosoft_settings` in `localStorage` | `GET/PUT /api/admin/settings` | `ApplicationSettings` | Super Admin (`settings.edit`) | Client-only |
| **Image Uploads** | Product & Banner Modals| Stores Blobs in client `IndexedDB` | `POST /api/admin/uploads` | Local VPS Upload Storage | Admin / Authorized | Client-only |

---

## 9. Architectural Blueprint & Implementation Plan

To turn this prototype into a hardened, production-ready full-stack application on Hostinger KVM 1:
1. **Database Layer:** Establish a unified PostgreSQL relational schema using Prisma ORM with explicit relations, UUID/cuid primary keys, exact integer minor units for monetary figures (paise/rupees), and database indexes.
2. **Server-Side Security & Sessions:**
   - Migrate authentication to Argon2id / bcrypt password hashing with unique salts.
   - Implement server-managed cryptographically secure session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
   - Eliminate all `x-user-id` header trust; resolve identity strictly from authenticated server session cookies.
   - Enforce server-side RBAC across every single route handler.
3. **Server-Side E-Commerce Core:**
   - Server-side authoritative pricing calculations in minor units.
   - Concurrency-safe checkout with transactional inventory validation and atomic order creation.
   - Payment provider abstraction (Razorpay / Stripe) with server webhook signature verification and idempotent reconciliation.
   - Persistent image upload engine writing to local filesystem volume outside Git tree with MIME type validation.
4. **Frontend Integration:**
   - Reconcile `StoreContext`, `CustomerAuthContext`, `AdminAuthContext`, and `AdminContext` to query Next.js Route Handlers.
   - Ensure graceful loading, empty, and error states without altering UI aesthetics.
5. **Deployment Asset Readiness:**
   - Containerized Docker / systemd configuration tailored for Hostinger KVM 1 (1-2 GB RAM constraints).
   - Automated Nginx reverse proxy configuration with TLS/HTTPS, body-size limits, rate limiting, and gzip compression.
