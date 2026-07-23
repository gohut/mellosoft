"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);

  const mattresses = useMemo(() => MOCK_PRODUCTS.filter((product) => product.category === "mattress"), []);
  const heroSlides = useMemo(() => mattresses.slice(0, 5).map((product, index) => ({
    product,
    headline: ["Classic Comfort", "Hybrid Luxury", "Natural Latex", "Firm Support", "Cooling Plush"][index] || "Sleep Better",
    deal: index === 0 ? `From ${formatPrice(product.sizePrices?.Twin || product.price)}` : index === 1 ? "Save more on hybrid" : index === 2 ? "Organic pick" : index === 3 ? "Firm favorite" : "New arrival"
  })), [mattresses]);
  const bestSellers = useMemo(() => [...MOCK_PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5), []);
  const newArrivals = useMemo(() => MOCK_PRODUCTS.filter((product) => ["New", "Premium", "Eco-Friendly", "Essential"].includes(product.badge)).slice(0, 5), []);
  const topRated = useMemo(() => [...MOCK_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 5), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const goToNextSlide = () => setActiveSlide((current) => (current + 1) % heroSlides.length);
  const goToPrevSlide = () => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);

  const handleSlideTouchStart = (event) => {
    touchStartXRef.current = event.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleSlideTouchMove = (event) => {
    touchDeltaXRef.current = event.touches[0].clientX - touchStartXRef.current;
  };

  const handleSlideTouchEnd = () => {
    const delta = touchDeltaXRef.current;
    const swipeThreshold = 40;
    if (delta > swipeThreshold) {
      goToPrevSlide();
    } else if (delta < -swipeThreshold) {
      goToNextSlide();
    }
    touchDeltaXRef.current = 0;
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
  };

  const goToProduct = (productId) => {
    navigateTo("detail", productId);
  };

  return (
    <div style={pageWrapperStyle}>
      <section style={sliderSectionStyle} aria-label="Featured mattresses">
        <div
          className="hero-slider"
          style={heroTrackStyle}
          onTouchStart={handleSlideTouchStart}
          onTouchMove={handleSlideTouchMove}
          onTouchEnd={handleSlideTouchEnd}
        >
          {heroSlides.map((slide, index) => (
            <article
              key={slide.product.id}
              style={{
                ...heroSlideStyle,
                transform: `translateX(${(index - activeSlide) * 100}%)`,
                opacity: index === activeSlide ? 1 : 0
              }}
              aria-hidden={index !== activeSlide}
            >
              <img src={slide.product.images[0]} alt={slide.product.name} style={heroSlideImageStyle} />
              <div style={heroOverlayStyle} />
              <div style={heroContentStyle}>
                <span style={dealTagStyle}>{slide.deal}</span>
                <h1 style={heroHeadlineStyle}>{slide.headline}</h1>
                <button onClick={() => goToProduct(slide.product.id)} style={shopNowBtnStyle}>
                  Shop Now
                </button>
              </div>
            </article>
          ))}

          <button onClick={goToPrevSlide} style={{ ...heroArrowStyle, left: "24px" }} className="desktop-arrow" aria-label="Previous slide">
            <Arrow direction="left" />
          </button>
          <button onClick={goToNextSlide} style={{ ...heroArrowStyle, right: "24px" }} className="desktop-arrow" aria-label="Next slide">
            <Arrow />
          </button>
        </div>

        <div style={dotsContainerStyle}>
          {heroSlides.map((slide, index) => (
            <button
              key={slide.product.id}
              onClick={() => setActiveSlide(index)}
              style={{
                ...dotButtonStyle,
                backgroundColor: activeSlide === index ? "#16A34A" : "rgba(255, 255, 255, 0.72)"
              }}
              aria-label={`Show ${slide.product.name}`}
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

      <ProductRow title="Featured Mattresses" products={mattresses} onAction={() => goToCatalog("mattress")} />
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
        @media (max-width: 767px) {
          .hero-slider {
            height: 460px !important;
          }
          .desktop-arrow {
            display: none !important;
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

function Arrow({ direction = "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? (
        <>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </>
      ) : (
        <>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </>
      )}
    </svg>
  );
}

const pageWrapperStyle = {
  width: "100%",
  backgroundColor: "#F7F7F2"
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

const heroTrackStyle = {
  position: "relative",
  height: "520px",
  overflow: "hidden",
  backgroundColor: "#F7F7F2",
  touchAction: "pan-y"
};

const heroSlideStyle = {
  position: "absolute",
  inset: 0,
  transition: "transform 0.55s ease, opacity 0.35s ease"
};

const heroSlideImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const heroOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(90deg, rgba(27, 31, 140, 0.70), rgba(27, 31, 140, 0.10) 62%, rgba(20, 21, 26, 0.12))"
};

const heroContentStyle = {
  position: "absolute",
  left: "clamp(22px, 8vw, 96px)",
  bottom: "clamp(34px, 7vw, 74px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "13px",
  maxWidth: "min(520px, calc(100% - 44px))"
};

const dealTagStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "13px",
  fontWeight: "800",
};

const heroHeadlineStyle = {
  color: "#FFFFFF",
  fontSize: "clamp(34px, 7vw, 74px)",
  lineHeight: "0.98",
  fontWeight: "800",
  textShadow: "0 4px 18px rgba(0, 0, 0, 0.22)",
  letterSpacing: "0"
};

const shopNowBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "13px 26px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
};

const heroArrowStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  border: "1px solid #E7E7E2",
  backgroundColor: "rgba(255, 255, 255, 0.86)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const dotsContainerStyle = {
  position: "absolute",
  left: "50%",
  bottom: "16px",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "8px"
};

const dotButtonStyle = {
  width: "8px",
  height: "8px",
  border: "none",
  borderRadius: "999px",
  cursor: "pointer"
};

const categorySectionStyle = {
  padding: "30px 0",
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #E7E7E2"
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
  padding: "8px 4px",
  backgroundColor: "#FFFFFF"
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
  padding: "52px 0",
  backgroundColor: "#F7F7F2",
  borderTop: "1px solid #E7E7E2"
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
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #E7E7E2",
  borderBottom: "1px solid #E7E7E2"
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