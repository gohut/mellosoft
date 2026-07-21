# Mellosoft Frontend Website Documentation

## Overview
Mellosoft is a premium sleep products e-commerce website built with Next.js. The website showcases and sells mattresses, pillows, bed frames, protectors, and bundles with a focus on luxury, comfort, and quality sleep products.

---

## Website Structure

### Technology Stack
- **Framework**: Next.js (React-based)
- **Styling**: Inline JavaScript objects with CSS-in-JS approach
- **State Management**: React Context API (StoreContext)
- **Navigation**: View-based routing system
- **Responsive Design**: Mobile-first with desktop adaptations

---

## Pages & Views

### 1. Home Page (`HomeView.jsx`)
**Purpose**: Main landing page introducing the brand and products

**Sections**:
- **Hero Section**: Large wordmark branding, tagline, product showcase image, and action tiles for quick navigation
- **Why Mellosoft Features**: Three feature blocks highlighting:
  - 100-Night Trial
  - Free Premium Delivery
  - 10-Year Warranty
- **About Section**: Brand story with asymmetrical image tiles and company philosophy
- **Fresh Collection**: Dark navy section showcasing featured products (first 3 products)
- **Testimonials Strip**: Customer reviews with 5-star ratings and testimonials

**Key Features**:
- Responsive grid layouts
- Interactive action tiles for category navigation
- Product card integration
- Smooth scroll navigation to sections

---

### 2. Catalog Page (`CatalogView.jsx`)
**Purpose**: Browse and filter all available products

**Sections**:
- **Banner**: Collection header with description
- **Filter Bar**: Multi-filter system with:
  - Category selector (All, Mattresses, Pillows, Bed Frames, Protectors, Bundles)
  - Firmness filter (All, Soft, Medium, Firm)
  - Size filter (All, Twin, Full, Queen, King)
  - Sort options (Recommended, Price Low-High, Price High-Low, Rating)
- **Product Grid**: Responsive grid of filtered products
- **Empty State**: Displayed when no products match filters

**Key Features**:
- Real-time filtering and sorting
- Search query integration
- Reset filters functionality
- Search status summary
- Empty state with action buttons

---

### 3. Product Detail Page (`ProductDetailView.jsx`)
**Purpose**: Comprehensive product information and purchase configuration

**Sections**:
- **Breadcrumb Navigation**: Home > Catalog > Product Name
- **Image Gallery**: Main product image with thumbnail strip for multiple views
- **Product Configuration**:
  - Brand label and product name
  - Rating summary with star display
  - Dynamic pricing (varies by size)
  - Product description
  - Firmness selector
  - Size selector
  - Quantity stepper
  - Add to Cart / Buy Now buttons
  - Wishlist toggle button
  - Delivery information box
- **Tabbed Information**:
  - **Product Details**: Engineering specifications and features list
  - **Customer Reviews**: Review list with rating breakdown panel
  - **Q&A**: Product questions and answers section
- **Recommendations**: "You may also like" product carousel

**Key Features**:
- Multi-image gallery with thumbnail navigation
- Dynamic pricing based on size selection
- Comprehensive review system with rating breakdown
- Sticky order summary panel
- Product recommendations
- Tab-based content organization

---

### 4. Cart Page (`CartView.jsx`)
**Purpose**: Shopping cart management and checkout

**Sections**:
- **Cart Items List**: Each item displays:
  - Product image
  - Product name
  - Selected firmness and size
  - Quantity stepper
  - Individual and total price
  - Remove button
- **Order Summary Panel**:
  - Subtotal calculation
  - Delivery fee (free over $150)
  - Total amount
  - Checkout button
  - Security guarantee text
- **Checkout Success Screen**:
  - Order confirmation with order ID
  - Sleep tip of the day
  - Return to home button

**Key Features**:
- Quantity modification
- Item removal
- Dynamic delivery fee calculation
- Mock checkout process
- Success state with random sleep tips
- Empty cart state with navigation

---

### 5. Wishlist Page (`WishlistView.jsx`)
**Purpose**: Save and manage favorite products

**Sections**:
- **Header Bar**: 
  - Saved products count
  - Clear Wishlist button
  - Move All to Cart button
- **Product Grid**: Saved products with overlay actions:
  - Move to Cart button
  - Remove button
- **Empty State**: Displayed when wishlist is empty

**Key Features**:
- Bulk actions (clear all, move all to cart)
- Individual item actions
- Product card integration
- Empty state with navigation

---

### 6. Search Page (`SearchView.jsx`)
**Purpose**: Product search functionality

**Sections**:
- **Search Header**:
  - Search input with icon
  - Clear search button
  - Recent search chips
- **Results Header**: Search query and result count
- **Search Results Grid**: Products matching search query
- **Initial State**: Discovery shortcuts when no search is active:
  - Shop All Mattresses
  - Explore Bundles
- **Empty State**: No results found message

