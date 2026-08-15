"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { MOCK_PRODUCTS } from "../data/products";
import { MOCK_REVIEWS } from "../admin/data/adminMockData";
import RatingStars from "../components/RatingStars";
import FirmnessSizeSelector from "../components/FirmnessSizeSelector";
import QuantityStepper from "../components/QuantityStepper";
import ProductCard from "../components/ProductCard";
import { formatPrice, calculateDiscountedPrice } from "../utils/currency";
import { getVariantForSelection } from "../utils/variantHelpers";

export default function ProductDetailView() {
  const { 
    selectedProductId, 
    getProductById, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    navigateTo,
    cart
  } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const product = useMemo(() => getProductById(selectedProductId) || MOCK_PRODUCTS[0], [getProductById, selectedProductId]);

  // Gallery Active Image
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const swipeMovedRef = useRef(false);

  // Selector options states
  const [selectedFirmness, setSelectedFirmness] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Tab state: "details" | "reviews" | "discussion"
  const [activeTab, setActiveTab] = useState("reviews");

  // Reset states when product changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!product) return;
      setSelectedFirmness((product.availableFirmness || product.firmnessOptions || product.firmness)?.[0] || "Medium");
      setSelectedSize((product.availableSizes || product.sizeOptions || product.sizes)?.[0] || "Twin");
      setQuantity(1);
      setActiveImgIndex(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [product]);

  // Resolve exact variant matching selectedSize + selectedFirmness
  const selectedVariant = useMemo(() => {
    return getVariantForSelection(product, selectedSize, selectedFirmness);
  }, [product, selectedSize, selectedFirmness]);

  const discountPercent = useMemo(() => {
    const d = product?.discountPercent ?? product?.Discount_Percentage;
    return typeof d === "number" ? d : 10;
  }, [product]);

  const actualPriceForSize = useMemo(() => {
    if (selectedVariant && selectedVariant.Actual_Price !== undefined) {
      return Number(selectedVariant.Actual_Price);
    }
    if (product.firmnessPrices && product.firmnessPrices[selectedFirmness]) {
      return Number(product.firmnessPrices[selectedFirmness]);
    }
    if (product.sizePrices && product.sizePrices[selectedSize]) {
      return Number(product.sizePrices[selectedSize]);
    }
    return Number(product.Actual_Price ?? product.price);
  }, [product, selectedVariant, selectedSize, selectedFirmness]);

  const discountedPriceForSize = useMemo(() => {
    return calculateDiscountedPrice(actualPriceForSize, discountPercent);
  }, [actualPriceForSize, discountPercent]);

  const isVariantOutOfStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.Stock === 0 || selectedVariant.Status === "Out of Stock";
    }
    return false;
  }, [selectedVariant]);

  // Compute public approved reviews
  const approvedReviews = useMemo(() => {
    if (!product) return [];

    let adminReviewsList = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mellosoft_reviews");
        if (saved) {
          adminReviewsList = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse mellosoft_reviews in ProductDetailView:", e);
      }
    }

    if (!adminReviewsList || adminReviewsList.length === 0) {
      adminReviewsList = MOCK_REVIEWS || [];
    }

    const adminApprovedMatches = adminReviewsList
      .filter((r) => {
        const matchesProduct =
          r.productId === product.id ||
          (r.product && r.product.toLowerCase().includes((product.name || "").toLowerCase())) ||
          (product.Product_Name && r.product && r.product.toLowerCase() === product.Product_Name.toLowerCase());
        
        return matchesProduct && r.status === "Approved";
      })
      .map((r) => ({
        id: r.id,
        author: r.customer || r.customerName || "Anonymous",
        rating: Number(r.rating || 5),
        date: r.date,
        content: r.review || r.comment || "",
        helpfulCount: r.helpfulCount || 12,
        replyCount: r.replyCount || 0,
      }));

    const allAdminReviewIds = new Set(adminReviewsList.map((r) => r.id));
    const notApprovedAdminIds = new Set(
      adminReviewsList.filter((r) => r.status !== "Approved").map((r) => r.id)
    );

    const baseProductReviews = (product.reviews || []).filter((r) => {
      if (allAdminReviewIds.has(r.id)) {
        return !notApprovedAdminIds.has(r.id);
      }
      return true;
    });

    const combined = [...adminApprovedMatches];
    baseProductReviews.forEach((b) => {
      if (!combined.some((c) => c.id === b.id || (c.author === b.author && c.content === b.content))) {
        combined.push(b);
      }
    });

    return combined;
  }, [product]);

  // Compute rating stats
  const ratingStats = useMemo(() => {
    const reviews = approvedReviews || [];
    const total = reviews.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    let sum = 0;
    reviews.forEach((r) => {
      const rRating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[rRating] = (counts[rRating] || 0) + 1;
      sum += (r.rating || 5);
    });

    const averageRating = total > 0 ? (sum / total).toFixed(1) : (product?.rating || "5.0");

    return {
      total,
      averageRating,
      breakdown: Object.keys(counts).reduce((acc, rating) => {
        acc[rating] = total > 0 ? Math.round((counts[rating] / total) * 100) : 0;
        return acc;
      }, {}),
      counts
    };
  }, [approvedReviews, product]);

  const handleAddToCart = () => {
    if (isVariantOutOfStock) return;
    addToCart(product, selectedFirmness, selectedSize, quantity);
  };

  const goBackToCatalog = () => {
    navigateTo("catalog");
  };

  const handleBuyNow = () => {
    if (isVariantOutOfStock) return;
    addToCart(product, selectedFirmness, selectedSize, quantity);
    navigateTo("cart");
  };

  const showPreviousImage = () => {
    setActiveImgIndex((current) => (current - 1 + product.images.length) % product.images.length);
  };

  const showNextImage = () => {
    setActiveImgIndex((current) => (current + 1) % product.images.length);
  };

  const handleImageTouchEnd = (event) => {
    if (touchStartX === null) return;
    const deltaX = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 45) {
      swipeMovedRef.current = true;
      if (deltaX > 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
      window.setTimeout(() => {
        swipeMovedRef.current = false;
      }, 160);
    }
    setTouchStartX(null);
  };

  const handleMainImageClick = () => {
    if (swipeMovedRef.current) return;
    setViewerOpen(true);
  };

  const isWishlisted = wishlist.includes(product.id);

  // Filter out current product for "You may also like"
  const recommendations = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
  }, [product]);

  return (
    <div style={detailContainerStyle} className="detail-page">
      
      {/* Breadcrumb */}
      <div style={breadcrumbStyle} className="detail-breadcrumb">
        <span onClick={() => navigateTo("home")} style={breadcrumbLinkStyle}>Home</span>
        <span style={breadcrumbDividerStyle}>/</span>
        <span onClick={() => navigateTo("catalog")} style={breadcrumbLinkStyle}>Catalog</span>
        <span style={breadcrumbDividerStyle}>/</span>
        <span style={breadcrumbActiveStyle}>{product.name}</span>
      </div>

      {/* Main Details Section */}
      <div style={mainLayoutGridStyle} className="detail-main-grid">
        
        {/* Left Column: Image Gallery */}
        <div style={galleryColStyle}>
          <div
            style={mainImageWrapperStyle}
            className="detail-main-image"
            onClick={handleMainImageClick}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleImageTouchEnd}
          >
            <img 
              src={product.images[activeImgIndex] || product.images[0]} 
              alt={product.name} 
              style={mainImageStyle} 
              className="detail-gallery-img"
            />

            <div style={floatingActionsWrapStyle} className="detail-floating-actions">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  goBackToCatalog();
                }}
                style={floatingIconBtnStyle}
                aria-label="Go back"
              >
                <ArrowLeftIcon />
              </button>

              <div style={floatingRightActionsStyle}>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  style={floatingIconBtnStyle}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon filled={isWishlisted} />
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    navigateTo("cart");
                  }}
                  style={floatingIconBtnStyle}
                  aria-label="Open cart"
                >
                  <span style={{ position: "relative", display: "flex" }}>
                    <CartIcon />
                    {cartCount > 0 && <span style={floatingCartBadgeStyle}>{cartCount}</span>}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Thumbnail strip */}
          <div style={thumbnailStripStyle} className="desktop-thumbnails">
            {product.images.map((img, index) => (
              <div 
                key={index} 
                onClick={() => setActiveImgIndex(index)}
                style={{
                  ...thumbnailWrapperStyle,
                  borderColor: activeImgIndex === index ? "#1B1F8C" : "#E7E7E2",
                  transform: activeImgIndex === index ? "scale(1.02)" : "scale(1)"
                }}
              >
                <img src={img} alt={`${product.name} View ${index + 1}`} style={thumbnailImageStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Configuration */}
        <div style={configColStyle}>
          
          <span style={brandLabelStyle}>Mellosoft Premium Series</span>
          <h2 style={titleStyle}>{product.name}</h2>
          
          {/* Rating summary overlay */}
          <div style={ratingSummaryLineStyle}>
            <RatingStars rating={product.rating} count={product.reviewCount} />
          </div>

          <div style={priceContainerStyle}>
            <span style={priceStyle}>{formatPrice(discountedPriceForSize)}</span>
            {discountPercent > 0 && actualPriceForSize > discountedPriceForSize && (
              <span style={{ fontSize: "14px", color: "#6B6B75", alignSelf: "center", marginLeft: "10px" }}>
                MRP: {formatPrice(actualPriceForSize)} ({discountPercent}% OFF)
              </span>
            )}
            {isVariantOutOfStock && (
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626", backgroundColor: "#FEE2E2", padding: "4px 10px", borderRadius: "999px", marginLeft: "10px", alignSelf: "center" }}>
                Out of Stock
              </span>
            )}
          </div>
          
          <div style={dividerStyle} />

          <div style={optionControlsRowStyle} className="detail-option-row">
            <FirmnessSizeSelector
              label="Firmness"
              options={product.firmnessOptions}
              selected={selectedFirmness}
              onChange={setSelectedFirmness}
            />

            <FirmnessSizeSelector
              label="Size"
              options={product.sizeOptions}
              selected={selectedSize}
              onChange={setSelectedSize}
            />

            <div style={qtyFieldStyle} className="detail-option-control detail-qty-field">
              <label style={qtyLabelStyle}>Quantity</label>
              <QuantityStepper qty={quantity} onChange={setQuantity} />
            </div>
          </div>

          {/* Quantity & CTA buttons block */}
          <div style={purchaseBlockStyle}>
            <div style={ctaButtonsGridStyle} className="detail-cta-grid">
              <button 
                onClick={handleAddToCart}
                disabled={isVariantOutOfStock}
                style={{
                  ...addCartBtnStyle,
                  opacity: isVariantOutOfStock ? 0.5 : 1,
                  cursor: isVariantOutOfStock ? "not-allowed" : "pointer",
                }}
              >
                {isVariantOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={isVariantOutOfStock}
                style={{
                  ...buyNowBtnStyle,
                  opacity: isVariantOutOfStock ? 0.5 : 1,
                  cursor: isVariantOutOfStock ? "not-allowed" : "pointer",
                }}
              >
                Buy Now
              </button>
            </div>

            <p style={descriptionStyle}>{product.description}</p>
          </div>

          <div style={deliveryBoxStyle}>
            <div style={deliveryItemStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span style={deliveryTextStyle}>Free shipping on orders over ₹30</span>
            </div>
            <div style={deliveryItemStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={deliveryTextStyle}>100-night trial with free pickups and full refunds</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RECOMMENDED CAROUSEL ================= */}
      <section style={carouselSectionStyle}>
        <h3 style={carouselHeadingStyle}>You may also like</h3>
        <div style={recommendationsGridStyle} className="recommendations-row">
          {recommendations.map((rec) => (
            <div key={rec.id} style={{ flex: "1 1 280px" }}>
              <ProductCard product={rec} />
            </div>
          ))}
        </div>
      </section>

      {/* Tabbed Info & Reviews Section */}
      <section style={tabbedSectionStyle}>
        
        {/* Tab Header Selector */}
        <div style={tabHeaderStyle} className="detail-tab-header">
          <button 
            onClick={() => setActiveTab("details")}
            style={{ ...tabBtnStyle, borderBottomColor: activeTab === "details" ? "#1B1F8C" : "transparent", color: activeTab === "details" ? "#1B1F8C" : "#6B6B75" }}
          >
            Product details
          </button>
          <button 
            onClick={() => setActiveTab("reviews")}
            style={{ ...tabBtnStyle, borderBottomColor: activeTab === "reviews" ? "#1B1F8C" : "transparent", color: activeTab === "reviews" ? "#1B1F8C" : "#6B6B75" }}
          >
            Customer Reviews ({ratingStats.total})
          </button>
          <button 
            onClick={() => setActiveTab("discussion")}
            style={{ ...tabBtnStyle, borderBottomColor: activeTab === "discussion" ? "#1B1F8C" : "transparent", color: activeTab === "discussion" ? "#1B1F8C" : "#6B6B75" }}
          >
            Q&A
          </button>
        </div>

        {/* Tab Panels */}
        <div style={tabPanelWrapperStyle}>
          
          {activeTab === "details" && (
            <div style={detailsPanelStyle}>
              <h4 style={panelHeaderStyle}>Engineering Specifications</h4>
              <ul style={featuresListStyle}>
                {product.features?.map((f, i) => (
                  <li key={i} style={featureItemStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" style={{ marginRight: "10px", flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: "14.5px", color: "#6B6B75", marginTop: "16px" }}>
                Specs: {product.specs}
              </p>
            </div>
          )}

          {activeTab === "discussion" && (
            <div style={{ padding: "10px 0" }}>
              <h4 style={panelHeaderStyle}>Product Questions & Answers</h4>
              <p style={{ fontSize: "14.5px", color: "#6B6B75" }}>
                Have questions about the {product.name}? Ask our community or sleeping engineers.
              </p>
              
              <div style={mockQuestionStyle}>
                <h5 style={{ fontWeight: "700", color: "#1B1F8C" }}>Q: How long does the mattress take to expand fully?</h5>
                <p style={{ color: "#6B6B75", marginTop: "4px" }}>A: It expands to 95% of its height within 2 hours. However, we recommend letting it breath for 24 hours to reach full firmness and release any minor compressed packaging scent.</p>
              </div>

              <div style={mockQuestionStyle}>
                <h5 style={{ fontWeight: "700", color: "#1B1F8C" }}>Q: Can I use this mattress on an adjustable bed frame?</h5>
                <p style={{ color: "#6B6B75", marginTop: "4px" }}>A: Yes! All Mellosoft mattress designs are completely compatible with adjustable bases, slatted platforms, and traditional box springs.</p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={reviewsGridStyle} className="detail-reviews-grid">
              
              {/* Left Column: Reviews List */}
              <div style={reviewsListColStyle}>
                {approvedReviews && approvedReviews.length > 0 ? (
                  approvedReviews.map((rev) => (
                    <div key={rev.id} style={reviewCardStyle}>
                      <div style={reviewHeaderStyle}>
                        <div style={avatarStyle}>
                          {(rev.author || "A").split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h5 style={{ fontWeight: "700", color: "#14151A" }}>{rev.author}</h5>
                          <span style={{ fontSize: "11px", color: "#6B6B75" }}>{rev.date}</span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <RatingStars rating={rev.rating} />
                        </div>
                      </div>
                      <p style={reviewBodyStyle}>{rev.content}</p>
                      
                      <div style={reviewFooterStyle}>
                        <button style={reviewActionBtnStyle}>
                          Helpful ({rev.helpfulCount})
                        </button>
                        <button style={reviewActionBtnStyle}>
                          Reply {rev.replyCount > 0 ? `(${rev.replyCount})` : ""}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#6B6B75" }}>No reviews yet. Be the first to sleep and leave feedback!</p>
                )}
              </div>

              {/* Right Column: Rating Summary Breakdown Panel */}
              <div style={summaryPanelColStyle}>
                <div style={summaryCardStyle}>
                  <h4 style={summaryHeaderStyle}>Customer Reviews</h4>
                  
                  <div style={summaryScoreBlockStyle}>
                    <span style={bigScoreStyle}>{ratingStats.averageRating}</span>
                    <RatingStars rating={Number(ratingStats.averageRating)} />
                    <span style={reviewsCountTextStyle}>Based on {ratingStats.total} reviews</span>
                  </div>

                  <div style={breakdownContainerStyle}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const pct = ratingStats.breakdown[stars] || 0;
                      return (
                        <div key={stars} style={breakdownRowStyle}>
                          <span style={breakdownLabelStyle}>{stars} ★</span>
                          <div style={barBgStyle}>
                            <div 
                              style={{ 
                                ...barFillStyle, 
                                width: `${pct}%`,
                                backgroundColor: stars >= 4 ? "#16A34A" : "#1B1F8C" 
                              }} 
                            />
                          </div>
                          <span style={breakdownValueStyle}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {viewerOpen && (
        <div
          style={viewerOverlayStyle}
          className="image-viewer"
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={handleImageTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
        >
          <button onClick={() => setViewerOpen(false)} style={viewerCloseBtnStyle} aria-label="Close image viewer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button onClick={showPreviousImage} style={{ ...viewerNavBtnStyle, left: "14px" }} aria-label="Previous image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <img src={product.images[activeImgIndex] || product.images[0]} alt={product.name} style={viewerImageStyle} />

          <button onClick={showNextImage} style={{ ...viewerNavBtnStyle, right: "14px" }} aria-label="Next image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <span style={viewerCountStyle}>{activeImgIndex + 1} / {product.images.length}</span>
        </div>
      )}      <style>{`
        @media (max-width: 767px) {
          .detail-breadcrumb {
            display: none !important;
          }
          .detail-page {
            padding: 0 16px 56px !important;
            max-width: none !important;
            overflow-x: hidden !important;
            background: #f7f7f2 !important;
          }
          .detail-main-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            width: auto !important;
            gap: 22px !important;
            margin: 0 -16px 28px !important;
            overflow: hidden !important;
          }
          .detail-main-grid > * {
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .detail-main-grid > div:last-child {
            padding: 0 16px !important;
          }
          .detail-main-image {
            border-radius: 0 !important;
            border: none !important;
            height: 72vh !important;
            min-height: 480px !important;
            padding-top: 0 !important;
            background: #f7f7f2 !important;
          }
          .detail-floating-actions {
            display: flex !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
            padding: calc(env(safe-area-inset-top) + 14px) 14px 0 !important;
          }
          .detail-gallery-img {
            height: 100% !important;
            object-fit: cover !important;
            object-position: center bottom !important;
            transform: scale(1.52) !important;
            transform-origin: center bottom !important;
          }
          .desktop-thumbnails {
            display: none !important;
          }
          .detail-page h2 {
            font-size: 24px !important;
            line-height: 1.16 !important;
            margin-bottom: 8px !important;
          }
          .detail-page h3 {
            font-size: 18px !important;
            text-align: left !important;
            margin-bottom: 18px !important;
          }
          .recommendations-row {
            overflow-x: auto !important;
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: minmax(220px, 68vw) !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            padding-bottom: 12px !important;
          }
          .detail-option-row {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(92px, 0.85fr) !important;
            gap: 8px !important;
            align-items: end !important;
            margin-bottom: 14px !important;
          }
          .detail-option-control {
            min-width: 0 !important;
            gap: 6px !important;
            margin-bottom: 0 !important;
          }
          .detail-option-control > span,
          .detail-option-control > label {
            font-size: 10px !important;
            letter-spacing: 0.04em !important;
            white-space: nowrap !important;
          }
          .detail-option-select {
            display: block !important;
            height: 38px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            padding-left: 9px !important;
            padding-right: 20px !important;
          }
          .detail-option-chips {
            display: none !important;
          }
          .detail-tab-header {
            overflow-x: auto !important;
            gap: 22px !important;
            white-space: nowrap !important;
          }
          .detail-reviews-grid {
            grid-template-columns: 1fr !important;
            gap: 26px !important;
          }
          .detail-cta-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .detail-cta-grid button {
            width: 100% !important;
            min-height: 46px !important;
            padding: 12px 10px !important;
            font-size: 13px !important;
          }
          .detail-qty-field {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .detail-qty-field > div {
            min-width: 0 !important;
            width: 100% !important;
            height: 38px !important;
            border-radius: 12px !important;
            padding: 3px !important;
          }
          .detail-qty-field button {
            width: 25px !important;
            height: 30px !important;
          }
          .detail-qty-field span {
            min-width: 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Icons for the floating gallery overlay (back + cart)
function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B1F8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#16A34A" : "none"} stroke={filled ? "#16A34A" : "#1B1F8C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Styling Object Configurations
const detailContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "30px 24px 80px 24px",
  width: "100%"
};

// Breadcrumb
const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: "500",
  marginBottom: "36px"
};

const breadcrumbLinkStyle = {
  color: "#6B6B75",
  cursor: "pointer",
  transition: "color 0.2s ease"
};

const breadcrumbDividerStyle = {
  color: "#E7E7E2"
};

const breadcrumbActiveStyle = {
  color: "#1B1F8C",
  fontWeight: "600"
};

// Main Layout
const mainLayoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: "48px",
  alignItems: "flex-start",
  marginBottom: "60px"
};

// Gallery
const galleryColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const mainImageWrapperStyle = {
  width: "100%",
  paddingTop: "75%",
  backgroundColor: "#FFFFFF",
  borderRadius: 0,
  position: "relative",
  overflow: "hidden",
  cursor: "zoom-in",
  touchAction: "pan-y"
};

const mainImageStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center"
};

const floatingActionsWrapStyle = {
  position: "absolute",
  inset: 0,
  display: "none",
  pointerEvents: "none",
  zIndex: 5
};

const floatingIconBtnStyle = {
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
  pointerEvents: "auto"
};

const floatingRightActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  pointerEvents: "auto"
};

const floatingCartBadgeStyle = {
  position: "absolute",
  top: "-7px",
  right: "-7px",
  backgroundColor: "#16A34A",
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

const thumbnailStripStyle = {
  display: "flex",
  gap: "12px"
};

const thumbnailWrapperStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "12px",
  border: "2px solid",
  cursor: "pointer",
  overflow: "hidden",
  backgroundColor: "#FFFFFF",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
};

const thumbnailImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

// Configuration Column (Right)
const configColStyle = {
  display: "flex",
  flexDirection: "column"
};

const brandLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#16A34A",
  marginBottom: "8px"
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "12px",
  lineHeight: "1.2"
};

const ratingSummaryLineStyle = {
  marginBottom: "20px"
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  marginBottom: "24px"
};

const priceStyle = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#1B1F8C"
};

const descriptionStyle = {
  fontSize: "15px",
  color: "#14151A",
  lineHeight: "1.6",
  marginBottom: "24px"
};

const dividerStyle = {
  height: "1px",
  backgroundColor: "#E7E7E2",
  width: "100%",
  marginBottom: "24px"
};

const optionControlsRowStyle = {
  display: "flex",
  flexDirection: "column"
};

// Purchase Block
const purchaseBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "2px 0 20px",
  marginBottom: "20px"
};

const qtyFieldStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "8px",
  marginBottom: "16px"
};

const qtyLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6B6B75"
};

const ctaButtonsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
};

const addCartBtnStyle = {
  backgroundColor: "transparent",
  color: "#1B1F8C",
  border: "1px solid #1B1F8C",
  borderRadius: "999px",
  padding: "15px 20px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const buyNowBtnStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "999px",
  padding: "15px 20px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const deliveryBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const deliveryItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const deliveryTextStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  fontWeight: "500"
};

// Tabs section
const tabbedSectionStyle = {
  marginTop: "20px",
  borderTop: "1px solid #E7E7E2",
  paddingTop: "40px"
};

const tabHeaderStyle = {
  display: "flex",
  gap: "36px",
  borderBottom: "1px solid #E7E7E2",
  paddingBottom: "1px"
};

const tabBtnStyle = {
  border: "none",
  background: "none",
  borderBottom: "3px solid transparent",
  fontSize: "15px",
  fontWeight: "600",
  padding: "0 0 16px 0",
  cursor: "pointer",
  transition: "all 0.2s ease",
  outline: "none"
};

const tabPanelWrapperStyle = {
  padding: "30px 0"
};

const detailsPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const panelHeaderStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "16px"
};

const featuresListStyle = {
  listStyle: "none",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px"
};

const featureItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  fontSize: "14px",
  color: "#14151A",
  lineHeight: "1.5"
};

// Reviews list & summary layout
const reviewsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr",
  gap: "48px",
  alignItems: "flex-start"
};

const reviewsListColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const reviewCardStyle = {
  backgroundColor: "transparent",
  borderBottom: "1px solid #E7E7E2",
  padding: "0 0 22px"
};

const reviewHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#F7F7F2",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #E7E7E2"
};

const reviewBodyStyle = {
  fontSize: "14px",
  color: "#14151A",
  lineHeight: "1.5",
  marginBottom: "16px"
};

const reviewFooterStyle = {
  display: "flex",
  gap: "16px"
};

const reviewActionBtnStyle = {
  border: "none",
  background: "none",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B6B75",
  cursor: "pointer",
  textDecoration: "underline",
  padding: "2px 0"
};

const summaryPanelColStyle = {
  position: "sticky",
  top: "100px"
};

const summaryCardStyle = {
  backgroundColor: "transparent",
  borderTop: "1px solid #E7E7E2",
  borderBottom: "1px solid #E7E7E2",
  padding: "26px 0"
};

const summaryHeaderStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1B1F8C",
  marginBottom: "20px",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const summaryScoreBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "8px",
  marginBottom: "28px"
};

const bigScoreStyle = {
  fontSize: "56px",
  fontWeight: "800",
  color: "#1B1F8C",
  lineHeight: "1"
};

const reviewsCountTextStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

const breakdownContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const breakdownRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const breakdownLabelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#14151A",
  width: "30px",
  textAlign: "right"
};

const barBgStyle = {
  flexGrow: 1,
  height: "8px",
  backgroundColor: "#F7F7F2",
  borderRadius: "4px",
  overflow: "hidden",
  border: "1px solid #E7E7E2"
};

const barFillStyle = {
  height: "100%",
  borderRadius: "4px"
};

const breakdownValueStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B6B75",
  width: "35px"
};

// Carousel section
const carouselSectionStyle = {
  marginTop: "60px",
  borderTop: "1px solid #E7E7E2",
  paddingTop: "60px"
};

const carouselHeadingStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#1B1F8C",
  marginBottom: "30px",
  textAlign: "center"
};

const recommendationsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px"
};

const mockQuestionStyle = {
  borderTop: "1px solid #E7E7E2",
  padding: "18px 0",
  marginTop: "16px"
};

const viewerOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 3000,
  backgroundColor: "rgba(0, 0, 0, 0.94)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  touchAction: "pan-y"
};

const viewerImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block"
};

const viewerCloseBtnStyle = {
  position: "absolute",
  top: "calc(env(safe-area-inset-top) + 16px)",
  right: "16px",
  width: "44px",
  height: "44px",
  border: "none",
  borderRadius: "999px",
  backgroundColor: "rgba(255, 255, 255, 0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 2
};

const viewerNavBtnStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "44px",
  height: "44px",
  border: "none",
  borderRadius: "999px",
  backgroundColor: "rgba(255, 255, 255, 0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 2
};

const viewerCountStyle = {
  position: "absolute",
  left: "50%",
  bottom: "calc(env(safe-area-inset-bottom) + 18px)",
  transform: "translateX(-50%)",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "700",
  backgroundColor: "rgba(255, 255, 255, 0.14)",
  borderRadius: "999px",
  padding: "7px 12px"
};
