"use client";

import React, { useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import { formatPrice } from "../utils/currency";

const categories = [
  { label: "Memory Foam", category: "mattress", image: "/asset/img1.jpg" },
  { label: "Hybrid", category: "mattress", image: "/asset/img2.jpg" },
  { label: "Firm", category: "mattress", image: "/asset/texture.png", firmness: "Firm" },
  { label: "Pillows", category: "pillows", image: "/asset/pillow.png" },
  { label: "Bed Frames", category: "bed frames", image: "/asset/bedframe.png" },
  { label: "Protectors", category: "protectors", image: "/asset/texture.png" }
];

export default function HomeView() {
  const { navigateTo, setActiveFilters, setSearchQuery } = useStore();
  const sliderTrackRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const mattresses = useMemo(() => MOCK_PRODUCTS.filter((product) => product.category === "mattress"), []);
  const heroSlides = useMemo(() => mattresses.slice(0, 5).map((product, index) => ({
    product,
    badge: index === 0 ? "Limited time!" : index === 1 ? "Ends soon" : index === 2 ? "New" : index === 3 ? "Best seller" : "Just dropped",
    headline: ["Classic Comfort", "Hybrid Luxury", "Natural Latex", "Firm Support", "Cooling Plush"][index] || "Sleep Better",
    deal: index === 0 ? `From ${formatPrice(product.sizePrices?.Twin || product.price)}` : index === 1 ? "Save more on hybrid" : index === 2 ? "Organic pick" : index === 3 ? "Firm favorite" : "New arrival"
  })), [mattresses]);
  const bestSellers = useMemo(() => [...MOCK_PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5), []);
  const newArrivals = useMemo(() => MOCK_PRODUCTS.filter((product) => ["New", "Premium", "Eco-Friendly", "Essential"].includes(product.badge)).slice(0, 5), []);
  const topRated = useMemo(() => [...MOCK_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 5), []);

  const goToCatalog = (category = "All", firmness = "All") => {
    setSearchQuery("");
    setActiveFilters({
      category,
      firmness,
      size: "All",
      sort: "Recommended"
    });
    navigateTo("catalog");
  };

  const goToProduct = (productId) => {
    navigateTo("detail", productId);
  };

  const handleSliderScroll = () => {
    const track = sliderTrackRef.current;
    if (!track) return;
    const { scrollLeft, children } = track;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(children).forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveSlide(closestIndex);
  };

  const scrollToSlide = (index) => {
    const track = sliderTrackRef.current;
    if (!track) return;
    const child = track.children[index];
    if (child) {
      track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div className="row-scanner" aria-hidden="true" style={rowScannerStyle} />
      <div className="quilt-shine" aria-hidden="true" />

      <section style={sliderSectionStyle} aria-label="Featured mattresses">
        <div className="peek-slider" style={peekSliderTrackStyle} ref={sliderTrackRef} onScroll={handleSliderScroll}>
          {heroSlides.map((slide) => (
            <button
              key={slide.product.id}
              className="peek-slide"
              style={peekSlideCardStyle}
              onClick={() => goToProduct(slide.product.id)}
            >
              <img src={slide.product.images[0]} alt={slide.product.name} style={peekSlideImageStyle} />
              <div style={peekSlideOverlayStyle} />
              <span style={peekBadgeStyle} className="peek-badge">{slide.badge}</span>
              <div style={peekSlideContentStyle} className="peek-slide-content">
                <span style={peekDealTextStyle} className="peek-deal-text">{slide.deal}</span>
                <h3 style={peekHeadlineStyle} className="peek-headline">{slide.headline}</h3>
              </div>
              <span style={peekShopBtnStyle} className="peek-shop-btn">Shop Now</span>
            </button>
          ))}
        </div>
        <div style={peekDotsRowStyle} className="peek-dots">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.product.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => scrollToSlide(index)}
              style={index === activeSlide ? { ...peekDotStyle, ...peekDotActiveStyle } : peekDotStyle}
            />
          ))}
        </div>
      </section>

      <section style={categorySectionStyle} className="category-section">
        <div style={containerStyle}>
          <SectionHeader title="Shop by Category" action="All products" onAction={() => goToCatalog("All")} />
          <div className="category-row" style={categoryRowStyle}>
            {categories.map((item) => (
              <button key={item.label} onClick={() => goToCatalog(item.category, item.firmness || "All")} style={categoryTileStyle}>
                <span style={categoryImageWrapStyle}>
                  <img src={item.image} alt="" style={categoryImageStyle} />
                </span>
                <span style={categoryLabelStyle}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ProductRow title="Featured Mattresses" products={mattresses} onAction={() => goToCatalog("mattress")} />

      <section style={promoSectionStyle}>
        <div style={singlePromoGridStyle} className="promo-grid">
          <PromoCard
            image="/asset/img2.jpg"
            title="Enjoy 60% savings"
            label="Limited mattress event"
            onClick={() => goToCatalog("mattress")}
          />
        </div>
      </section>

      <ProductRow title="Best Sellers" products={bestSellers} onAction={() => goToCatalog("All")} />

      <section style={promoSectionStyle}>
        <div style={singlePromoGridStyle} className="promo-grid">
          <PromoCard
            image="/asset/pillow.png"
            title="Get 30% off essentials"
            label="Pillows and protectors"
            onClick={() => goToCatalog("pillows")}
          />
        </div>
      </section>

      <ProductRow title="New Arrivals" products={newArrivals} onAction={() => goToCatalog("All")} />

      <section style={promoSectionStyle}>
        <div style={singlePromoGridStyle} className="promo-grid">
          <PromoCard
            image="/asset/bedframe.png"
            title="Free assembly included"
            label="New bed frame collection"
            onClick={() => goToCatalog("bed frames")}
          />
        </div>
      </section>

      <ProductRow title="Top Rated" products={topRated} onAction={() => goToCatalog("All")} />

      <section style={whySectionStyle}>
        <div style={whyStripStyle} className="why-strip">
          <Feature icon="shield" title="100-Night Trial" />
          <Feature icon="truck" title="Free Delivery" />
          <Feature icon="star" title="10-Year Warranty" />
        </div>
      </section>

      <section id="about-section" style={aboutSectionStyle}>
        <div style={containerStyle}>
          <div style={aboutGridStyle} className="about-grid">
            <div style={aboutImagesStyle}>
              <img src="/asset/img2.jpg" alt="Mellosoft bedroom setting" style={aboutImageLargeStyle} />
              <img src="/asset/texture.png" alt="Mellosoft textile texture" style={aboutImageSmallStyle} />
            </div>
            <div style={aboutCopyStyle}>
              <span style={eyebrowStyle}>About Us</span>
              <h2 style={aboutHeadingStyle}>Elegant sleep products for sophisticated lifestyles</h2>
              <p style={aboutParagraphStyle}>
                We create sleep products with thoughtful architecture, clean lines, and meticulous attention to detail for those who choose comfort as a core part of daily life.
              </p>
              <p style={aboutParagraphStyle}>
                Mellosoft mattresses are built to feel naturally cooling, look tailored, and support the body with premium foam, natural latex, bamboo, and pocketed coil systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .row-scanner {
          animation: rowScanTravel 12s linear infinite;
        }
        @keyframes rowScanTravel {
          0% {
            top: 0%;
            opacity: 0;
          }
          4% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .quilt-shine {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: linear-gradient(
            180deg,
            rgba(22, 163, 74, 0) 0%,
            rgba(22, 163, 74, 0.16) 42%,
            rgba(22, 163, 74, 0.26) 50%,
            rgba(22, 163, 74, 0.16) 58%,
            rgba(22, 163, 74, 0) 100%
          );
          background-repeat: no-repeat;
          background-size: 100% 38%;
          background-position: 0% -40%;
          mix-blend-mode: soft-light;
          animation: quiltShineSweep 3s linear infinite;
        }
        @keyframes quiltShineSweep {
          0% {
            background-position: 0% -40%;
          }
          100% {
            background-position: 0% 140%;
          }
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
          .category-row,
          .product-row {
            overflow-x: auto !important;
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: minmax(220px, 68vw) !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            padding: 2px 16px 14px !important;
            margin: 0 -16px !important;
            scroll-snap-type: x mandatory;
          }
          .category-row {
            grid-auto-columns: 92px !important;
          }
          .product-row > * {
            scroll-snap-align: start;
          }
          .home-product-section {
            padding: 36px 0 !important;
          }
          .home-product-section > div,
          .category-section > div {
            padding: 0 16px !important;
          }
          .brand-grid,
          .promo-grid,
          .about-grid {
            grid-template-columns: 1fr !important;
          }
          .why-strip {
            gap: 4px !important;
          }
          .why-strip .feature-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .why-strip .feature-title {
            font-size: 11px !important;
          }
          .promo-grid {
            gap: 14px !important;
          }
          .promo-card {
            min-height: 138px !important;
            border-radius: 6px !important;
          }
          .promo-content {
            min-height: 138px !important;
            padding: 18px !important;
          }
          .promo-title {
            font-size: 22px !important;
            max-width: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={sectionHeaderStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {action && <button onClick={onAction} style={textActionStyle}>{action}</button>}
    </div>
  );
}

function ProductRow({ title, products, onAction }) {
  return (
    <section style={productSectionStyle} className="home-product-section">
      <div style={containerStyle}>
        <SectionHeader title={title} action="View all" onAction={onAction} />
        <div className="product-row" style={productRowStyle}>
          {products.map((product) => (
            <div key={product.id} style={productItemStyle}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
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

function Feature({ icon, title }) {
  return (
    <div style={featureItemStyle}>
      <span style={featureIconStyle} className="feature-icon">
        {icon === "truck" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
        )}
        {icon === "shield" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        )}
        {icon === "star" && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        )}
      </span>
      <strong style={featureTitleStyle} className="feature-title">{title}</strong>
    </div>
  );
}

const quiltTileSVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cdefs%3E%3CradialGradient id='p' cx='50%25' cy='42%25' r='65%25'%3E%3Cstop offset='0%25' stop-color='%23FDFDFB'/%3E%3Cstop offset='70%25' stop-color='%23FAF9F5'/%3E%3Cstop offset='100%25' stop-color='%23F6F5F0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='64' height='64' fill='%23F7F7F2'/%3E%3Cpath d='M34.828,2.828 L61.172,29.172 Q64,32 61.172,34.828 L34.828,61.172 Q32,64 29.172,61.172 L2.828,34.828 Q0,32 2.828,29.172 L29.172,2.828 Q32,0 34.828,2.828 Z' fill='url(%23p)' stroke='%23EDEBE3' stroke-width='1' stroke-dasharray='1 3' stroke-linecap='round'/%3E%3C/svg%3E";

const quiltRowGreenSVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M34.828,2.828 L61.172,29.172 Q64,32 61.172,34.828 L34.828,61.172 Q32,64 29.172,61.172 L2.828,34.828 Q0,32 2.828,29.172 L29.172,2.828 Q32,0 34.828,2.828 Z' fill='none' stroke='%2316A34A' stroke-width='1.5' stroke-dasharray='1 3' stroke-linecap='round'/%3E%3C/svg%3E";

const pageWrapperStyle = {
  width: "100%",
  backgroundColor: "#F7F7F2",
  backgroundImage: `url("${quiltTileSVG}")`,
  backgroundSize: "64px 64px",
  backgroundRepeat: "repeat",
  position: "relative",
  zIndex: 0
};

const rowScannerStyle = {
  position: "absolute",
  left: 0,
  width: "100%",
  height: "64px",
  backgroundImage: `url("${quiltRowGreenSVG}")`,
  backgroundSize: "64px 64px",
  backgroundRepeat: "repeat-x",
  filter: "drop-shadow(0 0 3px rgba(22, 163, 74, 0.55))",
  zIndex: -1,
  pointerEvents: "none"
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px"
};

const sliderSectionStyle = {
  backgroundColor: "#FFFFFF",
  position: "relative"
};

/* Small, peeking, horizontally-scrollable slider.
   Mobile: tiny rounded "container" cards, next card peeking on the edge.
   Desktop: identical shape/behavior, scaled up. */
const peekSliderTrackStyle = {
  display: "flex",
  gap: "16px",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
  padding: "20px 24px 24px 40px",
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

const peekSlideCardStyle = {
  position: "relative",
  flex: "0 0 auto",
  width: "560px",
  height: "260px",
  borderRadius: "22px",
  overflow: "hidden",
  border: "none",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  scrollSnapAlign: "start",
  backgroundColor: "#14151A"
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
  padding: "30px 0",
  backgroundColor: "#FFFFFF"
};

const categoryRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "14px"
};

const categoryTileStyle = {
  border: "none",
  backgroundColor: "transparent",
  borderRadius: 0,
  padding: "12px 8px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "9px"
};

const categoryImageWrapStyle = {
  width: "62px",
  height: "62px",
  borderRadius: "14px",
  overflow: "hidden",
  backgroundColor: "#F7F7F2"
};

const categoryImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const categoryLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1B1F8C",
  textAlign: "center"
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
  maxWidth: "1200px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px"
};

const singlePromoGridStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
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

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px"
};

const sectionTitleStyle = {
  fontSize: "clamp(24px, 4vw, 34px)",
  fontWeight: "800",
  color: "#1B1F8C",
  letterSpacing: "0"
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

const whySectionStyle = {
  padding: "14px 16px",
  backgroundColor: "#FFFFFF"
};

const whyStripStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px"
};

const featureItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "4px"
};

const featureIconStyle = {
  display: "flex",
  alignItems: "center"
};

const featureTitleStyle = {
  fontSize: "14px",
  color: "#1B1F8C"
};

const aboutSectionStyle = {
  padding: "70px 0 82px",
  backgroundColor: "#FFFFFF"
};

const aboutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.05fr 0.95fr",
  gap: "48px",
  alignItems: "center"
};

const aboutImagesStyle = {
  display: "grid",
  gridTemplateColumns: "1.25fr 0.75fr",
  gap: "18px",
  alignItems: "center"
};

const aboutImageLargeStyle = {
  width: "100%",
  height: "390px",
  objectFit: "cover",
  borderRadius: "18px"
};

const aboutImageSmallStyle = {
  width: "100%",
  height: "270px",
  objectFit: "cover",
  borderRadius: "18px"
};

const aboutCopyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const eyebrowStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#16A34A",
  textTransform: "uppercase",
  letterSpacing: "0"
};

const aboutHeadingStyle = {
  fontSize: "clamp(28px, 4vw, 42px)",
  lineHeight: "1.1",
  color: "#1B1F8C",
  letterSpacing: "0"
};

const aboutParagraphStyle = {
  fontSize: "15px",
  color: "#6B6B75",
  lineHeight: "1.65"
};