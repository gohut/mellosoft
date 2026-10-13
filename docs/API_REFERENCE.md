# Mellosoft API Reference Specification

All API endpoints are hosted under `/api` in the Next.js runtime. Server sessions are maintained through cryptographically signed HttpOnly cookies (`ms_customer_session` for customers, `ms_admin_session` for administrators).

---

## 1. System Health

### `GET /api/health`
- **Description:** Verifies application and database connectivity.
- **Auth:** Public
- **Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-13T04:45:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 2. Authentication & Session Management

### `POST /api/auth/register`
- **Description:** Registers a new customer account, hashes password via bcrypt (12 rounds), establishes an authenticated session, and returns profile.
- **Auth:** Public
- **Payload:**
```json
{
  "name": "Ananya Sharma",
  "email": "ananya@example.com",
  "password": "StrongPassword@123",
  "phone": "+91 98765 43210"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "customer": {
    "id": "CUS-0012",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "+91 98765 43210",
    "role": "Customer"
  }
}
```

### `POST /api/auth/login`
- **Description:** Unified login endpoint for both customer accounts and administrative users. Sets `ms_customer_session` or `ms_admin_session` HttpOnly cookie.
- **Auth:** Public
- **Payload:**
```json
{
  "email": "admin@mellosoft.in",
  "password": "SecurePassword@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-001",
    "name": "Super Admin",
    "email": "admin@mellosoft.in",
    "role": {
      "id": "role-super-admin",
      "name": "Super Admin"
    }
  }
}
```

### `GET /api/auth/session`
- **Description:** Resolves the current session from HttpOnly cookies and returns the active user or customer identity.
- **Auth:** Public (returns authenticated: false if no active session)
- **Response (200 OK):**
```json
{
  "success": true,
  "authenticated": true,
  "customer": { "id": "CUS-0012", "name": "Ananya Sharma", "email": "ananya@example.com" }
}
```

### `POST /api/auth/logout`
- **Description:** Invalidates server session token in database and clears cookies.
- **Auth:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Customer Profile & Addresses

### `GET /api/customer/profile`
- **Auth:** Customer Session Required
- **Response (200 OK):**
```json
{
  "success": true,
  "customer": {
    "id": "CUS-0012",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "+91 98765 43210",
    "avatar": "A",
    "createdAt": "2026-10-13T04:00:00.000Z",
    "savedAddresses": []
  }
}
```

### `PUT /api/customer/profile`
- **Auth:** Customer Session Required
- **Payload:** `{ "name": "Ananya S.", "phone": "+91 98765 43210" }`

### `GET /api/customer/addresses`
- **Auth:** Customer Session Required
- **Response (200 OK):** Returns array of saved shipping addresses belonging strictly to the authenticated customer.

### `POST /api/customer/addresses`
- **Auth:** Customer Session Required
- **Payload:**
```json
{
  "label": "Home",
  "fullName": "Ananya Sharma",
  "phone": "+91 9876543210",
  "addressLine1": "42 MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "postalCode": "560001",
  "isDefault": true
}
```

---

## 4. Product Catalog & Discovery

### `GET /api/products`
- **Auth:** Public
- **Query Params:** `category`, `sort`, `search`, `page`, `limit`
- **Response (200 OK):**
```json
{
  "success": true,
  "products": [
    {
      "id": "foamcloud",
      "name": "FoamCloud Luxe Mattress",
      "startingPrice": 14999,
      "price": 14999,
      "actualPrice": 18999,
      "discountPercent": 21,
      "category": "mattresses",
      "images": ["/assets/products/foamcloud-1.png"],
      "variants": []
    }
  ],
  "total": 60,
  "page": 1,
  "totalPages": 1
}
```

### `GET /api/products/[id]`
- **Auth:** Public
- **Response (200 OK):** Full product details, variants, specifications, and approved reviews.

### `GET /api/categories`
- **Auth:** Public
- **Response (200 OK):** Hierarchical categories with subcategory arrays and active product counts.

### `GET /api/search`
- **Auth:** Public
- **Query Params:** `q=latex`
- **Response (200 OK):** Filtered matching products and categories.

---

## 5. Cart & Wishlist