**Key Features**:
- Real-time search across product names, taglines, categories, badges, and specs
- Recent search suggestions
- Search result counting
- Empty state handling
- Quick navigation shortcuts

---

### 7. Profile Page (`ProfileView.jsx`)
**Purpose**: User profile and sleep preferences

**Sections**:
- **Profile Header**:
  - User avatar
  - User name
  - Membership status
  - Sleep streak badge
- **Sleep Profile & Preferences**:
  - Preferred sleeping position (Side, Back, Stomach, Combination)
  - Preferred sleep temperature (Cool, Neutral, Warm)
  - Save preferences button
  - Success message display
- **Sleep Advisor Recommendation**: AI-powered product suggestions based on preferences
- **Order History**:
  - Order list with IDs, dates, and status
  - Product details per order
  - Order totals

**Key Features**:
- Interactive preference selection with chip buttons
- Dynamic sleep recommendations
- Order history display
- Mock order data
- Success feedback on save

---

## Components

### Header Component (`Header.jsx`)
**Purpose**: Site navigation and user actions

**Desktop Header**:
- Logo with wordmark
- Navigation links (Home, Mattresses, Bundles, About, Reviews)
- Icon controls (Search, Wishlist, Cart)
- Badge indicators for cart and wishlist counts

**Mobile Header**:
- Compact logo
- Search trigger bar
- Cart and notification icons
- Bottom tab bar navigation (Home, Discover, Wishlist, Cart, Profile)

**Key Features**:
- Responsive design with breakpoint at 767px
- Sticky positioning with blur effect
- Active state indicators
- Badge counters
- Smooth scroll to sections

---

### Footer Component (`Footer.jsx`)
**Purpose**: Site footer with navigation and brand information

**Sections**:
- **Brand Block**: Logo, tagline, and company description
- **Link Columns**:
  - Shop (Mattresses, Pillows, Bed Frames, Bundles)
  - Company (About Us, Sustainability, Press, Careers)
  - Support (100-Night Trial, Warranty Info, FAQs, Contact Us)
- **Bottom Row**: Copyright and payment method badges

**Key Features**:
- Responsive grid layout
- Navigation integration
- Payment method display
- Dynamic year in copyright

---

### Product Card Component (`ProductCard.jsx`)
**Purpose**: Display product information in grid layouts

**Features**:
- Product image
- Product name and tagline
- Rating display
- Price
- Category badge
- Hover lift effect
- Click navigation to product detail

---

### Empty State Component (`EmptyState.jsx`)
**Purpose**: Display empty state messages with actions

**Features**:
- Icon display (cart, wishlist, search)
- Title and description
- Action button
- Consistent styling across views

---

### Firmness Size Selector Component (`FirmnessSizeSelector.jsx`)
**Purpose**: Select product options (firmness/size)

**Features**:
- Label display
- Option buttons with active state
- Visual feedback for selection

---

### Quantity Stepper Component (`QuantityStepper.jsx`)
**Purpose**: Adjust product quantity

**Features**:
- Decrement button
- Quantity display
- Increment button
- Minimum quantity enforcement

---

### Rating Stars Component (`RatingStars.jsx`)
**Purpose**: Display star ratings

**Features**:
- Star rendering based on rating
- Optional numeric display
- Review count display

---

## Data & State Management

### Store Context (`StoreContext`)
**Purpose**: Global state management for the application

**State**:
- `view`: Current active view/page
- `cart`: Shopping cart items
- `wishlist`: Saved product IDs
- `searchQuery`: Current search term
- `activeFilters`: Filter selections (category, firmness, size, sort)
- `selectedProductId`: Currently selected product

**Actions**:
- `navigateTo`: Change current view
- `addToCart`: Add item to cart
- `updateQty`: Update cart item quantity
- `removeFromCart`: Remove item from cart
- `clearCart`: Empty the cart
- `toggleWishlist`: Add/remove from wishlist
- `moveToCart`: Move wishlist item to cart
- `setSearchQuery`: Update search term
- `setActiveFilters`: Update filter selections
- `getProductById`: Retrieve product by ID

---

### Products Data (`products.js`)
**Purpose**: Mock product data for the catalog

**Product Structure**:
- `id`: Unique identifier
- `name`: Product name
- `tagline`: Marketing tagline
- `category`: Product category
- `price`: Base price
- `sizePrices`: Price variations by size
- `rating`: Average rating (1-5)
- `reviewCount`: Number of reviews
- `badge`: Product badge (e.g., "Best Seller")
- `firmnessOptions`: Available firmness levels
- `sizeOptions`: Available sizes
- `images`: Product image URLs
- `description`: Product description
- `features`: Feature list
- `specs`: Technical specifications
- `reviews`: Customer review array

---

## Design System

