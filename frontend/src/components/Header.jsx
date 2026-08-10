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
    setActiveFilters
  } = useStore();

  const [desktopSearch, setDesktopSearch] = useState(searchQuery || "");
  const [mobileSearch, setMobileSearch] = useState(searchQuery || "");
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlist.length;
  const isNestedMobileView = view !== "home";
  const isDetailView = view === "detail";

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
          <button onClick={() => navigateTo("home")} style={logoContainerStyle} aria-label="Go home">
            <img src="/asset/logo.png" alt="Mellosoft" style={logoImageStyle} />
          </button>

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

      {!isDetailView && (
        <header style={mobileHeaderStyle} className="mobile-only">
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

            <button onClick={() => navigateTo("cart")} style={{ ...mobileIconButtonStyle, marginLeft: "10px" }} aria-label="Open cart">
              <span style={{ position: "relative", display: "flex" }}>
                <CartIcon />
                {cartCount > 0 && <span style={mobileCartBadgeStyle}>{cartCount}</span>}
              </span>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav style={mobileMenuStyle} aria-label="Mobile category navigation">
              <button onClick={() => goToCategory("mattress")} style={mobileMenuItemStyle}>Mattresses</button>
              <button onClick={() => goToCategory("pillows")} style={mobileMenuItemStyle}>Pillows</button>
              <button onClick={() => goToCategory("bed frames")} style={mobileMenuItemStyle}>Bed Frames</button>
              <button onClick={() => goToCategory("protectors")} style={mobileMenuItemStyle}>Protectors</button>
            </nav>
          )}
        </header>
      )}

      <style>{`
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
  gap: "10px",
  cursor: "pointer",
  padding: 0
};

const logoImageStyle = {
  height: "32px",
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
  height: "32px",
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
