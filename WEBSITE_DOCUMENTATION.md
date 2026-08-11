# Mellosoft Website (Storefront) Documentation

Welcome to the official developer and architecture documentation for the **Mellosoft** consumer storefront. This document provides a complete and up-to-date breakdown of the technology stack, directory structure, state management, components, views, utilities, and design system.

---

## 1. Technology Stack

| Technology | Version / Detail |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) `16.2.10` with App Router (`src/app`) |
| **UI Library** | [React](https://react.dev/) `19.2.4` |
| **React Compiler** | Enabled (`reactCompiler: true` in `next.config.mjs`) for automated compile-time performance optimization |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management** | React Context API (`StoreContext.js`) with synchronized `localStorage` persistence |
| **Styling** | Vanilla CSS (`src/app/globals.css`) combined with CSS-in-JS inline style objects in each component |
| **Routing** | View-based client-side routing driven by global React state (`view` field in `StoreContext`) |
| **Price Formatting** | Custom Indian Rupee (₹) utilities in `src/utils/currency.js` |
| **Product Variants** | Custom variant resolution helpers in `src/utils/variantHelpers.js` |

---

## 2. Directory & File Structure

```
frontend/
├── package.json                   # Dependencies & scripts
├── next.config.mjs                # Next.js config (React Compiler ON)
├── eslint.config.mjs              # ESLint rules
├── public/
│   ├── asset/                     # Product images (img1.jpg, img2.jpg, pillow.png, bedframe.png, texture.png, etc.)
│   └── favicon.ico                # Browser shortcut icon
└── src/
    ├── app/
    │   ├── layout.js              # Root layout — global metadata & StoreProvider wrapper
    │   ├── page.js                # Storefront entry — view router switching all 7 views
    │   ├── globals.css            # Global base styles, resets, shared utility classes
    │   └── page.module.css        # Scoped landing page styles (legacy, minimal usage)
    ├── components/                # Reusable storefront UI components
    │   ├── Header.jsx             # Sticky responsive navigation header (desktop + mobile)
    │   ├── Footer.jsx             # Multi-column footer with payment badges
    │   ├── ProductCard.jsx        # Product tile: image, rating, wishlist toggle, price
    │   ├── EmptyState.jsx         # Configurable empty/fallback message with action button
    │   ├── FirmnessSizeSelector.jsx # Toggle chip group for firmness/size selection
    │   ├── QuantityStepper.jsx    # +/– quantity counter with minimum boundary enforcement
    │   └── RatingStars.jsx        # Star icon builder from numeric rating values
    ├── context/
    │   └── StoreContext.js        # Central global state provider: cart, wishlist, navigation, filters
    ├── data/
    │   └── products.js            # MOCK_PRODUCTS array — master product catalog
    ├── utils/
    │   ├── currency.js            # formatPrice(), calculateDiscountedPrice(), getProductPrices()
    │   ├── variantHelpers.js      # generateVariantId(), reconcileVariants(), getVariantForSelection()
    │   ├── security.js            # hashPassword(), verifyPassword(), checkPermission() [used by admin]
    │   ├── rolesStore.js          # In-memory role/user CRUD store (server-side, admin auth)
    │   └── apiAuth.js             # verifyApiAuthAndPermission() — API route RBAC middleware
    └── views/                     # Full-page screen views (rendered by page.js)
        ├── HomeView.jsx           # Landing page: hero slider, categories, product rows, promos
        ├── CatalogView.jsx        # Filtered & sorted product collection grid
        ├── ProductDetailView.jsx  # Full product page: gallery, configurator, reviews, tabs
        ├── CartView.jsx           # Cart management, order summary, simulated checkout
        ├── WishlistView.jsx       # Saved favorites grid with bulk cart actions
        ├── SearchView.jsx         # Live search engine with results & quick-access chips
        └── ProfileView.jsx        # Sleep questionnaire, AI Sleep Advisor & order history
```

---

## 3. Global State Management (`StoreContext.js`)

All storefront state is centralized in a single React Context Provider. It hydrates from and persists to `localStorage` so state survives page refreshes.

### State Fields

| Field | Type | Default | Persisted | Description |
| :--- | :--- | :--- | :--- | :--- |
| `view` | String | `"home"` | No | Active view name |
| `selectedProductId` | String | `"classic-mattress"` | No | Product ID for `ProductDetailView` |
| `searchQuery` | String | `""` | No | Current search input value |
| `activeFilters` | Object | `{category:"All", firmness:"All", size:"All", sort:"Recommended"}` | No | Active filter state for `CatalogView` |
| `cart` | Array | `[]` | ✅ `mellosoft_cart` | Shopping cart items |
| `wishlist` | Array | `["luxe-hybrid"]` | ✅ `mellosoft_wishlist` | Saved product IDs |
| `products` | Array | `MOCK_PRODUCTS` | No | Full product catalog reference |

### Action Methods

| Method | Signature | Description |
| :--- | :--- | :--- |
| `navigateTo` | `(viewName, productId?)` | Scrolls to top and sets active view. Optionally sets `selectedProductId`. |
| `getProductById` | `(id)` | Finds and returns a product from the catalog by its ID. |
| `addToCart` | `(product, firmness, size, qty)` | Resolves the exact variant price using `getVariantForSelection()` + `calculateDiscountedPrice()`. Creates a unique cart item keyed by `{id}-{firmness}-{size}`. Increments quantity if duplicate. |
| `removeFromCart` | `(cartItemId)` | Removes a specific cart item by its composite key. |
| `updateQty` | `(cartItemId, newQty)` | Updates an item's quantity. Removes if `newQty <= 0`. |
| `clearCart` | `()` | Empties the entire cart array. |
| `toggleWishlist` | `(productId)` | Adds a product to the wishlist if not present; removes it if already saved. |
| `moveToCart` | `(productId, firmness, size)` | Resolves the product, falls back to first available firmness/size options, calls `addToCart`, then removes from wishlist. |

### localStorage Keys
* **`mellosoft_cart`** — Persists cart item array. Auto-hydrated on first client load.
* **`mellosoft_wishlist`** — Persists wishlist product ID array. Auto-hydrated on first client load.

---

## 4. Product Data Model (`data/products.js`)

The `MOCK_PRODUCTS` array is the master product catalog. Each product entry follows this schema:

```javascript
{
  id: "classic-mattress",           // Unique URL-safe identifier (slug)
  Product_Id: "PROD-001",           // Admin-facing product ID
  name: "Mellosoft Classic Mattress",
  tagline: "The perfect balance of pressure relief and deep support.",
  category: "mattress",            // "mattress" | "pillows" | "bed frames" | "protectors"
  badge: "Bestseller",             // "Bestseller" | "New" | "Premium" | "Eco-Friendly" | "Essential"
  price: 999,                      // Base display price
  Actual_Price: 999,               // Authoritative price for variant resolution
  discountPercent: 10,             // Discount % applied by calculateDiscountedPrice()
  rating: 4.8,
  reviewCount: 142,
  images: ["/asset/img1.jpg", "/asset/texture.png", "/asset/img2.jpg"],
  description: "...",
  specs: "10\" Height • 3 Foam Layers • Cool-to-the-touch Cover",
  features: ["...", "...", "..."],
  firmnessOptions: ["Soft", "Medium", "Firm"],
  sizeOptions: ["Twin", "Full", "Queen", "King"],
  sizePrices: { Twin: 699, Full: 799, Queen: 899, King: 1099 },
  firmnessPrices: { Soft: 699, Medium: 799, Firm: 899 },
  variants: [
    { Variant_Id: "VAR-TWIN-SOFT", SKU: "MEL-TWIN-SOFT", Size: "Twin", Firmness: "Soft",
      Actual_Price: 699, Stock: 10, Threshold: 2, Status: "Active" },
    // ... all Size × Firmness combinations
  ],
  reviews: [
    { id: "r1", author: "Helen M.", rating: 5, date: "Yesterday",
      content: "...", helpfulCount: 42, replyCount: 0 },
    // ...
  ],
  discussion: [
    { id: "q1", author: "...", question: "...", answer: "..." }
  ]
}
```

**Product Categories in Catalog:**
* `mattress` — Main product range (Memory Foam, Hybrid, Latex, Firm, Cooling)
* `pillows` — Luxury down, memory foam, and cooling pillows
* `bed frames` — Minimal and platform bed frame designs
* `protectors` — Organic cotton and waterproof mattress protectors

---

## 5. Utility Functions

### `currency.js`
| Function | Signature | Description |
| :--- | :--- | :--- |
| `formatPrice` | `(amount) → String` | Formats a number to Indian Rupee string: `899` → `"₹899"`, `1099` → `"₹1,099"`. |
| `calculateDiscountedPrice` | `(actualPrice, discountPercent) → Number` | Computes discounted price: `(price * (1 - discount/100))`, rounded to 2 decimal places. |
| `getProductPrices` | `(product, selectedSize?) → {actualPrice, discountPercent, discountedPrice}` | Resolves the display price triplet for any product given an optional selected size. |

### `variantHelpers.js`
| Function | Signature | Description |
| :--- | :--- | :--- |
| `generateVariantId` | `(size, firmness) → String` | Generates `VAR-QUEEN-MEDIUM` style IDs. |
| `generateSKU` | `(productCode, size, firmness) → String` | Generates `MEL-QUEEN-MEDIUM` style SKUs. |
| `reconcileVariants` | `(sizes, firmnessList, existingVariants, basePrice, ...)` | Reconciles an existing variant list against size × firmness matrix, preserving existing data and filling gaps with defaults. |
| `buildVariants` | `(sizes, firmnessList, existingVariants, ...)` | Alias for `reconcileVariants` with additional `variantOverrides` map support. |
| `getVariantForSelection` | `(product, selectedSize, selectedFirmness) → variant\|null` | Finds the exact matching variant from a product's `variants[]` array. Falls back to size-only match. |

### `security.js` _(Admin — also exported from src/utils)_
| Function | Description |
| :--- | :--- |
| `hashPassword(password, salt)` | SHA-256 HMAC hash in Node.js, or a JS djb2-based fallback in browser environments. |
| `verifyPassword(password, storedHash)` | Direct match, hash match, or Node crypto verification. |
| `checkPermission(role, moduleName, action)` | Returns `true` if `role.permissions[moduleName]` includes `action`. |

### `rolesStore.js` _(Admin — server-side in-memory store)_
Provides CRUD operations for the in-memory `activeRoles` and `activeUsers` arrays that seed from `rolesData.js` and `usersData.js`:
* `getStoredRoles()`, `getStoredRoleById()`, `updateStoredRole()`, `createStoredRole()`, `deleteStoredRole()`
* `getStoredUsers()`, `getStoredUserById()`, `updateStoredUser()`, `createStoredUser()`, `deleteStoredUser()`

### `apiAuth.js` _(Admin — API middleware)_
`verifyApiAuthAndPermission(request, moduleName, actionName)` — Reads `authorization` / `x-session-token` / `x-user-id` headers, resolves the user from the role store, checks active status, and validates the required permission. Returns `{ authorized: true, user, role }` or a `NextResponse` error object.

---

## 6. Views In Detail

### 1. Home View (`HomeView.jsx`)

**Purpose**: Primary landing page and discovery hub.

**Sections:**
* **Hero Peek Slider** — A horizontally scrollable slider of up to 5 featured mattresses. Each slide shows:
  * Category badge (e.g., `"Limited time!"`, `"Best seller"`)
  * Custom headline (e.g., `"Classic Comfort"`, `"Hybrid Luxury"`)
  * Deal label linking to the product
  * Dot navigation indicators synced to scroll position via `handleSliderScroll`
* **Shop by Category Grid** — Six interactive chip cards (`Memory Foam`, `Hybrid`, `Firm`, `Pillows`, `Bed Frames`, `Protectors`), each calling `goToCatalog(category, firmness)` to pre-filter the catalog.
* **Featured Mattresses Row** — First 4 mattress products (standard `ProductCard` grid).
* **Promo Interstitials** — Two full-width promotional callout banners (e.g., `"60% off mattresses"`, `"30% off pillows & protectors"`).
* **Best Sellers Row** — Products sorted by `reviewCount` descending, first 8 results.
* **New Arrivals Row** — Products filtered by badges `["New", "Premium", "Eco-Friendly", "Essential"]`, first 4.
* **About Block** — Brand positioning section with asymmetric image layout.

**State interactions:**
* Uses `useMemo` to memoize `mattresses`, `heroSlides`, `featuredMattresses`, `bestSellers`, `newArrivals` — all derived from `MOCK_PRODUCTS`.
* Calls `setActiveFilters` + `navigateTo("catalog")` for category navigation.
* Calls `navigateTo("detail", productId)` for product navigation.

---

### 2. Catalog View (`CatalogView.jsx`)

**Purpose**: Filtered and sorted product collection grid.

**Render Logic:**
* Reads `searchQuery` and `activeFilters` from context.
* Filters `MOCK_PRODUCTS` through a 4-step pipeline:
  1. **Search Query** — Matches `name`, `tagline`, and `category` (case-insensitive).
  2. **Category** — Exact category match (or `"All"` to skip).
  3. **Firmness** — Checks `product.firmnessOptions.includes(filter.firmness)`.
  4. **Size** — Checks `product.sizeOptions.includes(filter.size)`.
* Sorts using `activeFilters.sort`:
  * `"Price: Low to High"` / `"Price: High to Low"` — by `price`.
  * `"Rating"` — by `rating` descending.
  * `"Recommended"` — original catalog order (no sort).
* Renders a responsive product grid via `ProductCard`.
* Shows `EmptyState` fallback with "Reset Filters" action if no products match.

> **Architecture Note:** Filter controls are set externally (via `Header`, `HomeView`, or `SearchView`). The catalog page does not render its own filter UI — all filtering is driven by shared global state.

---

### 3. Product Detail View (`ProductDetailView.jsx`)

**Purpose**: Complete single-product page with configuration and purchase options.

**Sub-sections:**

#### Image Gallery
* Multi-image carousel with thumbnail strip.
* Touch swipe support (`onTouchStart` / `onTouchEnd`) for mobile.
* Full-screen overlay viewer on image click.
* Active image index tracks via `activeImgIndex` state.

#### Product Configurator
* **Size Selector** (`FirmnessSizeSelector`) — Renders size chips (`Twin`, `Full`, `Queen`, `King`) from `product.sizeOptions`.
* **Firmness Selector** — Renders firmness chips from `product.firmnessOptions`.
* **Variant Price Resolution** — On each size/firmness change, `getVariantForSelection()` finds the exact `variants[]` entry. Falls back to `firmnessPrices[firmness]` → `sizePrices[size]` → `Actual_Price` in order.
* **Price Display** — Shows both struck-through `actualPriceForSize` and discounted price `discountedPriceForSize` (via `calculateDiscountedPrice()`).
* **Quantity Stepper** — `QuantityStepper` component bound to `quantity` state.
* **Add to Cart / Buy Now** — Calls `addToCart(product, firmness, size, qty)`. "Buy Now" also calls `navigateTo("cart")`.
* **Wishlist Toggle** — Heart icon reads `wishlist.includes(product.id)` to toggle fill state.

#### Information Tabs
* **Details** — Specification list (`product.specs`, `product.features`), engineering highlights.
* **Reviews** — Aggregated star rating bar chart (5★–1★ percentages), followed by individual review cards with helpful counts and reply counts.
* **Discussion** — Customer Q&A pairs rendered from `product.discussion`.

#### Recommendations
* Three `ProductCard` components from related products (same category, excluding the current product).

**Key `useMemo` derivations:**
* `selectedVariant` — result of `getVariantForSelection(product, selectedSize, selectedFirmness)`
* `actualPriceForSize` — variant → firmnessPrices → sizePrices → Actual_Price fallback chain
* `discountedPriceForSize` — `calculateDiscountedPrice(actualPriceForSize, discountPercent)`

---

### 4. Cart View (`CartView.jsx`)

**Purpose**: Shopping cart manager with simulated checkout flow.

**States:** `checkoutStep` (`"cart"` | `"success"`), `orderNumber`.

**Cart Screen:**
* Lists all cart items with: product image, name, tagline, firmness + size config chips, unit price, and `QuantityStepper`.
* Each item has a Remove (×) button calling `removeFromCart(cartItemId)`.
* **Order Summary Panel:**
  * Subtotal: `cart.reduce((acc, item) => acc + item.price * item.qty, 0)`
  * Delivery: `₹30` flat, or free if subtotal `> ₹150`
  * Total = Subtotal + Delivery
* **Checkout Button** → calls `handleCheckout()`:
  1. Generates order number: `MS-${random 6 digits}`
  2. Sets `checkoutStep = "success"` and calls `clearCart()`

**Success Screen:**
* Displays order confirmation with generated Order ID.
* Shows a randomly selected "Sleep Tip of the Day" from 4 built-in tips.
* "Return to Home" button calls `navigateTo("home")`.

**Empty State:** Renders `EmptyState` with cart icon and "Explore Collections" CTA if cart is empty.

---

### 5. Wishlist View (`WishlistView.jsx`)

**Purpose**: Saved favorites grid with bulk management controls.

**Features:**
* Resolves wishlist product IDs → full product objects via `getProductById`.
* **Bulk Controls:**
  * "Clear Wishlist" — calls `toggleWishlist` for every saved product ID.
  * "Move All to Cart" — calls `moveToCart` for each wishlist item (using defaults: `Medium` firmness, `Queen` size).
* **Per-Card Actions:**
  * "Move to Cart" — `moveToCart(productId)`
  * "Remove" (heart icon) — `toggleWishlist(productId)`
* Renders `EmptyState` with "Explore Products" CTA if wishlist is empty.

---

### 6. Search View (`SearchView.jsx`)

**Purpose**: Live product discovery search engine.

**Features:**
* Auto-focused search input connected to global `searchQuery` state.
* **Live Results**: Filters `MOCK_PRODUCTS` by `name`, `tagline`, `category`, `badge`, and `specs` on every keystroke (via `useMemo`).
* **Recent Search Chips**: Static shortcut terms (`"Classic Mattress"`, `"Cooling"`, `"Luxe Hybrid"`, `"Pillow"`, `"Protector"`) — clicking sets `searchQuery`.
* **Quick-Access Discovery Cards**: "Browse Mattresses" and "Shop Pillows" cards visible when no query is entered.
* **Empty Result State**: Custom `EmptyState` with "Clear Search" action when no products match.

---

### 7. Profile View (`ProfileView.jsx`)

**Purpose**: Personal sleep preference editor and order history viewer.

**Features:**
* **Profile Header**: Displays user avatar (`G`), name (`Gowtham`), membership since year, and "8-Night Perfect Sleep Streak" badge.
* **Sleep Profile Questionnaire:**
  * `sleepPos` state: `"Side"` | `"Back"` | `"Stomach"` | `"Combination"`
  * `preferredTemp` state: `"Cool"` | `"Neutral"` | `"Warm"`
  * "Save Preferences" button shows a `"Saved!"` confirmation for 3 seconds.
* **AI Sleep Advisor:** Dynamic recommendation panel using `sleepPos` and `preferredTemp` values to display a personalized mattress configuration tip.
* **Order History:** Two mock delivered orders (rendered from local `mockOrders` array):
  * `MS-84912` — Mellosoft Classic Mattress (Queen, Medium) + Organic Protector — ₹968
  * `MS-38291` — Luxury Down Pillow × 2 (Soft) — ₹178

> **Architecture Note:** `ProfileView` is a registered route in `page.js` but is currently an **orphaned view** — no navigation links in `Header`, `Footer`, or any other view point to it. It is accessible only by programmatically setting the context `view` state to `"profile"` (e.g., from DevTools or test code).

---

## 7. Components

### `Header.jsx`
| Layout | Details |
| :--- | :--- |
| **Desktop** | Sticky blurred backdrop header with: Mellosoft logo, navigation links (`Mattresses`, `Pillows`, `Bed Frames`, `Protectors`), integrated live search input with product suggestion dropdown, and Cart (with count badge) + Wishlist (with count badge) icon buttons. |
| **Mobile** | Fixed top bar. Logo shown only when not in a nested view and search is not active. Hamburger menu triggers a slide-down panel with category links. Mobile search input expands to replace the logo when focused. |

**Key state:**
* `desktopSearch` / `mobileSearch` — Separate local inputs to prevent cross-interference.
* `desktopSuggestions` / `mobileSuggestions` — Real-time results from `searchProducts(term)`, filtered to 5 results.
* `mobileMenuOpen` — Controls the mobile dropdown visibility.
* `isNestedMobileView` — `view !== "home"` — hides the logo in sub-pages on mobile.
* `isDetailView` — Removes padding-top from `body` on mobile for product detail full-bleed hero.

---

### `Footer.jsx`
* **Responsive three-column link grid**: Shop, Company, Support.
* **Payment Badges**: Visa, Mastercard, Amex, Apple Pay, Shop Pay icons.
* **Dynamic Copyright Year**: `new Date().getFullYear()`.

---

### `ProductCard.jsx`
* Renders: product image, category tag chip, `RatingStars` overlay with review count, product name, base price + discounted price, and a Wishlist heart toggle button.
* On card click: `navigateTo("detail", product.id)`.
* On heart click: `toggleWishlist(product.id)` (event propagation stopped).
* Reads `wishlist` from context to determine filled/unfilled heart state.

---

### `EmptyState.jsx`
Configurable fallback message component:
```jsx
<EmptyState
  iconType="cart" | "wishlist" | "search" | "orders"
  title="Your cart is empty"
  message="..."
  actionLabel="Explore Collections"
  onAction={() => navigateTo("catalog")}
/>
```

---

### `FirmnessSizeSelector.jsx`
Chip group for selection inputs (firmness or size):
```jsx
<FirmnessSizeSelector
  label="Size"
  options={["Twin", "Full", "Queen", "King"]}
  selected={selectedSize}
  onChange={setSelectedSize}
/>
```

---

### `QuantityStepper.jsx`
`+` / `–` counter button pair with configurable `min` (default: 1) and `max` boundaries.

---

### `RatingStars.jsx`
Renders filled/half/empty star SVG icons based on a numeric rating (e.g., `4.8`).

---

## 8. Design System & Aesthetics

### Color Palette

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Navy** | `#1B1F8C` | Brand typography, headings, CTAs, icon strokes |
| **Accent Green** | `#16A34A` | Rating stars, checkout badges, success messages |
| **Success Light** | `#DCFCE7` | Success background chips |
| **Background Cream** | `#F7F7F2` | Page background, inputs, tab strips |
| **Background Alt** | `#FAFAF7` | Card interiors, panel backgrounds |
| **Text Dark** | `#14151A` | Primary body text |
| **Text Gray** | `#6B6B75` | Descriptions, specs, secondary labels |
| **Border Light** | `#E7E7E2` | Card dividers, grid separators |
| **White** | `#FFFFFF` | Cards, header backdrop, panels |

### Typography
* **Headings**: `font-weight: 700–800`, tight `letter-spacing: -0.01em` to `-0.02em`.
* **Labels/Tags**: `text-transform: uppercase`, `letter-spacing: 0.05em–0.08em`.
* **Responsive Scaling**: `font-size: clamp(...)` rules for fluid desktop → mobile type ramp.

### Border Radius Philosophy
* **`0px` (Sharp/Architectural)**: Main content cards, headers, image frames, checkout panels — projects premium block aesthetic.
* **Rounded (`12px–999px`)**: Small interactive elements — wishlist buttons, category chips, quantity steppers, search bars, badge pills.

### Shadows & Depth
* Multi-layer `box-shadow` with soft blur creates elevation on active/hovered cards.
* Hover states use `transform: translateY(-2px)` + shadow intensification.

### Micro-Animations
* Cart/wishlist badge count bounce on increment.
* Image gallery slides with `scroll-behavior: smooth`.
* Category cards use `transition: transform 0.2s ease, box-shadow 0.2s ease`.
* Checkout success screen fade-in sequence.

---

## 9. Responsive Design

| Breakpoint | Behavior |
| :--- | :--- |
| `> 768px` | Desktop layout — header with nav links, product grids 3–4 columns, side-by-side cart |
| `<= 768px` | Mobile layout — fixed header with hamburger, single-column grids, stacked cart items |
| `<= 480px` | Compact mobile — hero slider full-width, tighter padding, 2-column category grid |

The mobile header applies `paddingTop: "60px"` to `document.body` dynamically to account for the fixed header, except on `ProductDetailView` where it is removed to allow full-bleed hero images.

---

## 10. Developer Notes & Roadmap

### Current Limitations
1. **ProfileView is an Orphan Route** — No navigation entry points exist in `Header`, `Footer`, or any other view. The route is accessible only via direct programmatic state manipulation.
2. **No Filter UI in CatalogView** — All filter state is set externally. The catalog page renders no visible filter controls (dropdowns, checkboxes, sliders).
3. **Mock Order History** — `ProfileView` renders a static, hardcoded `mockOrders` array. It is not connected to the cart checkout flow or the admin order database.
4. **Static Search Recents** — "Recent Searches" in `SearchView` are hardcoded strings, not persisted or dynamically built from actual past searches.
5. **Simulated Checkout** — `CartView` generates a random order number on checkout but does not persist the order or submit to any backend.
6. **Admin Cart is Separate from Storefront Cart** — The admin Customer Profile's Cart section reads from `AdminContext.carts` (`mellosoft_admin_carts` in localStorage), which is seeded from `MOCK_CARTS`. It is not connected to the storefront's `mellosoft_cart` key because the storefront cart is anonymous (session-based) and not associated with a `customerId`.

### Recommended Improvements
1. **Add Profile Navigation** — Add a profile icon/link in `Header` (desktop & mobile) and `Footer` to expose `ProfileView` as a reachable route.
2. **Catalog Filter UI** — Implement in-page filter controls (dropdowns or checkbox panels) inside `CatalogView` for firmness, size, and sort.
3. **Connect Profile Orders to Cart Checkout** — Persist orders placed in `CartView` (using `AdminContext` or a shared order store) and display them in `ProfileView`.
4. **URL-Based Routing** — Migrate the `view` state router to native Next.js App Router file-system routes for browser back-button support and deep linking.
5. **Real Backend** — Replace `localStorage` state and `MOCK_PRODUCTS` with API calls to a database (PostgreSQL, MongoDB, or Supabase) for real-time inventory, authentication, and order management.
6. **Persist Recent Searches** — Store search history to `localStorage` and render dynamically in `SearchView`.
7. **Link Storefront Cart to Customer Identity** — When a real authentication system is added, associate `mellosoft_cart` with the logged-in customer's `customerId` so the Admin Customer Profile Cart reads live storefront cart data in real time.

---

## 11. Admin Portal Reference

This document covers the **consumer storefront** only. The admin portal has its own dedicated documentation:

> 📄 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** — Full admin portal architecture, RBAC system, relational data models (Orders, Carts, Wishlists, Customers), and feature detail for every admin management view.

### Admin Customer Profile — Cart Section Summary

The Customer Profile modal in **Admin → Customers** includes a dedicated **Cart** section added after Order History:

| Element | Detail |
| :--- | :--- |
| **Heading** | `🛒 Cart (N)` — N = number of unique cart item entries |
| **Item card** | Product image, name, variant chips (Size / Firmness / SKU), pricing row (actual → discounted + % badge), qty, item total |
| **Stock status** | "Low Stock" (gold badge) or "Out of Stock" (red badge) shown inline |
| **Cart Subtotal** | `Σ discountedPrice × qty` displayed in navy at section bottom |
| **Empty state** | ShoppingCart icon + "No items currently in this customer's cart." |
| **Mode** | Read-only — admin cannot modify customer carts from this view |
| **Data source** | `AdminContext.carts` → `MOCK_CARTS` → `mellosoft_admin_carts` localStorage |
| **Price formula** | `calculateDiscountedPrice(actualPrice, discountPercent)` — same function used by storefront |