### `GET /api/cart`
- **Auth:** Customer Session Required (falls back to guest cart for unauthenticated)
- **Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": "cart_123",
    "items": [
      {
        "id": "item_456",
        "productId": "foamcloud",
        "variantId": "var_789",
        "size": "Queen",
        "firmness": "Medium",
        "quantity": 1,
        "price": 1499900
      }
    ]
  }
}
```

### `POST /api/cart/items`
- **Auth:** Customer Session Required
- **Payload:** `{ "productId": "foamcloud", "size": "Queen", "firmness": "Medium", "quantity": 1 }`

### `PUT /api/cart/items/[id]`
- **Auth:** Customer Session Required
- **Payload:** `{ "quantity": 2 }`

### `DELETE /api/cart/items/[id]`
- **Auth:** Customer Session Required

### `POST /api/wishlist`
- **Auth:** Customer Session Required
- **Payload:** `{ "productId": "foamcloud" }`

---

## 6. Checkout & Orders

### `POST /api/checkout`
- **Auth:** Public / Authenticated Customer
- **Description:** Authoritative checkout calculation, transactional stock decrement, order record creation in database.
- **Payload:**
```json
{
  "items": [
    {
      "productId": "foamcloud",
      "size": "Queen",
      "firmness": "Medium",
      "quantity": 1
    }
  ],
  "deliveryAddress": {
    "fullName": "Rahul Verma",
    "phone": "+91 9876543210",
    "addressLine1": "42 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "paymentMethod": "COD",
  "notes": "Please deliver after 2 PM"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "order": {
    "id": "MS-48291",
    "orderStatus": "Confirmed",
    "paymentStatus": "Pending",
    "subtotal": 14999,
    "tax": 2699,
    "shipping": 0,
    "totalAmount": 17698
  }
}
```

### `POST /api/payments/verify`
- **Auth:** Public / Customer
- **Description:** Verifies payment completion (UPI reference, Razorpay HMAC-SHA256 signature, or Stripe intent). Updates order status to Paid.

### `POST /api/payments/webhook`
- **Auth:** Signature Verified
- **Description:** Idempotent server-to-server webhook endpoint for Razorpay and Stripe event reconciliation.

### `GET /api/orders`
- **Auth:** Customer Session Required
- **Description:** Returns all orders belonging exclusively to the authenticated customer.

---

## 7. Admin Portal Suite (Strict RBAC Enforced)

All routes require active `ms_admin_session` cookie and verification against role permissions.

| Endpoint | Method | Required Module & Action | Description |
|---|---|---|---|
| `/api/admin/dashboard` | `GET` | `dashboard.view` | Aggregates real SQL KPIs (revenue, orders, customers, products). |
| `/api/admin/products` | `GET`, `POST` | `products.view` / `products.create` | Lists or creates catalog products and variants. |
| `/api/admin/products/[id]` | `GET`, `PUT`, `DELETE` | `products.view` / `products.edit` / `products.delete` | Inspects, modifies, or archives catalog products. |
| `/api/admin/inventory` | `GET`, `PUT` | `products.view` / `products.edit` | Batch updates variant SKU inventory stock and alert thresholds. |
| `/api/admin/orders` | `GET` | `orders.view` | Paginated admin order search and status filtering. |
| `/api/admin/orders/[id]` | `GET`, `PUT` | `orders.view` / `orders.updateStatus` | Updates order delivery status and appends tracking history. |
| `/api/admin/customers` | `GET` | `customers.view` | Customer directory, total spent, and lifetime orders. |
| `/api/admin/reviews` | `GET` | `reviews.view` | Unmoderated, approved, and rejected reviews table. |
| `/api/admin/reviews/[id]` | `PUT`, `DELETE` | `reviews.moderate` | Approves or rejects customer reviews and toggles home display. |
| `/api/admin/users` | `GET`, `POST` | `users.view` / `users.create` | Administrative user accounts directory and creation. |
| `/api/admin/users/[id]` | `PUT`, `DELETE` | `users.edit` / `users.delete` | Modifies or deletes admin accounts (protects last Super Admin). |
| `/api/admin/roles` | `GET`, `POST` | `roles.view` / `roles.create` | Role definitions and module permission matrices. |
| `/api/admin/roles/[id]` | `PUT`, `DELETE` | `roles.edit` / `roles.delete` | Modifies custom roles (protects system roles from deletion). |
| `/api/admin/settings` | `GET`, `PUT` | `settings.view` / `settings.edit` | Store information, GST rate, shipping fees, policy texts. |
| `/api/admin/uploads` | `POST` | `products.create` / `content.edit` | Secure image uploads with magic-byte validation and disk storage. |
