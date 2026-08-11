# Mellosoft Full-Stack Application Documentation

Welcome to the comprehensive technical and architectural documentation for **Mellosoft**, a luxury mattress and sleep accessories e-commerce web application featuring a consumer storefront and a role-based admin management portal.

---

## 1. Project Overview & Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (Version `16.2.10`) with App Router (`src/app`)
* **Library**: [React](https://react.dev/) (Version `19.2.4`)
* **React Compiler**: Enabled (`reactCompiler: true` in `next.config.mjs`) for automated compile-time performance optimizations
* **Icons**: [Lucide React](https://lucide.dev/)
* **Analytics & Charts**: [Recharts](https://recharts.org/)
* **State Management**: Dual React Context Architecture (`StoreContext.js` for storefront & `AdminContext.js` / `AdminAuthContext.js` for admin) with synchronized `localStorage` hydration
* **Styling**: Pure Vanilla CSS and scoped/global CSS-in-JS style objects paired with global stylesheets (`src/app/globals.css` and `src/app/admin/admin-globals.css`)
* **Data Architecture**: Relational, single-source-of-truth entity model linking Customers, Orders, Products, and Wishlists via unique IDs (`customerId`, `productId`, `orderId`).

---

## 2. Directory & File Architecture

```
Mellosoft/
├── README.md                     # Main repository landing overview & quickstart
├── PROJECT_DOCUMENTATION.md      # Full architecture & technical documentation
├── WEBSITE_DOCUMENTATION.md      # Storefront specific documentation
└── frontend/                     # Next.js web project root
    ├── package.json              # Project dependencies & scripts
    ├── next.config.mjs           # Next.js configuration
    ├── public/
    │   └── asset/                # Images, textures, and product assets
    └── src/
        ├── app/
        │   ├── layout.js         # Root layout with metadata & StoreProvider
        │   ├── page.js           # Storefront view router entry point
        │   ├── globals.css       # Global storefront styles
        │   └── admin/            # Admin portal route directory
        │       ├── admin-globals.css # Admin CSS design system & responsive rules
        │       └── (dashboard)/
        │           └── page.js   # Admin dashboard shell & view manager
        ├── components/           # Storefront UI components
        │   ├── Header.jsx        # Sticky navigation header
        │   ├── Footer.jsx        # Categoric footer & payment options
        │   ├── ProductCard.jsx   # Product card component
        │   ├── EmptyState.jsx    # Fallback message renderer
        │   ├── FirmnessSizeSelector.jsx # Selection chips
        │   ├── QuantityStepper.jsx # Item quantity counter
        │   └── RatingStars.jsx   # Star rating builder
        ├── context/              # Storefront state context
        │   ├── StoreContext.js   # Global store state & cart management
        │   └── AdminAuthContext.js # Admin authentication context
        ├── data/                 # Primary static/mock database schemas
        │   ├── products.js       # Master product catalog
        │   ├── rolesData.js      # System roles & permission matrices
        │   ├── usersData.js      # System admin users registry
        │   └── dashboardAnalytics.js # Analytics & sales period datasets
        ├── utils/                # Utility helpers
        │   ├── currency.js       # Localized Indian Rupee (₹) price formatter
        │   └── security.js       # Password hashing & RBAC permission checker
        ├── views/                # Storefront view pages
        │   ├── HomeView.jsx      # Hero slider, featured collections, promo callouts
        │   ├── CatalogView.jsx   # Filtered product catalog & sorting engine
        │   ├── ProductDetailView.jsx # Multi-angle gallery, size/firmness configurator
        │   ├── CartView.jsx      # Cart manager & simulated checkout
        │   ├── WishlistView.jsx  # Favorites manager with bulk cart actions
        │   ├── SearchView.jsx    # Live discovery search engine
        │   └── ProfileView.jsx   # Sleep questionnaire & AI Sleep Advisor
        └── admin/                # Admin Portal System
            ├── components/       # Admin reusable components
            │   ├── AdminHeader.jsx # Admin top header & role-colored user profile
            │   ├── AdminSidebar.jsx # Sidebar navigation with collapsed/mobile modes
            │   ├── DataTable.jsx   # Data table with clickable row support
            │   ├── SalesAnalyticsCard.jsx # Recharts sales graph & KPI cards
            │   ├── StatusBadge.jsx # Color-coded status badge pill component
            │   └── Modal.jsx       # Reusable modal container
            ├── context/
            │   └── AdminContext.js # Central relational state & persistence engine
            ├── data/
            │   └── adminMockData.js # Relational customer, order & wishlist mock data
            └── views/            # Admin management view screens
                ├── DashboardView.jsx # Main analytics overview
                ├── ProductsView.jsx # Products table & inventory manager
                ├── AddProductView.jsx # New product creation form
                ├── EditProductView.jsx # Product editor & image manager
                ├── EditPriceAndStockView.jsx # Quick price & inventory updater
                ├── OrdersView.jsx   # Clickable orders table & Order Details Modal
                ├── CustomersView.jsx # Clickable customer list & Customer Profile Modal
                ├── UsersAndRolesView.jsx # User management & custom RBAC role editor
                ├── CategoriesView.jsx # Category manager
                ├── ReviewsView.jsx  # Review moderation panel
                └── SettingsView.jsx # System settings & store configuration
```

---

## 3. Storefront Architecture (`src/views`)

### State Management (`StoreContext.js`)
* **Cart Hydration & Management**: Hydrates automatically from `localStorage` key `mellosoft_cart`. Calculates item variant subtotals (`price * quantity`), handles size-specific pricing tiers, and generates order confirmation IDs (`MS-XXXXXX`).
* **Wishlist Hydration**: Hydrates from `localStorage` key `mellosoft_wishlist`. Toggles items instantly and provides "Move All to Cart" bulk execution.
* **View Routing**: Client-side view switcher (`home`, `catalog`, `detail`, `cart`, `wishlist`, `search`, `profile`).

---

## 4. Admin Portal Architecture (`src/admin`)

### 1. Role-Based Access Control (RBAC) System
The admin system enforces fine-grained role-based permissions via `security.js` and `AdminContext.js`:

| Role | Role Color | Permissions Overview |
| :--- | :--- | :--- |
| **Super Admin** | `#7C3AED` (Purple) | Full system permissions (Manage Users, Roles, Products, Orders, Categories, Settings) |
| **Admin** | `#2563EB` (Blue) | Operational permissions (Manage Products, Orders, Customers, Reviews) |
| **Manager** | `#D97706` (Gold) | Catalog & Inventory moderation (Products, Categories, Inventory) |
| **Staff** | `#6B6B75` (Grey) | View-only access across core modules |

* **Header Role Indicator**: In `AdminHeader.jsx`, visible role text is omitted in favor of dynamic username text coloring matching the role's specified hex code.

### 2. Relational Single-Source-of-Truth Data Architecture
All admin entities are normalized and linked through relational IDs:

```
CUSTOMER (customerId)
   │
   ├── ORDERS (order.customerId === customer.id)
   │      │
   │      └── ORDER ITEMS
   │              │
   │              ├── PRODUCT (item.productId === product.id)
   │              └── VARIANT (item.variantSize, item.variantFirmness)
   │
   └── WISHLIST (wishlist.customerId === customer.id)
          │
          └── PRODUCT (wishlist.productId === product.id)
```

* **Dynamic Calculations**: `TOTAL ORDERS`, `TOTAL SPENT`, `AVERAGE ORDER VALUE`, `ITEMS PURCHASED`, and `LAST ORDER` are computed dynamically from actual relational orders.
* **Real-time Synchronization**: When an admin updates an order's **Payment Status** (`Pending`, `Paid`, `Failed`, `Refunded`) or **Order Status** (`Pending`, `Processing`, `Delivered`, `Cancelled`), the update immediately propagates across:
  1. Orders Page Table
  2. Order Details Modal
  3. Customer Profile Modal
  4. Customers Page Spending & Order Totals
  5. Dashboard Analytics & Recent Orders Cards
  6. Persistent `localStorage` store

---

## 5. Admin Features Detail

### Orders Management (`OrdersView.jsx`)
* **Table Layout**: Rebalanced columns (`ORDER ID | CUSTOMER | PRODUCTS | AMOUNT | PAYMENT | STATUS | DATE`) without an action column.
* **Clickable Rows**: Clicking anywhere on an order row opens the **Order Details Modal**.
* **Order Details Modal**:
  * Displays complete order details, customer contact info, shipping address, and product line items with thumbnails, variant size/firmness, unit prices, and subtotal.
  * Provides Payment Status & Order Status edit controls with role permission validation.

### Customers Management (`CustomersView.jsx`)
* **Table Layout**: `NAME | EMAIL | PHONE | ORDERS | SPENDING | STATUS` with dynamic order count and total spending calculated directly from `orders`.
* **Clickable Rows**: Clicking a customer row passes `selectedCustomerId` to open the **Customer Profile Modal**.
* **Customer Profile Modal**:
  * Customer Profile Header with avatar, contact info, status badge, registration date, and last login.
  * Overall Purchase Summary cards (Total Orders, Total Spent, Avg Order Value, Items Purchased, Last Order).
  * Purchase Insights (Most Purchased Product, Most Recent Product, Order Status Breakdown).
  * Order History listing with item breakdown.
  * Wishlist grid displaying real products from catalog or empty fallback message.

### Users & Roles Management (`UsersAndRolesView.jsx`)
* **Responsive User Layout**:
  * Desktop (`> 768px`): Clean data table layout.
  * Mobile (`<= 768px`): Converts rows into native responsive `.admin-user-card` components showing user avatar, name, phone, ellipsis email, role badge, status indicator, formatted dates, and action buttons.
* **Role Permissions Matrix**: Custom role builder allowing administrators to grant granular view/create/edit/delete access per system module (Dashboard, Products, Orders, Customers, Reviews, Users, Roles, Settings).

---

## 6. Design System & Responsive Guidelines

### Color System
* **Primary Navy**: `#1B1F8C`
* **Success Green**: `#16A34A` / `#DCFCE7`
* **Warning Gold**: `#D97706` / `#FEF3C7`
* **Danger Red**: `#DC2626` / `#FEE2E2`
* **Background Light**: `#FAFAF7` / `#F7F7F2`
* **Text Primary**: `#14151A`

### Mobile Breakpoints (`globals.css` & `admin-globals.css`)
* `<= 1024px`: Collapsible mobile sidebar overlay with toggle button.
* `<= 768px`: Desktop tables convert to touch-friendly card layouts. Full-width modals with zero horizontal scrollbars.

---

## 7. Development & Deployment

### Running Locally
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the Storefront or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Portal.
