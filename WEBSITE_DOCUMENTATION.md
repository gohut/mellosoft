# Mellosoft Website Documentation

Welcome to the official developer and architecture documentation for the **Mellosoft** frontend website. This document provides a complete breakdown of the technology stack, site architecture, state management, components, views, and styling design system.

---

## 1. Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (Version `16.2.10`)
*   **Library**: [React](https://react.dev/) (Version `19.2.4`)
*   **React Compiler**: Enabled (`reactCompiler: true` in `next.config.mjs`) for automated compile-time performance optimizations.
*   **State Management**: React Context API (`StoreContext.js`) with synchronized local storage persistence.
*   **Styling**: Pure CSS-in-JS (inline JavaScript style objects) paired with scoped/global HTML styling via `<style jsx>` for micro-interactions and media queries.
*   **Routing**: View-based client-side routing (driven by global React state).

---

## 2. Directory & File Structure

```
Mellosoft/
└── mellosoft/
    ├── README.md                 # Basic repository indicator
    ├── WEBSITE_DOCUMENTATION.md  # This documentation file
    └── frontend/                 # Next.js frontend project
        ├── package.json          # Dependencies & scripts
        ├── next.config.mjs       # Next.js config (React Compiler enabled)
        ├── eslint.config.mjs     # ESLint rules & ignoring rules
        ├── public/
        │   ├── asset/            # Image resources (logo, mattresses, texture)
        │   └── favicon.ico       # Browser shortcut icon
        └── src/
            ├── app/
            │   ├── layout.js     # Global metadata & StoreProvider wrapper
            │   ├── page.js       # App entry point & client-side view routing
            │   ├── globals.css   # Base document styling rules
            │   └── page.module.css # Scoped landing styles
            ├── components/       # Reusable user interface components
            │   ├── Header.jsx    # Sticky responsive navigation header
            │   ├── Footer.jsx    # Global footer with categoric navigation & payment details
            │   ├── ProductCard.jsx # Premium product presentation card
            │   ├── EmptyState.jsx # Fallback messages with action hooks
            │   ├── FirmnessSizeSelector.jsx # Selection chips wrapper
            │   ├── QuantityStepper.jsx # Item counter with minimum boundary locks
            │   └── RatingStars.jsx # Star visual builder with review aggregates
            ├── context/
            │   └── StoreContext.js # Global state, actions, and LocalStorage sync
            ├── data/
            │   └── products.js   # Mock product database
            ├── utils/
            │   └── currency.js   # Indian Rupee (₹) price formatting utilities
            └── views/            # Screen views rendered dynamically
                ├── HomeView.jsx  # Main landing view
                ├── CatalogView.jsx # Product collections grid
                ├── ProductDetailView.jsx # Product layout config & information tabs
                ├── CartView.jsx  # Shopping cart list & checkout flow simulator
                ├── WishlistView.jsx # Wishlisted products manager with bulk actions
                ├── SearchView.jsx # Discovery search engine
                └── ProfileView.jsx # Sleep preference editor & mock order history
```

---

## 3. Data & State Management

### Global Context Provider (`StoreContext.js`)
All primary states are stored in a centralized React context to facilitate reactive state sharing between components and views:

*   **State Fields**:
    *   `view` (String): The active view name (`home`, `catalog`, `detail`, `cart`, `wishlist`, `search`, `profile`).
    *   `selectedProductId` (String): ID of the product currently loaded in `ProductDetailView` (defaults to `"classic-mattress"`).
    *   `searchQuery` (String): Current search input query.
    *   `activeFilters` (Object): Filter variables (`category`, `firmness`, `size`, `sort`).
    *   `cart` (Array): Shopping items. Hydrates from local storage (`mellosoft_cart`).
    *   `wishlist` (Array): Saved product ID array. Hydrates from local storage (`mellosoft_wishlist`).

*   **Key Action Methods**:
    *   `navigateTo(viewName, [productId])`: Smooth scrolls the window to the top and navigates to the specified view. Sets the selected product if provided.
    *   `addToCart(product, firmness, size, qty)`: Bundles configured products into unique cart items (`id-firmness-size`), dynamically calculates size-specific prices, and updates quantities for existing matches.
    *   `removeFromCart(cartItemId)`: Deletes configurations from the cart.
    *   `updateQty(cartItemId, newQty)`: Updates item quantity (removes the item if quantity drops to `0`).
    *   `clearCart()`: Empties cart state.
    *   `toggleWishlist(productId)`: Toggles saving a product.
    *   `moveToCart(productId, firmness, size)`: Pushes a wishlisted item to the cart using specified or default parameters and automatically removes it from the wishlist.

### Price Utility (`utils/currency.js`)
All prices are formatted using Indian Rupee localized formatting:
*   **Code**: `return \`₹\${Number(amount).toLocaleString("en-IN")}\`;`
*   **Effect**: A base price of `899` translates visually to `₹899`, and `1099` formats correctly to `₹1,099`.

---

## 4. Architectural Pages & Views Detail

### 1. Home View (`HomeView.jsx`)
*   **Hero Peek Slider**: Slides through up to 5 featured mattresses with deal indicators, custom titles, and click-to-shop action hooks.
*   **Shop by Category**: Large interactive chips (Memory Foam, Hybrid, Firm, Pillows, Bed Frames, Protectors) setting catalog filters and navigating users to the catalog.
*   **Dynamic Product Rows**: Interleaved rows displaying "Featured Mattresses", "Best Sellers" (sorted by review count), "New Arrivals" (based on badges), and "Top Rated" (sorted by rating).
*   **Interstitial Promo Cards**: Prominent callouts highlighting special discounts (60% off mattresses, 30% off pillows/protectors, free bed frame assembly) that direct to related collections.
*   **About Block**: Meticulous brand statement displaying asymmetrical image grids.

### 2. Catalog View (`CatalogView.jsx`)
*   **Render Logic**: Loads products from `products.js` filtered programmatically based on `activeFilters` (category, firmness, size) and `searchQuery`.
*   **Sorting**: Programmatically orders products by "Price: Low to High", "Price: High to Low", "Rating", or "Recommended" (original list order).
*   *Architecture Note*: In the current implementation, filter variables are set via external triggers (like the header or search pages). The catalog layout does not render visible manual filter buttons or sort selectors on the page; filtering and sorting are controlled programmatically by state configuration.
*   **Empty state handler**: Renders a custom search retry box if no products match selected filter sets.

### 3. Product Detail View (`ProductDetailView.jsx`)
*   **Image Gallery Carousel**: Large active frame with thumbnail buttons supporting custom touch swiping triggers (`onTouchStart`/`onTouchEnd`) and full-screen preview overlays.
*   **Product Settings Configurator**:
    *   Dynamic size selector that changes prices based on standard sizing arrays (`Twin`, `Full`, `Queen`, `King`).
    *   Firmness toggles (`Soft`, `Medium`, `Firm`).
    *   Integrated quantity stepper and direct checkout triggers ("Add to Cart", "Buy Now").
*   **Information Tabs**:
    *   **Details**: Specification lists and engineering highlights.
    *   **Customer Reviews**: Dynamic ratings overview display showing percentages of 5-star down to 1-star reviews paired with user reviews lists.
    *   **Discussion**: Customer Q&A block.
*   **Recommendations**: Displays a three-column carousel showing alternative products.

### 4. Cart View (`CartView.jsx`)
*   **Cart Items**: Displays line items with configurations (firmness, size, and individual price vs. combined subtotal), and supports removal or direct quantity updates.
*   **Summary Panel**: Calculates subtotal, applies free shipping on orders over `₹150` (otherwise `₹30` flat rate), and showcases a simulated secure checkout process.
*   **Checkout Success Screen**: Clears global cart data, generates a randomized order identifier (`MS-XXXXXX`), and displays a randomized "Sleep Tip of the Day" to provide user delight.

### 5. Wishlist View (`WishlistView.jsx`)
*   **Grid layout**: Showcases user-favorited products.
*   **Bulk Controls**: "Clear Wishlist" and "Move All to Cart" buttons to speed up shopping actions.
*   **Quick Card Actions**: Move individual items directly into the cart or remove them from favorites.

### 6. Search View (`SearchView.jsx`)
*   **Live Input Bar**: Large auto-focus search field returning matching results across names, taglines, categories, badges, and technical specs.
*   **Recent Search Chips**: Clickable history tags (e.g., "Classic Mattress", "Cooling", "Luxe Hybrid") to re-trigger frequent searches.
*   **Shortcut Discovery Cards**: Visible links helping users browse mattresses or pillows quickly if they haven't typed a query yet.

### 7. Profile View (`ProfileView.jsx`)
*   **Sleep Profile Questionnaire**: Interactive selectors for preferred sleep positions (Side, Back, Stomach, Combination) and temperatures (Cool, Neutral, Warm).
*   **AI Sleep Advisor**: Dynamic logic displaying personalized sleep tips and mattress configurations based on active questionnaire values.
*   **Order History**: Mock display of past delivered items (ordered by user "Gowtham" under membership number `MS-XXXXX`).
*   *Architecture Note*: This view is integrated in `page.js` view routing but is currently an **orphaned route** — there are no navigation links pointing to the profile in the desktop header, mobile header, or footer. It is accessible for testing by manually forcing the context view state to `"profile"`.

---

## 5. Components

### `Header.jsx`
*   **Desktop layout**: Sticky, blurred backdrop containing logos, shopping navigation links, integrated live search input, and cart/wishlist badge counts.
*   **Mobile layout**: Fixed top header which replaces text links with a slide-down mobile menu selector containing categories.

### `Footer.jsx`
*   Responsive multi-column link grid (Shop, Company, Support) showcasing payment support badges (Visa, Mastercard, Amex, Apple Pay, Shop Pay) and a dynamic copyright year builder.

### `ProductCard.jsx`
*   Features a category tag, rating overlay, title, base price, and instant wishlist addition button. Navigates to product detail pages on click.

### `EmptyState.jsx`, `FirmnessSizeSelector.jsx`, `QuantityStepper.jsx`, `RatingStars.jsx`
*   Standard UI widgets built with semantic elements, custom controls, and ARIA labels.

---

## 6. Design System & Aesthetics

### Visual Color Palette
The brand colors evoke relaxation, quality, and a luxury feel:

| Color Token | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Primary Navy** | `#1B1F8C` | Brand typography, prominent headings, main action buttons |
| **Accent Green** | `#16A34A` | Success messages, checkout badges, ratings stars, trial taglines |
| **Background Cream** | `#F7F7F2` | Page background, inputs, search boxes, details tab strips |
| **Text Dark** | `#14151A` | Main page typography |
| **Text Gray** | `#6B6B75` | Product specs, secondary labels, description text |
| **Border Light** | `#E7E7E2` | Thin grid boundaries, line separators |
| **White** | `#FFFFFF` | Cards, header backdrops, promo sections |

### Typography
*   **Headings**: Bold/Extra-Bold weights (700-800) with compact letter-spacing.
*   **Responsive Scaling**: Fluid typography scales using CSS `clamp()` rules for clean resizing across viewports.
*   **Labels**: Upper-case styling with expanded letter-spacing (`0.05em` to `0.08em`).

### Borders and Spacing
*   **Sharp Edges (`0px` border-radius)**: Main content cards, headers, checkout panels, and image frames are set to zero border-radius for a premium, architectural block aesthetic.
*   **Rounded Badges/Buttons**: Small active elements (wishlist icons, category selectors, quantities, search bars) use rounded styling (`12px`, `24px`, `999px`) to emphasize touch-friendly interactiveness.
*   **Shadows**: Multi-layered, soft blur filters create depth under active items.

---

## 7. Developer Guidelines & Roadmap

### Recommended Improvements
1.  **Add Profile Navigation**: Integrate a profile icon or link in the `Header` or `Footer` to expose the built-in `ProfileView`.
2.  **Add Filter Controls inside Catalog**: Build standard dropdown selectors or checkbox lists inside `CatalogView.jsx` to let users adjust firmness, sizes, and sorting configurations directly on the catalog page.
3.  **URL-Based Routing**: Migrate the view-based custom routing (`navigateTo` states) to native Next.js file-system routing (App Router directories) to enable browser back-button navigation and direct links for search engine indexing (SEO optimization).
4.  **Backend Hook-ups**: Swap the localized localStorage mock state loops with API endpoint calls targeting database models (e.g., PostgreSQL or MongoDB) for actual user profiles and shopping carts.
