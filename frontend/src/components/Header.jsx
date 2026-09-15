"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { MOCK_PRODUCTS } from "../data/products";
import { getResolvedImageUrlSync } from "../utils/imageStorage";
import { getListingBackRoute } from "../utils/navigationHelpers";
import {
  getSubcategoryUrl,
  MATTRESS_CATEGORY_LIST,
  ACCESSORY_CATEGORY_LIST,
  BED_FRAME_CATEGORY_LIST
} from "../utils/productHelpers";
import { formatPrice } from "../utils/currency";

export default function Header() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const {
    view,
    navigateTo,
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    setActiveFilters,
    settings,
    categories,
    products
  } = useStore();

  const { currentCustomer, isAuthenticated } = useCustomerAuth();

  const [desktopSearch, setDesktopSearch] = useState(searchQuery || "");
  const [mobileSearch, setMobileSearch] = useState(searchQuery || "");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states for Desktop
  const [mattressDropdown, setMattressDropdown] = useState(false);
  const [accessoriesDropdown, setAccessoriesDropdown] = useState(false);
  const [bedFramesDropdown, setBedFramesDropdown] = useState(false);

  // Mobile accordion states
  const [mobileMattressOpen, setMobileMattressOpen] = useState(false);
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);
  const [mobileBedFramesOpen, setMobileBedFramesOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
  const wishlistCount = wishlist.length;
  const displayCartCount = mounted ? cartCount : 0;
  const displayWishlistCount = mounted ? wishlistCount : 0;

  const isHome = pathname === "/";
  const isMattressActive = pathname === "/mattresses" || pathname.startsWith("/mattresses/");
  const isAccessoriesActive = pathname === "/accessories" || pathname.startsWith("/accessories/");
  const isBedFramesActive = pathname === "/bed-frames" || pathname.startsWith("/bed-frames/");
  const isAboutActive = pathname === "/about";
  const isContactActive = pathname === "/contact";

  // Dynamic Subcategory lists for Mattresses, Accessories, Bed Frames
  const mattressSubcategories = React.useMemo(() => {
    const main = (categories || []).find(
      (c) => c.slug === "mattresses" || c.id === "CAT-MATTRESSES" || (c.name && c.name.toLowerCase() === "mattresses")
    );
    if (main && Array.isArray(main.subcategories) && main.subcategories.length > 0) {
      return main.subcategories.filter((s) => s.active !== false);
    }
    return MATTRESS_CATEGORY_LIST;
  }, [categories]);

  const accessorySubcategories = React.useMemo(() => {
    const main = (categories || []).find(
      (c) => c.slug === "accessories" || c.id === "CAT-ACCESSORIES" || (c.name && c.name.toLowerCase() === "accessories")
    );
    if (main && Array.isArray(main.subcategories) && main.subcategories.length > 0) {
      return main.subcategories.filter((s) => s.active !== false);
    }
    return ACCESSORY_CATEGORY_LIST;
  }, [categories]);

  const bedFrameSubcategories = React.useMemo(() => {
    const main = (categories || []).find(
      (c) => c.slug === "bed-frames" || c.id === "CAT-BED-FRAMES" || (c.name && c.name.toLowerCase() === "bed frames")
    );
    if (main && Array.isArray(main.subcategories) && main.subcategories.length > 0) {
      return main.subcategories.filter((s) => s.active !== false);
    }
    return BED_FRAME_CATEGORY_LIST;
  }, [categories]);

  const isNestedMobileView = !isHome;
  const isDetailView = pathname.startsWith("/product/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const style = document.body.style;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (mq.matches) {
        style.paddingTop = isDetailView ? "0" : "60px";
        style.paddingBottom = "0";
      } else {
        style.paddingTop = "";
        style.paddingBottom = "";
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      style.paddingTop = "";
      style.paddingBottom = "";
    };
  }, [isDetailView]);

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileSearchOpen) {
      const timer = setTimeout(() => {
        if (mobileInputRef.current) {
          mobileInputRef.current.focus();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [mobileSearchOpen]);

  const searchActive = mobileSearchOpen || mobileFocused || mobileSearch.trim().length > 0;
  const showMobileLogo = !searchActive && !isNestedMobileView;

  const searchProducts = (term) => {
    const query = term.trim().toLowerCase();
    if (!query) return [];
    const sourceProducts = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    return sourceProducts.filter((product) => {
      const name = (product.name || product.Product_Name || "").toLowerCase();
      const id = (product.Product_Id || product.id || product.slug || "").toLowerCase();
      const cat = (product.category || product.categoryName || product.categoryLabel || "").toLowerCase();
      const tagline = (product.tagline || "").toLowerCase();
      const construction = (product.construction || "").toLowerCase();
      return (
        name.includes(query) ||
        id.includes(query) ||
        cat.includes(query) ||
        tagline.includes(query) ||
        construction.includes(query)
      );
    }).slice(0, 8);
  };

  const desktopSuggestions = searchProducts(desktopSearch);
  const mobileSuggestions = searchProducts(mobileSearch);

  const handleNavClick = (targetPath) => {
    setMattressDropdown(false);
    setAccessoriesDropdown(false);
    setBedFramesDropdown(false);
    setMobileMenuOpen(false);
    if (router && typeof router.push === "function") {
      router.push(targetPath);
    }
  };

  const goToCategory = (categorySlug) => {
    setActiveFilters({
      category: categorySlug,
      firmness: "All",
      size: "All",
      sort: "Recommended"
    });
    setSearchQuery("");
    setMattressDropdown(false);
    setAccessoriesDropdown(false);
    setMobileMenuOpen(false);
    handleNavClick(`/mattresses/${categorySlug}`);
  };

  const goToProduct = (productId) => {
    setDesktopFocused(false);
    setMobileFocused(false);
    setMattressDropdown(false);
    setAccessoriesDropdown(false);
    setMobileMenuOpen(false);
    handleNavClick(`/product/${encodeURIComponent(String(productId).trim())}`);
  };

  const goToSearchResults = (term) => {
    const query = term.trim();
    if (!query) return;
    setSearchQuery(query);
    setActiveFilters((prev) => ({ ...prev, category: "All" }));
    setDesktopFocused(false);
    setMobileFocused(false);
    handleNavClick("/search");
  };

  const goBack = () => {
    // Product detail pages use actual browser history (supports all entry points:
    // listing, homepage, wishlist, search, You May Also Like chains)
    if (isDetailView) {
      router.back();
      return;
    }
    // Listing and subcategory pages use the explicit hierarchy helper:
    // main listing -> "/", subcategory -> parent main category
    const backRoute = getListingBackRoute(pathname);
    handleNavClick(backRoute);
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
      {/* DESKTOP HEADER */}
      <header style={desktopHeaderStyle} className="desktop-only">
        <div style={headerContainerStyle}>
          <button onClick={() => handleNavClick("/")} style={logoContainerStyle} aria-label={`${settings?.store?.name || "Mellosoft"} Home`}>
            <img
              src={getResolvedImageUrlSync(settings?.website?.logo, "/asset/logo.png")}
              alt={settings?.store?.name || "Mellosoft Mattress"}
              style={logoImageStyle}
              onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
            />
          </button>

          <nav style={navLinksStyle} aria-label="Primary navigation">
            <button
              onClick={() => handleNavClick("/")}
              style={{
                ...navLinkButtonStyle,
                color: isHome ? "#1B1F8C" : "#6B6B75",
                fontWeight: isHome ? "700" : "500"
              }}
            >
              HOME
            </button>

            {/* MATTRESS DROPDOWN */}
            <div
              style={dropdownWrapStyle}
              onMouseEnter={() => setMattressDropdown(true)}
              onMouseLeave={() => setMattressDropdown(false)}
            >
              <button
                onClick={() => handleNavClick("/mattresses")}
                style={{
                  ...navLinkButtonStyle,
                  color: isMattressActive ? "#1B1F8C" : "#6B6B75",
                  fontWeight: isMattressActive ? "700" : "500"
                }}
              >
                MATTRESS <ChevronDownIcon />
              </button>

              {mattressDropdown && (
                <div style={dropdownMenuStyle}>
                  {mattressSubcategories.map((sub) => {
                    const slug = sub.slug || sub.id;
                    const url = getSubcategoryUrl("mattresses", slug);
                    const isActive = pathname === url;
                    return (
                      <button
                        key={sub.id || slug}
                        onClick={() => handleNavClick(url)}
                        style={{
                          ...dropdownItemStyle,
                          color: isActive ? "#1B1F8C" : "#14151A",
                          fontWeight: isActive ? "700" : "500"
                        }}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: "1px solid #E7E7E2", marginTop: "4px", paddingTop: "4px" }}>
                    <button onClick={() => handleNavClick("/mattresses")} style={{ ...dropdownItemStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Mattresses →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACCESSORIES DROPDOWN */}
            <div
              style={dropdownWrapStyle}
              onMouseEnter={() => setAccessoriesDropdown(true)}
              onMouseLeave={() => setAccessoriesDropdown(false)}
            >
              <button
                onClick={() => handleNavClick("/accessories")}
                style={{
                  ...navLinkButtonStyle,
                  color: isAccessoriesActive ? "#1B1F8C" : "#6B6B75",
                  fontWeight: isAccessoriesActive ? "700" : "500"
                }}
              >
                ACCESSORIES <ChevronDownIcon />
              </button>

              {accessoriesDropdown && (
                <div style={dropdownMenuStyle}>
                  {accessorySubcategories.map((sub) => {
                    const slug = sub.slug || sub.id;
                    const url = getSubcategoryUrl("accessories", slug);
                    const isActive = pathname === url;
                    return (
                      <button
                        key={sub.id || slug}
                        onClick={() => handleNavClick(url)}
                        style={{
                          ...dropdownItemStyle,
                          color: isActive ? "#1B1F8C" : "#14151A",
                          fontWeight: isActive ? "700" : "500"
                        }}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: "1px solid #E7E7E2", marginTop: "4px", paddingTop: "4px" }}>
                    <button onClick={() => handleNavClick("/accessories")} style={{ ...dropdownItemStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Accessories →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BED FRAMES DROPDOWN */}
            <div
              style={dropdownWrapStyle}
              onMouseEnter={() => setBedFramesDropdown(true)}
              onMouseLeave={() => setBedFramesDropdown(false)}
            >
              <button
                onClick={() => handleNavClick("/bed-frames")}
                style={{
                  ...navLinkButtonStyle,
                  color: isBedFramesActive ? "#1B1F8C" : "#6B6B75",
                  fontWeight: isBedFramesActive ? "700" : "500"
                }}
              >
                BED FRAMES <ChevronDownIcon />
              </button>

              {bedFramesDropdown && (
                <div style={dropdownMenuStyle}>
                  {bedFrameSubcategories.map((sub) => {
                    const slug = sub.slug || sub.id;
                    const url = getSubcategoryUrl("bed-frames", slug);
                    const isActive = pathname === url;
                    return (
                      <button
                        key={sub.id || slug}
                        onClick={() => handleNavClick(url)}
                        style={{
                          ...dropdownItemStyle,
                          color: isActive ? "#1B1F8C" : "#14151A",
                          fontWeight: isActive ? "700" : "500"
                        }}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: "1px solid #E7E7E2", marginTop: "4px", paddingTop: "4px" }}>
                    <button onClick={() => handleNavClick("/bed-frames")} style={{ ...dropdownItemStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Bed Frames →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick("/about")}
              style={{
                ...navLinkButtonStyle,
                color: isAboutActive ? "#1B1F8C" : "#6B6B75",
                fontWeight: isAboutActive ? "700" : "500"
              }}
            >
              OUR STORY
            </button>

            <button
              onClick={() => handleNavClick("/contact")}
              style={{
                ...navLinkButtonStyle,
                color: isContactActive ? "#1B1F8C" : "#6B6B75",
                fontWeight: isContactActive ? "700" : "500"
              }}
            >
              CONTACT
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

            <button onClick={() => navigateTo("wishlist")} style={iconButtonStyle} aria-label="Open wishlist" title="Wishlist">
              <span style={{ position: "relative", display: "flex" }}>
                <HeartIcon filled={displayWishlistCount > 0} />
                {displayWishlistCount > 0 && <span style={badgeStyle}>{displayWishlistCount}</span>}
              </span>
            </button>
            <button onClick={() => navigateTo("orders")} style={iconButtonStyle} aria-label="My Orders" title="My Orders">
              <span style={{ position: "relative", display: "flex" }}>
                <OrdersIcon active={view === "orders"} />
              </span>
            </button>
            <button onClick={() => navigateTo("cart")} style={iconButtonStyle} aria-label="Open cart" title="Cart">
              <span style={{ position: "relative", display: "flex" }}>
                <CartIcon />
                {displayCartCount > 0 && <span style={greenBadgeStyle}>{displayCartCount}</span>}
              </span>
            </button>
            <button
              onClick={() => navigateTo(isAuthenticated ? "profile" : "login")}
              style={iconButtonStyle}
              aria-label={isAuthenticated ? "Customer Account" : "LOGIN"}
              title={isAuthenticated ? (currentCustomer?.name || "Account") : "LOGIN"}
            >
              <UserIcon active={view === "profile" || view === "login"} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
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
                <img
                  src={getResolvedImageUrlSync(settings?.website?.logo, "/asset/logo.png")}
                  alt={settings?.store?.name || "Mellosoft"}
                  style={mobileLogoImageStyle}
                  onError={(e) => { e.currentTarget.src = "/asset/logo.png"; }}
                />
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

            <div
              onClick={() => setMobileSearchOpen(true)}
              style={mobileSearchFormStyle}
              className="mobile-search-trigger"
              role="button"
              tabIndex={0}
              aria-label="Open search"
            >
              <div style={searchInputWrapStyle} className="mobile-search-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mobile-search-icon">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div
                  className="mobile-search-text"
                  style={{
                    fontSize: "13px",
                    color: "#8E8E98",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    userSelect: "none"
                  }}
                >
                  {mobileSearch || "Search by Keyword or Product ID"}
                </div>
              </div>
            </div>

            <button onClick={() => navigateTo("orders")} style={{ ...mobileIconButtonStyle, marginLeft: "6px" }} className="mobile-header-btn" aria-label="My Orders" title="My Orders">
              <OrdersIcon active={view === "orders"} />
            </button>
            <button onClick={() => navigateTo("cart")} style={{ ...mobileIconButtonStyle, marginLeft: "6px" }} className="mobile-header-btn" aria-label="Open cart" title="Cart">
              <span style={{ position: "relative", display: "flex" }}>
                <CartIcon />
                {displayCartCount > 0 && <span style={mobileCartBadgeStyle}>{displayCartCount}</span>}
              </span>
            </button>
            <button onClick={() => navigateTo(isAuthenticated ? "profile" : "login")} style={{ ...mobileIconButtonStyle, marginLeft: "6px" }} className="mobile-header-btn" aria-label="Account" title="Account">
              <UserIcon active={view === "profile" || view === "login"} />
            </button>
          </div>

          {/* MOBILE ACCORDION NAVIGATION */}
          {mobileMenuOpen && (
            <nav style={mobileNavContainerStyle} aria-label="Mobile main navigation">
              <button onClick={() => { navigateTo("home"); setMobileMenuOpen(false); }} style={mobileMainLinkStyle}>
                HOME
              </button>

              <div>
                <button
                  onClick={() => setMobileMattressOpen((prev) => !prev)}
                  style={mobileMainLinkWithSubStyle}
                >
                  MATTRESS <span>{mobileMattressOpen ? "−" : "+"}</span>
                </button>
                {mobileMattressOpen && (
                  <div style={mobileSubMenuStyle}>
                    {mattressSubcategories.map((sub) => {
                      const slug = sub.slug || sub.id;
                      const url = getSubcategoryUrl("mattresses", slug);
                      const isActive = pathname === url;
                      return (
                        <button
                          key={sub.id || slug}
                          onClick={() => handleNavClick(url)}
                          style={{
                            ...mobileSubLinkStyle,
                            color: isActive ? "#1B1F8C" : "#14151A",
                            fontWeight: isActive ? "700" : "500"
                          }}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                    <button onClick={() => handleNavClick("/mattresses")} style={{ ...mobileSubLinkStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Mattresses →
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setMobileAccessoriesOpen((prev) => !prev)}
                  style={mobileMainLinkWithSubStyle}
                >
                  ACCESSORIES <span>{mobileAccessoriesOpen ? "−" : "+"}</span>
                </button>
                {mobileAccessoriesOpen && (
                  <div style={mobileSubMenuStyle}>
                    {accessorySubcategories.map((sub) => {
                      const slug = sub.slug || sub.id;
                      const url = getSubcategoryUrl("accessories", slug);
                      const isActive = pathname === url;
                      return (
                        <button
                          key={sub.id || slug}
                          onClick={() => handleNavClick(url)}
                          style={{
                            ...mobileSubLinkStyle,
                            color: isActive ? "#1B1F8C" : "#14151A",
                            fontWeight: isActive ? "700" : "500"
                          }}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                    <button onClick={() => handleNavClick("/accessories")} style={{ ...mobileSubLinkStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Accessories →
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setMobileBedFramesOpen((prev) => !prev)}
                  style={mobileMainLinkWithSubStyle}
                >
                  BED FRAMES <span>{mobileBedFramesOpen ? "−" : "+"}</span>
                </button>
                {mobileBedFramesOpen && (
                  <div style={mobileSubMenuStyle}>
                    {bedFrameSubcategories.map((sub) => {
                      const slug = sub.slug || sub.id;
                      const url = getSubcategoryUrl("bed-frames", slug);
                      const isActive = pathname === url;
                      return (
                        <button
                          key={sub.id || slug}
                          onClick={() => handleNavClick(url)}
                          style={{
                            ...mobileSubLinkStyle,
                            color: isActive ? "#1B1F8C" : "#14151A",
                            fontWeight: isActive ? "700" : "500"
                          }}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                    <button onClick={() => handleNavClick("/bed-frames")} style={{ ...mobileSubLinkStyle, fontWeight: "700", color: "#1B1F8C" }}>
                      View All Bed Frames →
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => { navigateTo("about"); setMobileMenuOpen(false); }} style={mobileMainLinkStyle}>
                OUR STORY
              </button>

              <button onClick={() => { navigateTo("contact"); setMobileMenuOpen(false); }} style={mobileMainLinkStyle}>
                CONTACT
              </button>

              <button onClick={() => { navigateTo(isAuthenticated ? "profile" : "login"); setMobileMenuOpen(false); }} style={mobileMainLinkStyle}>
                {isAuthenticated ? "MY ACCOUNT" : "LOGIN"}
              </button>
            </nav>
          )}
        </header>
      )}

      {/* FULL-SCREEN MOBILE SEARCH OVERLAY */}
      {mobileSearchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          className="mobile-search-overlay mobile-only"
        >
          {/* TOP SEARCH BAR */}
          <div
            style={{
              padding: "calc(env(safe-area-inset-top) + 8px) 12px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid #EBEBEB",
              backgroundColor: "#FFFFFF",
              flexShrink: 0
            }}
          >
            {/* BACK CHEVRON */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                padding: "8px 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#1E293B"
              }}
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* SEARCH INPUT PILL */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (mobileSearch.trim()) {
                  goToSearchResults(mobileSearch);
                  setMobileSearchOpen(false);
                }
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                height: "42px",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #CBD5E1",
                borderRadius: "9999px",
                padding: "0 14px",
                gap: "8px",
                boxSizing: "border-box"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                ref={mobileInputRef}
                type="search"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Search by Keyword or Product ID"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#14151A"
                }}
                aria-label="Search products"
              />

              {mobileSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearch("");
                    mobileInputRef.current?.focus();
                  }}
                  style={{
                    border: "none",
                    background: "#E2E8F0",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    color: "#64748B"
                  }}
                  aria-label="Clear search input"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* SEARCH BODY */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#FAF9F5",
              padding: "16px",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {mobileSearch.trim() ? (
              mobileSuggestions.length > 0 ? (
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "12px"
                    }}
                  >
                    Products ({mobileSuggestions.length})
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {mobileSuggestions.map((product) => {
                      const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : (product.image || "/asset/placeholder.png");
                      const prodId = product.Product_Id || product.id;
                      const startingPrice = product.startingPrice || product.price || product.discountPrice;

                      return (
                        <button
                          key={product.id || product.slug}
                          type="button"
                          onClick={() => {
                            goToProduct(product.id || product.slug);
                            setMobileSearchOpen(false);
                          }}
                          style={{
                            border: "1px solid #E7E7E2",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "12px",
                            padding: "10px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            textAlign: "left",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            width: "100%"
                          }}
                        >
                          <img
                            src={image}
                            alt=""
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              backgroundColor: "#F7F7F2",
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#1B1F8C",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {product.name || product.Product_Name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>
                              {product.category || "Mattress"} {prodId ? `• ${prodId}` : ""}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#16A34A", marginTop: "2px" }}>
                              {startingPrice ? formatPrice(startingPrice) : "Contact for Price"}
                            </div>
                          </div>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      goToSearchResults(mobileSearch);
                      setMobileSearchOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#1B1F8C",
                      color: "#FFFFFF",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "14px",
                      border: "none",
                      marginTop: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <span>See all results for &quot;{mobileSearch}&quot;</span>
                    <span>→</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#1B1F8C", marginBottom: "6px" }}>
                    No matching products found
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B6B75", maxWidth: "260px", margin: "0 auto 20px" }}>
                    Try searching for another keyword like &quot;Foam&quot;, &quot;Spring&quot;, or product ID.
                  </div>
                </div>
              )
            ) : (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px"
                  }}
                >
                  Popular Searches
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                  {["Foam Mattress", "Pocket Spring", "Orthopedic", "Dual Comfort", "Pillows", "Protector", "Bed Frame"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setMobileSearch(tag);
                      }}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1E293B",
                        cursor: "pointer"
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px"
                  }}
                >
                  Explore Categories
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Mattresses", path: "/mattresses", desc: "Foam, Spring & Ortho" },
                    { label: "Accessories", path: "/accessories", desc: "Pillows & Protectors" },
                    { label: "Bed Frames", path: "/bed-frames", desc: "Designer Beds" },
                    { label: "About Mellosoft", path: "/about", desc: "Our Story & Quality" }
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        setMobileSearchOpen(false);
                        handleNavClick(cat.path);
                      }}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1B1F8C" }}>{cat.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 440px) {
          .mobile-search-trigger {
            flex: 0 0 40px !important;
            width: 40px !important;
            min-width: 40px !important;
            margin-left: auto !important;
          }
          .mobile-search-pill {
            width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
            justify-content: center !important;
            border-radius: 999px !important;
            background-color: rgba(255, 255, 255, 0.86) !important;
            border: 1px solid rgba(231, 231, 226, 0.85) !important;
          }
          .mobile-search-text {
            display: none !important;
          }
          .mobile-search-icon {
            width: 18px !important;
            height: 18px !important;
            stroke: #1B1F8C !important;
          }
        }
        @media (max-width: 290px) {
          .mobile-search-trigger {
            flex: 0 0 32px !important;
            width: 32px !important;
            min-width: 32px !important;
          }
          .mobile-search-pill {
            width: 32px !important;
            height: 32px !important;
          }
          .mobile-search-icon {
            width: 15px !important;
            height: 15px !important;
          }
          .mobile-header-btn {
            width: 32px !important;
            height: 32px !important;
            margin-left: 3px !important;
          }
          .mobile-header-btn svg {
            width: 17px !important;
            height: 17px !important;
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
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Search mattresses, accessories..."
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
                  <span>{product.startingPrice ? formatPrice(product.startingPrice) : "Contact for Price"}</span>
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

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
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

function OrdersIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#16A34A" : "#1B1F8C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#16A34A" : "#1B1F8C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

// ─── STYLING OBJECTS ─────────────────────────────────────────────────────────

const desktopHeaderStyle = {
  position: "sticky",
  top: 0,
  width: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #E7E7E2",
  zIndex: 1000
};

const headerContainerStyle = {
  width: "100%",
  padding: "0 48px",
  height: "76px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  boxSizing: "border-box"
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
  height: "36px",
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
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  color: "#6B6B75",
  cursor: "pointer",
  padding: "8px 0",
  display: "flex",
  alignItems: "center"
};

const dropdownWrapStyle = {
  position: "relative"
};

const dropdownMenuStyle = {
  position: "absolute",
  top: "100%",
  left: "0",
  minWidth: "220px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  padding: "8px 0",
  zIndex: 1100,
  display: "flex",
  flexDirection: "column"
};

const dropdownItemStyle = {
  border: "none",
  background: "none",
  textAlign: "left",
  padding: "10px 18px",
  fontSize: "14px",
  fontWeight: "500",
  color: "#14151A",
  cursor: "pointer",
  transition: "background 0.2s ease"
};

const desktopActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const desktopSearchFormStyle = {
  position: "relative",
  width: "240px"
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
  fontSize: "13px",
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
  cursor: "pointer"
};

const mobileCartBadgeStyle = {
  ...greenBadgeStyle,
  top: "-7px",
  right: "-7px"
};

const mobileNavContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "10px 16px 20px",
  borderTop: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF"
};

const mobileMainLinkStyle = {
  border: "none",
  background: "none",
  textAlign: "left",
  fontSize: "15px",
  fontWeight: "700",
  color: "#1B1F8C",
  padding: "12px 0",
  borderBottom: "1px solid #F2F2EE",
  cursor: "pointer"
};

const mobileMainLinkWithSubStyle = {
  ...mobileMainLinkStyle,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const mobileSubMenuStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  padding: "4px 0 8px 16px"
};

const mobileSubLinkStyle = {
  border: "none",
  background: "none",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "500",
  color: "#14151A",
  padding: "8px 0",
  cursor: "pointer"
};
