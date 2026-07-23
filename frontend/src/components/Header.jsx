"use client";

import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import { formatPrice } from "../utils/currency";

export default function Header() {
  const {
    view,
    navigateTo,
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters
  } = useStore();

  const [desktopSearch, setDesktopSearch] = useState(searchQuery || "");
  const [mobileSearch, setMobileSearch] = useState(searchQuery || "");
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlist.length;
  const isNestedMobileView = view !== "home";
  const isDetailView = view === "detail";
  const showFilters = view === "catalog" || view === "search";

  const activeFilterCount = [
    activeFilters?.category && activeFilters.category !== "All",
    activeFilters?.firmness && activeFilters.firmness !== "All",
    activeFilters?.size && activeFilters.size !== "All",
    activeFilters?.sort && activeFilters.sort !== "Recommended"
  ].filter(Boolean).length;

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      category: "All",
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    setSearchQuery("");
  };

  const searchActive = mobileFocused || mobileSearch.trim().length > 0;
  const showMobileLogo = !searchActive && !isNestedMobileView;

  const searchProducts = (term) => {
    const query = term.trim().toLowerCase();
    if (!query) return [];
    return MOCK_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tagline.toLowerCase().includes(query)
      );
    }).slice(0, 5);
  };

  const desktopSuggestions = searchProducts(desktopSearch);
  const mobileSuggestions = searchProducts(mobileSearch);

  const goToCategory = (category) => {
    setActiveFilters({
      category,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    setSearchQuery("");
    navigateTo("catalog");
    setMobileMenuOpen(false);
  };

  const goToSearchResults = (term) => {
    const query = term.trim();
    if (!query) return;
    setSearchQuery(query);
    setActiveFilters((prev) => ({ ...prev, category: "All" }));
    navigateTo("search");
    setDesktopFocused(false);
    setMobileFocused(false);
  };

  const goToProduct = (productId) => {
    navigateTo("detail", productId);
    setDesktopFocused(false);
    setMobileFocused(false);
  };

  const scrollToSection = (id) => {
    navigateTo("home");
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const goBack = () => {
    if (view === "detail") {
      navigateTo("catalog");
      return;
    }
    navigateTo("home");
  };

  const handleMobileBack = () => {
    if (searchActive) {
      setMobileSearch("");
      setMobileFocused(false);
      return;
    }
    goBack();
  };

  return (
    <>
      <header style={desktopHeaderStyle} className="desktop-only">
        <div style={headerContainerStyle}>
          <div style={leftGroupStyle}>
            <button onClick={() => navigateTo("home")} style={logoContainerStyle} aria-label="Go home">
              <img src="/asset/logo.png" alt="Mellosoft" style={logoImageStyle} />
            </button>

            {showFilters && (
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                style={filterTriggerStyle}
                aria-haspopup="dialog"
                aria-expanded={isFilterOpen}
              >
                <FilterIcon />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span style={filterCountBadgeStyle}>{activeFilterCount}</span>
                )}
              </button>
            )}
          </div>

          <nav style={navLinksStyle} aria-label="Primary navigation">
            <button onClick={() => navigateTo("home")} style={{ ...navLinkButtonStyle, color: view === "home" ? "#1B1F8C" : "#6B6B75", fontWeight: view === "home" ? "700" : "500" }}>
              Home
            </button>
            <button onClick={() => goToCategory("mattress")} style={{ ...navLinkButtonStyle, color: activeCatalogColor(view) }}>
              Mattresses
            </button>
            <button onClick={() => goToCategory("pillows")} style={navLinkButtonStyle}>
              Pillows
            </button>
            <button onClick={() => goToCategory("bed frames")} style={navLinkButtonStyle}>
              Bed Frames
            </button>
            <button onClick={() => scrollToSection("about-section")} style={navLinkButtonStyle}>
              About
            </button>
          </nav>

          <div style={desktopActionsStyle}>
            <SearchBox
              value={desktopSearch}
              onChange={setDesktopSearch}
              suggestions={desktopSuggestions}
              focused={desktopFocused}
              setFocused={setDesktopFocused}
              onProduct={goToProduct}
              onSubmitSearch={goToSearchResults}
            />

            <button onClick={() => navigateTo("wishlist")} style={iconButtonStyle} aria-label="Open wishlist">
              <span style={{ position: "relative", display: "flex" }}>
                <HeartIcon filled={wishlistCount > 0} />
                {wishlistCount > 0 && <span style={badgeStyle}>{wishlistCount}</span>}
              </span>
            </button>
            <button onClick={() => navigateTo("cart")} style={iconButtonStyle} aria-label="Open cart">
              <span style={{ position: "relative", display: "flex" }}>
                <CartIcon />
                {cartCount > 0 && <span style={greenBadgeStyle}>{cartCount}</span>}
              </span>
            </button>
          </div>
        </div>
      </header>

      <header style={isDetailView ? mobileDetailHeaderStyle : mobileHeaderStyle} className="mobile-only">
        <div style={mobileTopRowStyle}>
          <div
            style={{
              ...mobileLeftSlotStyle,
              maxWidth: showMobileLogo ? "160px" : "0px",
              opacity: showMobileLogo ? 1 : 0,
              marginRight: showMobileLogo ? "10px" : "0px"
            }}
          >
            <button onClick={() => setMobileMenuOpen((open) => !open)} style={mobileLogoStyle} aria-label="Open menu">
              <img src="/asset/logo.png" alt="Mellosoft" style={mobileLogoImageStyle} />
            </button>
          </div>

          <div
            style={{
              ...mobileBackSlotStyle,
              maxWidth: showMobileLogo ? "0px" : "40px",
              opacity: showMobileLogo ? 0 : 1,
              marginRight: showMobileLogo ? "0px" : "10px"
            }}
          >
            <button onClick={handleMobileBack} style={mobileIconButtonStyle} aria-label="Go back">
              <ArrowLeftIcon />
            </button>
          </div>

          {showFilters && !isDetailView && (
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              style={mobileIconButtonStyle}
              aria-label="Open filters"
              aria-haspopup="dialog"
              aria-expanded={isFilterOpen}
            >
              <span style={{ position: "relative", display: "flex" }}>
                <FilterIcon size={19} />
                {activeFilterCount > 0 && <span style={badgeStyle}>{activeFilterCount}</span>}
              </span>
            </button>
          )}

          {!isDetailView && (
            <SearchBox
              value={mobileSearch}
              onChange={setMobileSearch}
              suggestions={mobileSuggestions}
              focused={mobileFocused}
              setFocused={setMobileFocused}
              onProduct={goToProduct}
              onSubmitSearch={goToSearchResults}
              formStyle={mobileSearchFormStyle}
            />
          )}

          <button onClick={() => navigateTo("cart")} style={{ ...mobileIconButtonStyle, marginLeft: isDetailView ? "auto" : "10px" }} aria-label="Open cart">
            <span style={{ position: "relative", display: "flex" }}>
              <CartIcon />
              {cartCount > 0 && <span style={mobileCartBadgeStyle}>{cartCount}</span>}
            </span>
          </button>
        </div>

        {!isDetailView && mobileMenuOpen && (
          <nav style={mobileMenuStyle} aria-label="Mobile category navigation">
            <button onClick={() => goToCategory("mattress")} style={mobileMenuItemStyle}>Mattresses</button>
            <button onClick={() => goToCategory("pillows")} style={mobileMenuItemStyle}>Pillows</button>
            <button onClick={() => goToCategory("bed frames")} style={mobileMenuItemStyle}>Bed Frames</button>
            <button onClick={() => goToCategory("protectors")} style={mobileMenuItemStyle}>Protectors</button>
          </nav>
        )}
      </header>

      {/* Filter overlay backdrop */}
      {isFilterOpen && (
        <div
          style={filterBackdropStyle}
          onClick={() => setIsFilterOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in filter sidebar */}
      <div
        style={{
          ...filterSidebarStyle,
          transform: isFilterOpen ? "translateX(0)" : "translateX(-100%)"
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        <div style={sidebarHeaderStyle}>
          <span style={sidebarTitleStyle}>Filters</span>
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            style={sidebarCloseBtnStyle}
            aria-label="Close filters"
          >
            &#10005;
          </button>
        </div>

        <div style={sidebarBodyStyle}>
          <div style={filterFieldStyle}>
            <label htmlFor="category-filter" style={filterLabelStyle}>Category</label>
            <select
              id="category-filter"
              value={activeFilters?.category || "All"}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              style={filterSelectStyle}
            >
              <option value="All">All Categories</option>
              <option value="mattress">Mattresses</option>
              <option value="pillows">Pillows</option>
              <option value="bed frames">Bed Frames</option>
              <option value="protectors">Protectors</option>
            </select>
          </div>

          <div style={filterFieldStyle}>
            <label htmlFor="firmness-filter" style={filterLabelStyle}>Firmness</label>
            <select
              id="firmness-filter"
              value={activeFilters?.firmness || "All"}
              onChange={(e) => handleFilterChange("firmness", e.target.value)}
              style={filterSelectStyle}
            >
              <option value="All">All Levels</option>
              <option value="Soft">Soft</option>
              <option value="Medium">Medium</option>
              <option value="Firm">Firm</option>
            </select>
          </div>

          <div style={filterFieldStyle}>
            <label htmlFor="size-filter" style={filterLabelStyle}>Size</label>
            <select
              id="size-filter"
              value={activeFilters?.size || "All"}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              style={filterSelectStyle}
            >
              <option value="All">All Sizes</option>
              <option value="Twin">Twin</option>
              <option value="Full">Full</option>
              <option value="Queen">Queen</option>
              <option value="King">King</option>
            </select>
          </div>

          <div style={filterFieldStyle}>
            <label htmlFor="sort-filter" style={filterLabelStyle}>Sort By</label>
            <select
              id="sort-filter"
              value={activeFilters?.sort || "Recommended"}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              style={filterSelectStyle}
            >
              <option value="Recommended">Recommended</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Rating">Rating</option>
            </select>
          </div>
        </div>

        <div style={sidebarFooterStyle}>
          {activeFilterCount > 0 || searchQuery ? (
            <button type="button" onClick={resetFilters} style={sidebarResetBtnStyle}>
              Reset Filters
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={() => setIsFilterOpen(false)} style={sidebarApplyBtnStyle}>
            Apply
          </button>
        </div>
      </div>

      <style jsx global>{`
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          body {
            padding-top: ${isDetailView ? "0" : "60px"} !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

function SearchBox({ value, onChange, suggestions, focused, setFocused, onProduct, onSubmitSearch, formStyle }) {
  return (
    <form
      style={formStyle || desktopSearchFormStyle}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitSearch(value);
      }}
    >
      <div style={searchInputWrapStyle}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6B6B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Search mattresses..."
          style={searchInputStyle}
          aria-label="Search Mellosoft products"
        />
      </div>

      {focused && value.trim() && (
        <div style={suggestionsStyle} onMouseDown={(event) => event.preventDefault()}>
          {suggestions.length > 0 ? (
            suggestions.map((product) => (
              <button key={product.id} type="button" onClick={() => onProduct(product.id)} style={suggestionItemStyle}>
                <img src={product.images[0]} alt="" style={suggestionImageStyle} />
                <span style={suggestionTextStyle}>
                  <strong>{product.name}</strong>
                  <span>{formatPrice(product.price)}</span>
                </span>
              </button>
            ))
          ) : (
            <div style={emptySuggestionStyle}>No quick matches</div>
          )}
          <button type="submit" style={seeAllStyle}>
            See all results
          </button>
        </div>
      )}
    </form>
  );
}

function activeCatalogColor(view) {
  return view === "catalog" ? "#1B1F8C" : "#6B6B75";
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#16A34A" : "none"} stroke={filled ? "#16A34A" : "#1B1F8C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function FilterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="#1B1F8C" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const desktopHeaderStyle = {
  position: "sticky",
  top: 0,
  width: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #E7E7E2",
  zIndex: 1000
};

const headerContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  height: "76px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px"
};

const logoContainerStyle = {
  border: "none",
  background: "none",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: 0
};

const leftGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px"
};

const logoImageStyle = {
  height: "48px",
  width: "auto",
  objectFit: "contain"
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px"
};

const navLinkButtonStyle = {
  border: "none",
  background: "none",
  fontSize: "15px",
  fontWeight: "500",
  color: "#6B6B75",
  cursor: "pointer",
  padding: "8px 0"
};

const desktopActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const desktopSearchFormStyle = {
  position: "relative",
  width: "250px"
};

const mobileSearchFormStyle = {
  position: "relative",
  flex: 1,
  minWidth: 0
};

const searchInputWrapStyle = {
  height: "40px",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 14px"
};

const searchInputStyle = {
  width: "100%",
  minWidth: 0,
  border: "none",
  background: "transparent",
  fontSize: "14px",
  fontWeight: "500",
  color: "#14151A"
};

const suggestionsStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "12px",
  overflow: "hidden",
  zIndex: 1100
};

const suggestionItemStyle = {
  width: "100%",
  border: "none",
  background: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  textAlign: "left",
  cursor: "pointer",
  borderBottom: "1px solid #E7E7E2"
};

const suggestionImageStyle = {
  width: "44px",
  height: "44px",
  objectFit: "cover",
  borderRadius: "8px",
  backgroundColor: "#F7F7F2"
};

const suggestionTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  fontSize: "13px",
  color: "#1B1F8C"
};

const emptySuggestionStyle = {
  padding: "14px",
  fontSize: "13px",
  color: "#6B6B75",
  borderBottom: "1px solid #E7E7E2"
};

const seeAllStyle = {
  width: "100%",
  border: "none",
  backgroundColor: "#F7F7F2",
  color: "#1B1F8C",
  padding: "11px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const iconButtonStyle = {
  border: "none",
  background: "transparent",
  padding: "8px",
  cursor: "pointer",
  borderRadius: "999px"
};

const badgeStyle = {
  position: "absolute",
  top: "-6px",
  right: "-6px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "10px",
  fontWeight: "700",
  borderRadius: "50%",
  width: "16px",
  height: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const greenBadgeStyle = {
  ...badgeStyle,
  backgroundColor: "#16A34A"
};

const mobileHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #E7E7E2",
  zIndex: 1000
};

const mobileDetailHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "transparent",
  zIndex: 1000,
  pointerEvents: "none"
};

const mobileTopRowStyle = {
  height: "60px",
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  pointerEvents: "auto"
};

const mobileLogoStyle = {
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: 0
};

const mobileLogoImageStyle = {
  height: "34px",
  width: "auto",
  objectFit: "contain"
};

const mobileLeftSlotStyle = {
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  flexShrink: 0,
  transition: "max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, margin 0.3s ease"
};

const mobileBackSlotStyle = {
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  flexShrink: 0,
  transition: "max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, margin 0.3s ease"
};

const mobileIconButtonStyle = {
  width: "40px",
  height: "40px",
  flexShrink: 0,
  border: "1px solid rgba(231, 231, 226, 0.85)",
  backgroundColor: "rgba(255, 255, 255, 0.86)",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const mobileCartBadgeStyle = {
  ...greenBadgeStyle,
  top: "-7px",
  right: "-7px"
};

const mobileMenuStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "8px",
  padding: "0 14px 14px"
};

const mobileMenuItemStyle = {
  border: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF",
  color: "#1B1F8C",
  borderRadius: "12px",
  padding: "11px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

// Filter trigger (top-left of navbar)
const filterTriggerStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  padding: "9px 16px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C",
  cursor: "pointer"
};

const filterCountBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "18px",
  height: "18px",
  padding: "0 5px",
  borderRadius: "999px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "11px",
  fontWeight: "700"
};

const filterBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(20, 21, 26, 0.4)",
  zIndex: 1200
};

const filterSidebarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100%",
  width: "320px",
  maxWidth: "85vw",
  backgroundColor: "#FFFFFF",
  zIndex: 1300,
  boxShadow: "4px 0 24px rgba(20, 21, 26, 0.15)",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.28s ease"
};

const sidebarHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 24px",
  borderBottom: "1px solid #E7E7E2"
};

const sidebarTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const sidebarCloseBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "16px",
  color: "#6B6B75",
  cursor: "pointer",
  padding: "4px 8px",
  lineHeight: 1
};

const sidebarBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
  padding: "24px",
  overflowY: "auto",
  flex: 1
};

const sidebarFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "16px 24px",
  borderTop: "1px solid #E7E7E2"
};

const sidebarResetBtnStyle = {
  backgroundColor: "transparent",
  color: "#1B1F8C",
  border: "none",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "underline",
  padding: "8px 12px"
};

const sidebarApplyBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  padding: "10px 20px",
  flex: 1
};

const filterFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const filterLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const filterSelectStyle = {
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  color: "#14151A",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 12px",
  width: "100%",
  cursor: "pointer",
  outline: "none",
  transition: "border-color 0.2s ease"
};