### Color Palette
- **Primary Navy**: `#1B1F8C` - Brand primary, headings, buttons
- **Primary Green**: `#16A34A` - Accents, success states, badges
- **Background Cream**: `#F7F7F2` - Page background
- **Text Dark**: `#14151A` - Primary text
- **Text Gray**: `#6B6B75` - Secondary text
- **Border Light**: `#E7E7E2` - Borders and dividers
- **White**: `#FFFFFF` - Cards and sections

### Typography
- **Headings**: Bold weights (700-800), tight letter spacing
- **Body**: Regular weights (400-500), comfortable line heights
- **Labels**: Uppercase, wide letter spacing (0.05-0.08em)
- **Responsive sizing**: Uses clamp() for fluid typography

### Spacing & Layout
- **Container Max Width**: 1200px
- **Section Padding**: 40-80px vertical
- **Grid Gaps**: 24-48px
- **Border Radius**: 16-24px for cards and sections
- **Shadows**: Subtle, layered shadows for depth

### Interactions
- **Hover Lift**: Subtle transform on hover
- **Transitions**: 0.2s ease for smooth state changes
- **Active States**: Color changes and border highlights
- **Badge Indicators**: Circular badges for counts

---

## Responsive Design

### Breakpoints
- **Desktop**: > 767px
- **Mobile**: ≤ 767px

### Mobile Adaptations
- **Header**: Compact top bar with bottom tab navigation
- **Grids**: Single column or reduced column counts
- **Typography**: Smaller font sizes
- **Spacing**: Reduced padding and margins
- **Navigation**: Bottom tab bar replaces desktop header

---

## Navigation Flow

### Main Navigation Paths
1. **Home** → Catalog (via "Go to catalog" or navigation)
2. **Home** → Product Detail (via product cards)
3. **Catalog** → Product Detail (via product cards)
4. **Search** → Product Detail (via search results)
5. **Product Detail** → Cart (via "Add to Cart" or "Buy Now")
6. **Cart** → Checkout Success (via "Proceed to Checkout")
7. **Wishlist** → Cart (via "Move to Cart")
8. **Profile** → Various sections (via internal links)

### Filter & Search Integration
- Search results integrate with catalog filters
- Category navigation from home auto-filters catalog
- Recent searches provide quick access to common terms

---

## Key Features Summary

### E-commerce Functionality
- Product browsing and filtering
- Product detail pages with configuration
- Shopping cart management
- Wishlist functionality
- Mock checkout process
- Order history display

### User Experience
- Responsive design for all devices
- Intuitive navigation system
- Empty state handling
- Loading states and transitions
- Search functionality
- Product recommendations

### Brand Elements
- Consistent color scheme
- Premium aesthetic
- Sleep-focused content
- Customer testimonials
- Trust indicators (trial, warranty, delivery)

---

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout with metadata
│   │   ├── page.js            # Main entry point with view routing
│   │   ├── globals.css        # Global styles
│   │   └── favicon.ico        # Site icon
│   ├── components/
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Footer.jsx         # Site footer
│   │   ├── ProductCard.jsx    # Product display card
│   │   ├── EmptyState.jsx     # Empty state component
│   │   ├── FirmnessSizeSelector.jsx  # Option selector
│   │   ├── QuantityStepper.jsx      # Quantity control
│   │   └── RatingStars.jsx    # Rating display
│   ├── views/
│   │   ├── HomeView.jsx       # Home page
│   │   ├── CatalogView.jsx    # Product catalog
│   │   ├── ProductDetailView.jsx  # Product details
│   │   ├── CartView.jsx       # Shopping cart
│   │   ├── WishlistView.jsx   # Wishlist page
│   │   ├── SearchView.jsx     # Search page
│   │   └── ProfileView.jsx    # User profile
│   ├── context/
│   │   └── StoreContext.jsx   # Global state management
│   └── data/
│       └── products.js        # Mock product data
├── public/
│   └── asset/                 # Images and assets
└── package.json              # Dependencies
```

---

## Development Notes

### State Management
- Uses React Context API for global state
- View-based routing instead of traditional URL routing
- State persists across view changes

### Styling Approach
- Inline JavaScript objects for component styles
- CSS-in-JS with styled-jsx for responsive breakpoints
- Consistent design tokens throughout

### Performance Considerations
- useMemo for expensive computations (filtering, sorting)
- Lazy loading of views through conditional rendering
- Optimized re-renders through context structure

### Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management on view changes

---

## Future Enhancement Opportunities

### Potential Additions
- URL-based routing for better SEO
- Real backend integration
- User authentication
- Payment processing
- Advanced filtering options
- Product comparison feature
- Image zoom functionality
- Video product demonstrations
- Live chat support
- Email marketing integration
- Analytics tracking

### Technical Improvements
- TypeScript migration
- Component library extraction
- Automated testing
- CI/CD pipeline
- Performance monitoring
- Error boundary implementation
- Service worker for offline support

---

*Documentation generated for Mellosoft Frontend Website*
*Last Updated: July 2026*
