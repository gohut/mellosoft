"use client";

import React, { useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import CustomerReviewsSection from "../components/CustomerReviewsSection";
import PromotionalBannerSlider from "../components/PromotionalBannerSlider";
import PromoBannerCard from "../components/PromoBannerCard";
import HeroSlideCard from "../components/HeroSlideCard";
import { formatPrice } from "../utils/currency";

const categories = [
  { label: "Memory Foam", category: "mattress", image: "/asset/cat-memory-foam.svg", color: "#DCEBFA" },
  { label: "Hybrid", category: "mattress", image: "/asset/cat-hybrid.svg", color: "#FBE2D0" },
  { label: "Firm", category: "mattress", image: "/asset/cat-firm.svg", firmness: "Firm", color: "#DDF2E8" },
  { label: "Pillows", category: "pillows", image: "/asset/cat-pillows.svg", color: "#F8DDE3" },
  { label: "Bed Frames", category: "bed frames", image: "/asset/cat-bedframes.svg", color: "#E9E3FA" },
  { label: "Protectors", category: "protectors", image: "/asset/cat-protectors.svg", color: "#F8EACD" }
];

export default function HomeView() {
  const { navigateTo, setActiveFilters, setSearchQuery, activeHeroBanners, activePromoBanners, homepageConfig, newArrivalItems, bestSellerItems, products } = useStore();
  const sliderTrackRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const mattresses = useMemo(() => (products || MOCK_PRODUCTS).filter((product) => product.category === "mattress"), [products]);
  const featuredMattresses = useMemo(() => mattresses.slice(0, 4), [mattresses]);

  const bestSellers = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    if (bestSellerItems && bestSellerItems.length > 0) {
      const activeItems = bestSellerItems
        .filter((item) => item.isActive !== false)
        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

      const resolved = activeItems
        .map((item) => allProds.find((p) => p.id === item.productId || p.id === item.id))
        .filter(Boolean);

      if (resolved.length > 0) return resolved;
    }
    return [...allProds].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 8);
  }, [bestSellerItems, products]);

  const newArrivals = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    if (newArrivalItems && newArrivalItems.length > 0) {
      const activeItems = newArrivalItems
        .filter((item) => item.isActive !== false)
        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

      const resolved = activeItems
        .map((item) => allProds.find((p) => p.id === item.productId || p.id === item.id))
        .filter(Boolean);

      if (resolved.length > 0) return resolved.slice(0, 10);
    }
    return allProds
      .filter((product) => product.isNewArrival === true)
      .sort((a, b) => (a.newArrivalOrder ?? 999) - (b.newArrivalOrder ?? 999))
      .slice(0, 10);
  }, [newArrivalItems, products]);

  const defaultSections = [
    { id: "hero-slider", visible: true },
    { id: "shop-by-category", visible: true },
    { id: "promo-banner", visible: true },
    { id: "new-arrivals", visible: true },
    { id: "best-sellers", visible: true },
    { id: "customer-reviews", visible: true },
  ];

  const sectionsToRender = (homepageConfig && Array.isArray(homepageConfig.sections) && homepageConfig.sections.length > 0)
    ? homepageConfig.sections
    : defaultSections;

  // ─── Hero slider data ─────────────────────────────────────────────────────────
  // Use admin-managed Hero Slides (type=="Offer") if available,
  // otherwise fall back to featured mattress products so the slider is never empty
  const heroSlides = useMemo(() => {
    const allProds = (products && products.length > 0) ? products : MOCK_PRODUCTS;
    if (activeHeroBanners && activeHeroBanners.length > 0) {
      return activeHeroBanners.map((banner) => {
        const associatedProd = allProds.find((p) => p.id === banner.productId || p.id === banner.id);
        const resolvedTitle = associatedProd ? (associatedProd.name || associatedProd.title) : banner.title;
        const resolvedImage = banner.image || (associatedProd ? (associatedProd.image || associatedProd.images?.[0]) : "/asset/img2.jpg");
        return {
          id: banner.id,
          productId: banner.productId,
          image: resolvedImage,
          type: banner.type || "Offer",
          badge: banner.type || "Offer",
          subtitle: banner.subtitle ?? "",
          title: resolvedTitle,
          headline: resolvedTitle,
          deal: banner.subtitle ?? "",
          description: banner.description ?? (associatedProd?.description || ""),
          ctaText: banner.ctaText !== undefined ? banner.ctaText : "Shop Now",
          ctaLink: banner.ctaLink || (associatedProd?.category || "mattress"),
          product: associatedProd,
          isAdminBanner: true
        };
      });
    }

    // Fallback featured products
    return featuredMattresses.map((product) => ({
      id: product.id,
      image: product.images[0],
      type: "Offer",
      badge: "Offer",
      subtitle: product.tagline || product.subtitle || "Premium Sleep Experience",
      title: product.name,
      headline: product.name,
      deal: product.tagline || product.subtitle || "Premium Sleep Experience",
      description: product.description || "Designed for deep and restful sleep.",
      ctaText: "Shop Now",
      ctaLink: product.category || "mattress",
      product,
      isAdminBanner: false
    }));
  }, [activeHeroBanners, featuredMattresses, products]);

  const handleSliderScroll = () => {
    if (!sliderTrackRef.current) return;
    const scrollLeft = sliderTrackRef.current.scrollLeft;
    const slideWidth = 560 + 16;
    const index = Math.round(scrollLeft / slideWidth);
    setActiveSlide(Math.min(Math.max(index, 0), heroSlides.length - 1));
  };

  const scrollToSlide = (index) => {
    if (!sliderTrackRef.current) return;
    const slideWidth = 560 + 16;
    sliderTrackRef.current.scrollTo({
      left: index * slideWidth,
      behavior: "smooth"
    });
    setActiveSlide(index);
  };

  const goToCatalog = (category = "All", firmness = "All") => {
    setSearchQuery("");
    setActiveFilters({
      category,
      firmness,
      size: "All",
      sort: "Recommended"
    });
    navigateTo("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={pageWrapperStyle}>
      <div className="background-pattern-layer" style={backgroundPatternLayerStyle}>
        <div className="diamond-pattern-layer" aria-hidden="true" style={diamondPatternLayerStyle} />
      </div>

      <div className="content-layer" style={contentLayerStyle}>

      {/* ─── DYNAMIC EDITABLE HOMEPAGE SECTIONS ─── */}
      {sectionsToRender.map((section) => {
        if (section.visible === false) return null;

        // Individual Promo Banner layout item handling
        const isPromoItem = section.type === "promo-banner" || section.bannerId || (activePromoBanners && activePromoBanners.some((b) => b.id === section.id));
        if (isPromoItem) {
          const targetBannerId = section.bannerId || section.id;
          const targetBanner = (activePromoBanners || []).find((b) => b.id === targetBannerId);
          if (!targetBanner || targetBanner.isActive === false) return null;

          return (
            <section key={section.id || targetBanner.id} style={promoSectionWrapperStyle} className="single-promo-banner-section">
              <div style={promoWideContainerStyle} className="promo-wide-container">
                <PromoBannerCard
                  banner={targetBanner}
                  onClick={(e) => {
                    e?.stopPropagation();
                    const destination = targetBanner.ctaLink || "All";
                    setSearchQuery("");
                    setActiveFilters({
                      category: destination,
                      firmness: "All",
                      size: "All",
                      sort: "Recommended"
                    });
                    navigateTo("catalog");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </section>
          );
        }

        switch (section.id) {
          case "hero-slider":
            return (
              <section key="hero-slider" style={sliderSectionStyle} aria-label="Featured mattresses">
                <div className="peek-slider" style={peekSliderTrackStyle} ref={sliderTrackRef} onScroll={handleSliderScroll}>
                  {heroSlides.map((slide) => (
                    <HeroSlideCard
                      key={slide.id}
                      slide={slide}
                      onClick={() => {
                        if (slide.isAdminBanner) {
                          setSearchQuery("");
                          setActiveFilters({ category: slide.ctaLink || "All", firmness: "All", size: "All", sort: "Recommended" });
                          navigateTo("catalog");
                        } else {
                          navigateTo("detail", slide.product?.id);
                        }
                      }}
                    />
                  ))}
                </div>
                <div style={peekDotsRowStyle} className="peek-dots">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => scrollToSlide(index)}
                      style={index === activeSlide ? { ...peekDotStyle, ...peekDotActiveStyle } : peekDotStyle}
                    />
                  ))}
                </div>
              </section>
            );

          case "shop-by-category":
            return (
              <section key="shop-by-category" style={categorySectionStyle} className="category-section">
                <div style={containerStyle}>
                  <div style={categoryHeaderStyle}>
                    <h2 style={categoryTitleStyle}>Shop By Category</h2>
                    <button type="button" onClick={() => goToCatalog("All")} style={categoryViewAllStyle} className="category-view-all">
                      View All
                    </button>
                  </div>
                  <div className="category-row" style={categoryRowStyle}>
                    {categories.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => goToCatalog(item.category, item.firmness || "All")}
                        style={{ ...categoryTileStyle, backgroundColor: item.color }}
                        className="category-tile"
                      >
                        <span style={categoryLabelStyle}>{item.label}</span>
                        <img src={item.image} alt="" style={categoryImageStyle} />
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "promo-banner":
          case "promo-banners":
            return (
              <PromotionalBannerSlider key={section.id} banners={activePromoBanners} />
            );

          case "best-sellers":
            return (
              <ProductRow
                key="best-sellers"
                title="Best Sellers"
                tagline="Loved by thousands of happy sleepers."
                products={bestSellers}
                background="#1B1F8C"
                titleColor="#00B138"
                taglineColor="#C7CBEF"
                scrollable
                variant="bestSeller"
              />
            );

          case "new-arrivals":
            return (
              <ProductRow
                key="new-arrivals"
                title="New Arrivals"
                tagline="Fresh drops, fresh comfort."
                products={newArrivals}
                onAction={() => goToCatalog("All")}
                scrollable
              />
            );

          case "customer-reviews":
            return (
              <CustomerReviewsSection key="customer-reviews" />
            );



          default:
            return null;
        }
      })}

      {/* Fallback for customer-reviews if not present in custom layout configuration */}
      {!sectionsToRender.some((s) => s.id === "customer-reviews") && (
        <CustomerReviewsSection />
      )}

      </div>


      <style>{`
        .view-more-btn:hover {
          background-color: #1B1F8C;
          color: #FFFFFF;
        }
        .category-tile:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18) !important;
        }
        .pc-wishlist-btn:hover {
          transform: scale(1.1);
        }
        .peek-slider::-webkit-scrollbar,
        .category-row::-webkit-scrollbar,
        .product-row::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .peek-slider,
        .category-row,
        .product-row {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .peek-slider {
          padding-left: 24px !important;
          scroll-padding-left: 24px !important;
        }
        @media (min-width: 640px) {
          .peek-slider {
            padding-left: 40px !important;
            scroll-padding-left: 40px !important;
          }
        }
        @media (min-width: 1024px) {
          .peek-slider {
            padding-left: 72px !important;
            scroll-padding-left: 72px !important;
          }
        }
        @media (max-width: 1199px) {
          .category-row {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            scroll-snap-type: x mandatory;
          }
          .category-row .category-tile {
            flex: 0 0 clamp(170px, 18vw, 220px) !important;
            scroll-snap-align: start;
          }
        }
        .product-row-scroll-wrap {
          position: relative;
        }
        .row-fade {
          position: absolute;
          top: 0;
          bottom: 10px;
          width: 64px;
          pointer-events: none;
          z-index: 2;
          display: none;
        }
        .row-fade-left {
          left: 0;
          background: linear-gradient(90deg, var(--row-fade-color, #FFFFFF), rgba(255, 255, 255, 0));
        }
        .row-fade-right {
          right: 0;
          background: linear-gradient(270deg, var(--row-fade-color, #FFFFFF), rgba(255, 255, 255, 0));
        }
        @media (min-width: 768px) {
          .product-row-scroll {
            display: flex !important;
            grid-template-columns: none !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 10px;
            padding-left: 64px;
            padding-right: 64px;
            scroll-padding-left: 64px;
            scroll-padding-right: 64px;
          }
          .product-row-scroll .product-item-scroll {
            flex: 0 0 260px;
            min-width: 260px;
            scroll-snap-align: start;
          }
          .row-fade {
            display: block;
          }
        }
        @media (max-width: 767px) {
          .peek-slider {
            gap: 10px !important;
            padding: 14px 16px 18px 24px !important;
          }
          .peek-slide {
            width: 82vw !important;
            height: 150px !important;
            border-radius: 16px !important;
          }
          .peek-badge {
            top: 10px !important;
            left: 10px !important;
            padding: 4px 9px !important;
            font-size: 10px !important;
          }
          .peek-slide-content {
            left: 12px !important;
            right: 76px !important;
            bottom: 12px !important;
            gap: 2px !important;
          }
          .peek-deal-text {
            font-size: 11px !important;
          }
          .peek-headline {
            font-size: 16px !important;
          }
          .peek-shop-btn {
            right: 10px !important;
            bottom: 10px !important;
            padding: 7px 12px !important;
            font-size: 11px !important;
          }
          .category-row {
            overflow-x: auto !important;
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            padding: 2px 24px 14px !important;
            margin: 0 -16px !important;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 24px !important;
            justify-content: flex-start !important;
          }
          position: relative;
        }
        .row-fade {
          position: absolute;
          top: 0;
          bottom: 10px;
          width: 64px;
          pointer-events: none;
          z-index: 2;
          display: none;
        }
        .row-fade-left {
          left: 0;
          background: linear-gradient(90deg, var(--row-fade-color, #FFFFFF), rgba(255, 255, 255, 0));
        }
        .row-fade-right {
          right: 0;
          background: linear-gradient(270deg, var(--row-fade-color, #FFFFFF), rgba(255, 255, 255, 0));
        }
        @media (min-width: 768px) {
          .product-row-scroll {
            display: flex !important;
            grid-template-columns: none !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 10px;
            padding-left: 64px;
            padding-right: 64px;
            scroll-padding-left: 64px;
            scroll-padding-right: 64px;
          }
          .product-row-scroll .product-item-scroll {
            flex: 0 0 260px;
            min-width: 260px;
            scroll-snap-align: start;
          }
          .row-fade {
            display: block;
          }
        }
        @media (max-width: 767px) {
          .peek-slider {
            gap: 10px !important;
            padding: 14px 16px 18px 24px !important;
          }
          .peek-slide {
            width: 82vw !important;
            height: 150px !important;
            border-radius: 16px !important;
          }
          .peek-badge {
            top: 10px !important;
            left: 10px !important;
            padding: 4px 9px !important;
            font-size: 10px !important;
          }
          .peek-slide-content {
            left: 12px !important;
            right: 76px !important;
            bottom: 12px !important;
            gap: 2px !important;
          }
          .peek-deal-text {
            font-size: 11px !important;
          }
          .peek-headline {
            font-size: 16px !important;
          }
          .peek-shop-btn {
            right: 10px !important;
            bottom: 10px !important;
            padding: 7px 12px !important;
            font-size: 11px !important;
          }
          .category-row {
            overflow-x: auto !important;
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            padding: 2px 24px 14px !important;
            margin: 0 -16px !important;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 24px !important;
            justify-content: flex-start !important;
          }
          .category-row .category-tile {
            flex: 0 0 clamp(154px, 52vw, 220px) !important;
            min-width: 0 !important;
            scroll-snap-align: start;
          }
          .product-row {
            overflow-x: auto !important;
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: minmax(220px, 68vw) !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            padding: 2px 24px 14px !important;
            margin: 0 -16px !important;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 24px !important;
          }
          .single-promo-banner-section {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          .promo-wide-container {
            width: calc(100% - 16px) !important;
            max-width: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          @media (max-width: 1024px) {
            .promo-wide-container {
              width: calc(100% - 16px) !important;
            }
          }
          @media (max-width: 767px) {
            .single-promo-banner-section {
              padding: 14px 0 !important;
            }
            .promo-wide-container {
              width: calc(100% - 12px) !important;
            }
          }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, tagline, action, onAction, titleColor, taglineColor, compact = false }) {
  return (
    <div style={compact ? { ...sectionHeaderStyle, marginBottom: "24px" } : sectionHeaderStyle}>
      <div style={sectionHeaderTextWrapStyle}>
        <h2 style={titleColor ? { ...sectionTitleStyle, color: titleColor } : sectionTitleStyle}>{title}</h2>
        {tagline && (
          <p style={taglineColor ? { ...sectionTaglineStyle, color: taglineColor } : sectionTaglineStyle}>
            {tagline}
          </p>
        )}
      </div>
      {action && <button onClick={onAction} style={textActionStyle}>{action}</button>}
    </div>
  );
}

function ProductRow({ title, tagline, products, onAction, background, scrollable, titleColor, taglineColor, variant }) {
  const isBestSeller = variant === "bestSeller";
  const sectionStyle = background
    ? { ...(isBestSeller ? bestSellerSectionStyle : productSectionStyle), backgroundColor: background }
    : productSectionStyle;
  const rowClassName = scrollable ? "product-row product-row-scroll" : "product-row";
  const wrapStyle = { "--row-fade-color": background || "#FFFFFF" };
  return (
    <section style={sectionStyle} className={isBestSeller ? "home-product-section best-seller-section" : "home-product-section"}>
      <div style={containerStyle}>
        <SectionHeader title={title} tagline={tagline} titleColor={titleColor} taglineColor={taglineColor} compact={isBestSeller} />
        {scrollable ? (
          <div className="product-row-scroll-wrap" style={wrapStyle}>
            <div className={rowClassName} style={productRowStyle}>
              {products.map((product) => (
                <div key={product.id} className="product-item-scroll" style={{ ...productItemStyle, height: "100%" }}>
                  <ProductCard product={product} variant={variant} />
                </div>
              ))}
            </div>
            <span className="row-fade row-fade-left" aria-hidden="true" />
            <span className="row-fade row-fade-right" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="product-row" style={productRowStyle}>
              {products.map((product) => (
                <div key={product.id} style={{ ...productItemStyle, height: "100%" }}>
                  <ProductCard product={product} variant={variant} />
                </div>
              ))}
            </div>
            <div style={viewMoreRowStyle}>
              <button type="button" onClick={onAction} style={viewMoreBtnStyle} className="view-more-btn">
                View More
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PromoCard({ image, title, label, onClick }) {
  return (
    <button onClick={onClick} style={promoCardStyle} className="promo-card">
      <img src={image} alt="" style={promoImageStyle} />
      <span style={promoContentStyle} className="promo-content">
        <span style={promoLabelStyle}>{label}</span>
        <strong style={promoTitleStyle} className="promo-title">{title}</strong>
        <span style={promoButtonStyle}>Shop Now</span>
      </span>
    </button>
  );
}

const quiltTileSVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cdefs%3E%3CradialGradient id='p' cx='50%25' cy='42%25' r='65%25'%3E%3Cstop offset='0%25' stop-color='%23FDFDFB'/%3E%3Cstop offset='70%25' stop-color='%23FAF9F5'/%3E%3Cstop offset='100%25' stop-color='%23F6F5F0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='64' height='64' fill='%23F7F7F2'/%3E%3Cpath d='M34.828,2.828 L61.172,29.172 Q64,32 61.172,34.828 L34.828,61.172 Q32,64 29.172,61.172 L2.828,34.828 Q0,32 2.828,29.172 L29.172,2.828 Q32,0 34.828,2.828 Z' fill='url(%23p)' stroke='%23EDEBE3' stroke-width='1' stroke-dasharray='1 3' stroke-linecap='round'/%3E%3C/svg%3E";

const pageWrapperStyle = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#F7F7F2",
  position: "relative",
  overflow: "hidden",
  zIndex: 0
};

const backgroundPatternLayerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  overflow: "hidden",
  pointerEvents: "none"
};

const contentLayerStyle = {
  position: "relative",
  zIndex: 1
};

const diamondPatternLayerStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage: `url("${quiltTileSVG}")`,
  backgroundSize: "64px 64px",
  backgroundRepeat: "repeat",
  opacity: 1,
  zIndex: 1,
  pointerEvents: "none"
};

const containerStyle = {
  width: "100%",
  padding: "0 48px",
  boxSizing: "border-box"
};

const promoWideContainerStyle = {
  width: "calc(100% - 16px)",
  maxWidth: "none",
  margin: "0 auto",
  padding: "0",
  boxSizing: "border-box"
};

const sliderSectionStyle = {
  backgroundColor: "#FFFFFF",
  position: "relative"
};

const promoSectionWrapperStyle = {
  padding: "20px 0 16px",
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center"
};

const peekSliderTrackStyle = {
  display: "flex",
  gap: "16px",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
  paddingTop: "20px",
  paddingRight: "24px",
  paddingBottom: "24px",
  paddingLeft: "24px",
  scrollbarWidth: "none"
};

const peekDotsRowStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  padding: "0 0 20px",
  backgroundColor: "#FFFFFF"
};

const peekDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#E7E7E2",
  cursor: "pointer",
  padding: 0,
  transition: "all 0.2s ease"
};

const peekDotActiveStyle = {
  width: "22px",
  backgroundColor: "#16A34A"
};

const peekSlideImageStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const peekSlideOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(20,21,26,0.05) 40%, rgba(20,21,26,0.62) 100%)"
};

const peekBadgeStyle = {
  position: "absolute",
  top: "16px",
  left: "16px",
  backgroundColor: "rgba(20, 21, 26, 0.55)",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "700",
  backdropFilter: "blur(2px)"
};

const peekSlideContentStyle = {
  position: "absolute",
  left: "18px",
  right: "110px",
  bottom: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const peekDealTextStyle = {
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "600",
  opacity: 0.9
};

const peekHeadlineStyle = {
  color: "#FFFFFF",
  fontSize: "22px",
  fontWeight: "800",
  lineHeight: "1.1",
  letterSpacing: "0"
};

const peekShopBtnStyle = {
  position: "absolute",
  right: "16px",
  bottom: "16px",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "9px 16px",
  fontSize: "12px",
  fontWeight: "800"
};

const categorySectionStyle = {
  padding: "28px 0 24px"
};

const categoryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "18px"
};

const categoryTitleStyle = {
  margin: 0,
  color: "#14151A",
  fontSize: "clamp(22px, 2vw, 28px)",
  fontWeight: "800",
  letterSpacing: "-0.02em"
};

const categoryViewAllStyle = {
  border: "none",
  background: "transparent",
  color: "#16A34A",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "800",
  padding: "6px 0",
  whiteSpace: "nowrap"
};

const categoryRowStyle = {
  display: "flex",
  alignItems: "stretch",
  gap: "14px",
  width: "100%"
};

const categoryTileStyle = {
  position: "relative",
  isolation: "isolate",
  containerType: "inline-size",
  overflow: "hidden",
  border: "none",
  borderRadius: "clamp(12px, 9cqi, 20px)",
  padding: "clamp(8px, 7cqi, 16px)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  flex: "1 1 0",
  minWidth: 0,
  aspectRatio: "2.8 / 1",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
};

const categoryImageStyle = {
  position: "absolute",
  zIndex: 0,
  width: "48%",
  height: "92%",
  right: "4%",
  top: "4%",
  borderRadius: "0",
  objectFit: "contain",
  objectPosition: "center",
  pointerEvents: "none",
  background: "transparent",
  border: "none",
  boxShadow: "none"
};

const categoryLabelStyle = {
  position: "relative",
  zIndex: 1,
  display: "block",
  maxWidth: "48%",
  fontSize: "clamp(11px, 7.5cqi, 15px)",
  fontWeight: "800",
  color: "#14151A",
  lineHeight: "1.2"
};

const brandHeroSectionStyle = {
  padding: "68px 0",
  backgroundColor: "#F7F7F2"
};

const wordmarkContainerStyle = {
  textAlign: "center",
  marginBottom: "36px"
};

const wordmarkStyle = {
  fontSize: "clamp(54px, 11vw, 150px)",
  lineHeight: "0.88",
  fontWeight: "800",
  letterSpacing: "0"
};

const brandTaglineStyle = {
  color: "#16A34A",
  fontSize: "15px",
  fontWeight: "700",
  marginTop: "10px"
};

const brandGridStyle = {
  display: "grid",
  gridTemplateColumns: "0.85fr 1fr",
  gap: "28px",
  alignItems: "stretch"
};

const brandCopyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "20px",
  borderTop: "1px solid #E7E7E2",
  borderBottom: "1px solid #E7E7E2",
  padding: "36px 0"
};

const brandHeadingStyle = {
  fontSize: "clamp(26px, 4vw, 42px)",
  lineHeight: "1.08",
  color: "#1B1F8C",
  letterSpacing: "0"
};

const brandImageStyle = {
  minHeight: "300px",
  overflow: "hidden",
  borderRadius: "18px"
};

const imageFillStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const outlineBtnStyle = {
  border: "1px solid #1B1F8C",
  backgroundColor: "#FFFFFF",
  color: "#1B1F8C",
  borderRadius: "999px",
  padding: "12px 22px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
};

const promoSectionStyle = {
  padding: "24px 4px"
};

const promoGridStyle = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px"
};

const singlePromoGridStyle = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "18px"
};

const promoCardStyle = {
  minHeight: "210px",
  border: "none",
  borderRadius: "6px",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  textAlign: "left",
  backgroundColor: "#1B1F8C"
};

const promoImageStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.78
};

const promoContentStyle = {
  position: "relative",
  zIndex: 1,
  minHeight: "210px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  gap: "8px",
  background: "linear-gradient(90deg, rgba(27,31,140,0.82), rgba(27,31,140,0.08))"
};

const promoLabelStyle = {
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0"
};

const promoTitleStyle = {
  color: "#FFFFFF",
  fontSize: "clamp(24px, 3vw, 34px)",
  lineHeight: "1.05",
  maxWidth: "360px"
};

const promoButtonStyle = {
  marginTop: "8px",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "9px 14px",
  fontSize: "13px",
  fontWeight: "800"
};

const productSectionStyle = {
  padding: "52px 0"
};

const bestSellerSectionStyle = {
  padding: "36px 0 32px"
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "20px"
};

const sectionHeaderTextWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const sectionTitleStyle = {
  fontSize: "clamp(24px, 4vw, 34px)",
  fontWeight: "800",
  color: "#1B1F8C",
  letterSpacing: "0"
};

const sectionTaglineStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  fontWeight: "500",
  margin: 0
};

const textActionStyle = {
  border: "none",
  background: "transparent",
  color: "#1B1F8C",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  padding: "6px 0"
};

const productRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "20px"
};

const productItemStyle = {
  minWidth: 0
};

const viewMoreRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "24px"
};

const viewMoreBtnStyle = {
  border: "1px solid #1B1F8C",
  backgroundColor: "transparent",
  color: "#1B1F8C",
  borderRadius: "999px",
};
