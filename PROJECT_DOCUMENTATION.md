# Mellosoft Full-Stack Application Documentation

Welcome to the comprehensive technical and architectural documentation for **Mellosoft**, a luxury mattress and sleep accessories e-commerce web application featuring a consumer storefront and a role-based admin management portal.

---

## 1. Project Overview & Technology Stack

| Technology | Version / Detail |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) `16.2.10` with App Router (`src/app`) |
| **UI Library** | [React](https://react.dev/) `19.2.4` |
| **React Compiler** | Enabled (`reactCompiler: true` in `next.config.mjs`) for automated compile-time optimization |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Analytics & Charts** | [Recharts](https://recharts.org/) |
| **State Management** | Dual React Context architecture — `StoreContext.js` (storefront) + `AdminContext.js` / `AdminAuthContext.js` (admin) with `localStorage` hydration |
| **Styling** | Vanilla CSS (`globals.css`, `admin-globals.css`) combined with CSS-in-JS inline style objects |
| **Data Architecture** | Relational single-source-of-truth entity model: Customers, Orders, Carts, Wishlists, Products — all linked via unique IDs |

---

## 2. Directory & File Architecture

```
Mellosoft/
├── README.md                          # Repository overview, features & quickstart
├── PROJECT_DOCUMENTATION.md          # Full system architecture documentation (this file)
├── WEBSITE_DOCUMENTATION.md          # Storefront-specific documentation
└── frontend/                         # Next.js web project root
    ├── package.json
    ├── next.config.mjs
    └── src/
        ├── app/
        │   ├── layout.js              # Root layout with StoreProvider
        │   ├── page.js                # Storefront view router (7 views)
        │   ├── globals.css            # Global storefront styles
        │   └── admin/
        │       └── admin-globals.css  # Admin CSS design system & responsive rules
        ├── components/                # Storefront UI components
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   ├── EmptyState.jsx
        │   ├── FirmnessSizeSelector.jsx
        │   ├── QuantityStepper.jsx
        │   └── RatingStars.jsx
        ├── context/
        │   ├── StoreContext.js        # Storefront global state (cart, wishlist, filters)
        │   └── AdminAuthContext.js    # Admin authentication context
        ├── data/
        │   ├── products.js            # MOCK_PRODUCTS — master product catalog
        │   ├── rolesData.js           # DEFAULT_ROLES — system roles & permissions
        │   ├── usersData.js           # DEFAULT_USERS — admin user registry
        │   └── dashboardAnalytics.js  # Sales chart & KPI datasets
        ├── utils/
        │   ├── currency.js            # formatPrice(), calculateDiscountedPrice(), getProductPrices()
        │   ├── variantHelpers.js      # generateVariantId(), reconcileVariants(), getVariantForSelection()
        │   ├── security.js            # hashPassword(), verifyPassword(), checkPermission()
        │   ├── rolesStore.js          # In-memory role/user CRUD store (server-side)
        │   └── apiAuth.js             # verifyApiAuthAndPermission() — API route RBAC middleware
        ├── views/                     # Storefront screen views
        │   ├── HomeView.jsx
        │   ├── CatalogView.jsx
        │   ├── ProductDetailView.jsx
        │   ├── CartView.jsx
        │   ├── WishlistView.jsx
        │   ├── OrdersView.jsx
        │   ├── SearchView.jsx
        │   └── ProfileView.jsx
        └── admin/
            ├── components/
            │   ├── AdminHeader.jsx    # Top bar with role-colored username
            │   ├── AdminSidebar.jsx   # Collapsible sidebar navigation
            │   ├── DataTable.jsx      # Clickable data table component
            │   ├── SalesAnalyticsCard.jsx # Recharts dashboard analytics
            │   ├── StatusBadge.jsx    # Color-coded status pill
            │   ├── Modal.jsx
            │   ├── ConfirmDialog.jsx
            │   ├── Breadcrumb.jsx
            │   ├── Pagination.jsx
            │   ├── SearchBar.jsx
            │   └── StatCard.jsx
            ├── context/
            │   └── AdminContext.js    # Central admin state, RBAC, & relational data engine
            ├── data/
            │   └── adminMockData.js   # MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_CARTS, MOCK_WISHLISTS, MOCK_CATEGORIES, MOCK_INVENTORY
            └── views/
                ├── DashboardView.jsx
                ├── ProductsView.jsx
                ├── AddProductView.jsx
                ├── EditProductView.jsx
                ├── EditPriceAndStockView.jsx
                ├── OrdersView.jsx
                ├── CustomersView.jsx  # Customer table + Customer Profile Modal (with Cart section)
                ├── UsersAndRolesView.jsx
                ├── CategoriesView.jsx
                ├── ReviewsView.jsx
                └── SettingsView.jsx
```

---

## 3. Storefront Architecture

### State Management (`StoreContext.js`)

| State Field | Type | Persisted | Description |
| :--- | :--- | :--- | :--- |
| `view` | String | No | Active view: `home`, `catalog`, `detail`, `cart`, `wishlist`, `search`, `profile` |
| `selectedProductId` | String | No | Product ID for `ProductDetailView` |
| `searchQuery` | String | No | Live search input |
| `activeFilters` | Object | No | `{ category, firmness, size, sort }` |
| `cart` | Array | ✅ `mellosoft_cart` | Shopping cart items |
| `wishlist` | Array | ✅ `mellosoft_wishlist` | Saved product IDs |

**Key actions:** `navigateTo`, `addToCart`, `removeFromCart`, `updateQty`, `clearCart`, `toggleWishlist`, `moveToCart`, `getProductById`

---

## 4. Admin Portal Architecture

### 4.1 Role-Based Access Control (RBAC)

| Role | Header Color | Permission Level |
| :--- | :--- | :--- |
| **Super Admin** | `#7C3AED` Purple | Full system access |
| **Admin** | `#2563EB` Blue | Products, Orders, Customers, Reviews |
| **Manager** | `#D97706` Gold | Catalog & Inventory |
| **Staff** | `#6B6B75` Grey | View-only |

- Role is indicated via **username text color** in `AdminHeader.jsx` — no visible role label.
- `checkPermission(role, module, action)` enforces access guards on every admin mutation.
- `verifyApiAuthAndPermission()` in `apiAuth.js` secures all API routes.

### 4.2 Relational Data Architecture (`AdminContext.js`)

All admin entities are stored in centralized React state, hydrated from and persisted to `localStorage`:

| Entity | localStorage Key | Source |
| :--- | :--- | :--- |
| Products | `mellosoft_products` | `MOCK_PRODUCTS` |
| Categories | `mellosoft_categories` | `MOCK_CATEGORIES` |
| Orders | `mellosoft_orders` | `MOCK_ORDERS` |
| Customers | `mellosoft_customers` | `MOCK_CUSTOMERS` |
| Wishlists | `mellosoft_wishlists` | `MOCK_WISHLISTS` |
| **Carts** | **`mellosoft_admin_carts`** | **`MOCK_CARTS`** |
| Roles | `mellosoft_roles` | `DEFAULT_ROLES` |
| Users | `mellosoft_users` | `DEFAULT_USERS` |

**Entity Relationship Model:**

```
CUSTOMER (customerId)
   │
   ├── ORDERS   (order.customerId === customer.id)
   │      └── ORDER ITEMS
   │               ├── PRODUCT  (item.productId === product.id)
   │               └── VARIANT  (item.variantSize + item.variantFirmness)
   │
   ├── CART     (cart.customerId === customer.id)          ← NEW
   │      └── CART ITEMS
   │               ├── PRODUCT  (item.productId === product.id)
   │               └── VARIANT  (item.variantSize + item.variantFirmness + item.variantSKU)
   │
   └── WISHLIST (wishlist.customerId === customer.id)
          └── PRODUCT (wishlist.productId === product.id)
```

### 4.3 Cart Data Model (`MOCK_CARTS`)

Each cart entry in `adminMockData.js` is a normalized record linking a customer to a specific product variant:

```javascript
{
  cartItemId: "classic-mattress-Firm-King",  // Unique: productId-firmness-size
  customerId: "C001",                         // FK → MOCK_CUSTOMERS.id
  productId:  "classic-mattress",            // FK → MOCK_PRODUCTS.id
  variantSize: "King",
  variantFirmness: "Firm",
  variantSKU: "MEL-KING-FIRM",
  quantity: 2,
  actualPrice: 1099,                         // Base price before discount
  discountPercent: 10,                       // Same discount % as storefront
  addedAt: "2026-08-09",
  stockStatus: "In Stock"                    // "In Stock" | "Low Stock" | "Out of Stock"
}
```

**Price calculation** is identical to the storefront:
```
discountPrice = actualPrice × (1 − discountPercent / 100)
itemTotal     = discountPrice × quantity
cartSubtotal  = Σ itemTotal across all customer's cart items
```

---

## 5. Admin Feature Details

### 5.1 Orders Management (`OrdersView.jsx`)
- Table: `ORDER ID | CUSTOMER | PRODUCTS | AMOUNT | PAYMENT | STATUS | DATE`
- **Clickable rows** open Order Details Modal
- Modal: full order info, customer contact, shipping address, line items with product images & variant details
- Payment Status & Order Status can be updated inline (with RBAC permission check)
- Changes sync in real time to Dashboard, Customer Profile, and `localStorage`

### 5.2 Customers Management (`CustomersView.jsx`)

#### Table
`NAME | EMAIL | PHONE | ORDERS | SPENDING | STATUS`
- `ORDERS` = dynamically computed: `orders.filter(o => o.customerId === c.id).length`
- `SPENDING` = sum of `totalAmount` for Paid/Delivered orders per customer
- **Clickable rows** open Customer Profile Modal

#### Customer Profile Modal — Section Order

| # | Section | Source |
| :--- | :--- | :--- |
| 1 | **Customer Information** | `MOCK_CUSTOMERS` |
| 2 | **Overall Purchase Summary** | Computed from `orders` |
| 3 | **Purchase Insights** | Computed from order items |
| 4 | **Order History** | `orders` filtered by `customerId` |
| 5 | **Cart** ← _New_ | `carts` filtered by `customerId` |
| 6 | **Wishlist** | `wishlists` → resolved via `products` |

#### Customer Profile → Cart Section (New Feature)

**Heading:** `🛒 Cart (N)` — where N = number of unique cart item entries for that customer.

**Per-item card displays:**
- Product image (64×64, from `product.images[0]`)
- Product name (resolved from `products` via `productId`)
- Variant chips: **Size** (navy), **Firmness** (grey), **SKU** (monospace)
- Pricing row: ~~actual price~~ → **discounted price** + discount % badge
- Quantity & Item Total
- Stock status badge: **Low Stock** (gold) or **Out of Stock** (red) — only shown when not "In Stock"

**Cart Subtotal bar** (navy, at section bottom):
```
Σ calculateDiscountedPrice(actualPrice, discountPercent) × quantity
```

**Empty state:** ShoppingCart icon + "No items currently in this customer's cart."

**Behavior:**
- READ-ONLY — no delete/edit/add controls
- Fully reactive via `AdminContext.carts` (`mellosoft_admin_carts` localStorage)
- Different Size+Firmness combinations of the same product appear as **separate cart entries**
- Stock status is informational only — admin cannot modify the customer's cart

### 5.3 Users & Roles (`UsersAndRolesView.jsx`)
- Desktop: data table layout
- Mobile (`≤ 768px`): each user row converts to a responsive `.admin-user-card`
- Role Permissions Matrix: per-module `view / create / edit / delete` toggles
- System roles (Super Admin, Admin, Manager, Staff) are protected from deletion/rename

### 5.4 Dashboard (`DashboardView.jsx`)
- KPI stat cards: Revenue, Orders, Customers, Products
- Recharts sales graph (time-filtered: Today, 7 Days, 30 Days, 6 Months, Year)
- Recent Orders panel — reads from `AdminContext.orders` + resolves customer names from `AdminContext.customers`

---

## 6. Design System

### Color Palette
| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Navy** | `#1B1F8C` | Brand headings, CTAs, cart subtotal, SKU variant chips |
| **Accent Green** | `#16A34A` | Success badges, "In Stock", discount % pill |
| **Warning Gold** | `#D97706` | "Low Stock" badge, Manager role color |
| **Danger Red** | `#DC2626` | "Out of Stock" badge, error states |
| **Background Cream** | `#F7F7F2` | Page background |
| **Background Alt** | `#FAFAF7` | Card interiors, modal panels |
| **Text Primary** | `#14151A` | Main body text |
| **Text Secondary** | `#6B6B75` | Labels, specs, meta info |
| **Border Light** | `#E7E7E2` | Card dividers, separators |

### Mobile Breakpoints
| Breakpoint | Behavior |
| :--- | :--- |
| `≤ 1024px` | Collapsible mobile sidebar overlay |
| `≤ 768px` | Tables → touch-friendly card layouts; full-width modals |

---

## 7. Development & Deployment

### Running Locally
```bash
cd frontend
npm run dev
```

- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Git Branches
| Branch | Purpose |
| :--- | :--- |
| `frontend` | Active development branch (currently tracked) |
| `main` | Stable production branch |
