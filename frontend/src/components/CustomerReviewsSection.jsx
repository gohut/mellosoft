"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getProductPrimaryImage } from "../utils/productHelpers";
import { getResolvedImageUrlSync } from "../utils/imageStorage";
import { useRouter } from "next/navigation";

// Safely extract customer review images if present
function getReviewImages(r) {
  if (!r) return [];
  if (Array.isArray(r.images) && r.images.length > 0) return r.images.filter(Boolean);
  if (Array.isArray(r.uploadedImages) && r.uploadedImages.length > 0) return r.uploadedImages.filter(Boolean);
  if (Array.isArray(r.photos) && r.photos.length > 0) return r.photos.filter(Boolean);
  if (Array.isArray(r.imageUrls) && r.imageUrls.length > 0) return r.imageUrls.filter(Boolean);
  if (typeof r.image === "string" && r.image.trim()) return [r.image.trim()];
  return [];
}

// Date Formatter Helper
function formatDate(dateStr) {
  if (!dateStr) return "12/8/2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const yr = d.getFullYear();
    return `${m}/${day}/${yr}`;
  } catch {
    return dateStr;
  }
}

export default function CustomerReviewsSection() {
  const router = useRouter();
  const { reviews, products, navigateTo, setSelectedProductId, setView } = useStore();

  // 1. Filter ONLY Approved Reviews (exclude Pending, Rejected, Deleted)
  const approvedReviews = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return [];
    
    const approved = reviews.filter((r) => {
      const status = (r.status || "").toLowerCase();
      if (status === "deleted" || status === "rejected" || status === "pending") return false;
      return status === "approved";
    });

    // If explicit homepage flags exist, prefer them; otherwise show all approved
    const homeFlagged = approved.filter((r) => r.showOnHome === true);
    if (homeFlagged.length > 0) return homeFlagged;

    return approved.filter((r) => r.showOnHome !== false);
  }, [reviews]);

  // 2. Dynamic Rating Summary Calculation
  const { avgRating, totalCount } = useMemo(() => {
    if (approvedReviews.length === 0) return { avgRating: "0.0", totalCount: 0 };
    const sum = approvedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / approvedReviews.length).toFixed(1);
    return { avgRating: avg, totalCount: approvedReviews.length };
  }, [approvedReviews]);

  // 3. Carousel Index State for 4+ reviews
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 4. Modal State for "Read More"
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);

  // Responsive Cards Per View
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1200) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  // Maximum slide index
  const maxIndex = Math.max(0, approvedReviews.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Autoplay Timer (Only when 4+ reviews and not paused)
  useEffect(() => {
    if (isPaused || selectedReviewForModal || approvedReviews.length <= cardsPerView) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, selectedReviewForModal, maxIndex, cardsPerView, approvedReviews.length]);

  // Touch Swipe Logic for Mobile Carousel
  const touchStartXRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;
    if (diffX > 40) {
      handleNext();
    } else if (diffX < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const handleProductNavigate = (prodId) => {
    if (!prodId) return;
    if (typeof setSelectedProductId === "function") {
      setSelectedProductId(prodId);
    }
    if (typeof setView === "function") {
      setView("detail");
    }
    if (typeof navigateTo === "function") {
      navigateTo("detail", prodId);
    } else if (router && typeof router.push === "function") {
      router.push(`/product/${prodId}`);
    }
  };

  // Helper to render individual review card with equal-height flex structure
  const renderReviewCard = (rev) => {
    const matchedProduct = (products || []).find(
      (p) =>
        (p.id && (p.id === rev.productId || p.id === rev.Product_Id || p.slug === rev.productId)) ||
        (p.slug && p.slug === rev.productId) ||
        (p.name && (p.name === rev.product || p.name === rev.productName))
    );

    const prodName = rev.product || rev.productName || matchedProduct?.name || "Mellosoft Sleep Product";
    const prodImage = matchedProduct ? getProductPrimaryImage(matchedProduct) : (rev.productImage || "/images/mattresses/foam/haven.jpg");
    const prodId = matchedProduct?.slug || matchedProduct?.id || rev.productId || "foamcloud";

    const reviewText = rev.review || rev.comment || rev.feedback || "";
    const isLong = reviewText.length > 130;
    const displayText = isLong ? `${reviewText.slice(0, 125)}...` : reviewText;

    const formattedDate = rev.date ? formatDate(rev.date) : "12/8/2026";
    const reviewImages = getReviewImages(rev);

    return (
      <div style={reviewCardStyle} className="hover-lift-review review-card">
        {/* Top/Middle content container */}
        <div style={reviewMainContentStyle} className="review-main-content">
          {/* Top Header: Customer Name on left, Date on right */}
          <div style={cardHeaderRowStyle}>
            <strong style={customerNameStyle}>
              {rev.customerName || rev.customer || rev.author || "Helen M."}
            </strong>
            <span style={dateTextStyle}>{formattedDate}</span>
          </div>

          {/* Star Rating */}
          <div style={cardStarsRowStyle}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={15}
                fill={star <= (Number(rev.rating) || 5) ? "#14151A" : "#E7E7E2"}
                color={star <= (Number(rev.rating) || 5) ? "#14151A" : "#E7E7E2"}
              />
            ))}
          </div>

          {/* Review Title (if available) */}
          {rev.title && (
            <h4 style={reviewTitleStyle}>{rev.title}</h4>
          )}

          {/* Review Body & Read More */}
          <div style={reviewTextBodyStyle}>
            <p style={reviewParagraphStyle}>"{displayText}"</p>
            {isLong && (
              <button
                type="button"
                onClick={() => setSelectedReviewForModal(rev)}
                style={readMoreBtnStyle}
              >
                Read More
              </button>
            )}
          </div>

          {/* Attached Customer Uploaded Photos (if any) */}
          {reviewImages.length > 0 && (
            <div style={reviewImagesStripStyle}>
              {reviewImages.map((img, idx) => (
                <img
                  key={idx}
                  src={getResolvedImageUrlSync(img, "/images/mattresses/foam/haven.jpg")}
                  alt={`Review image ${idx + 1}`}
                  style={reviewImageThumbStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReviewForModal(rev);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Anchored Product Info at Bottom (margin-top: auto for equal bottom alignment) */}
        <div
          onClick={() => handleProductNavigate(prodId)}
          style={productAnchorRowStyle}
          className="product-reference"
          title={`View ${prodName}`}
          role="button"
          tabIndex={0}
        >
          <img src={prodImage} alt={prodName} style={productThumbStyle} />
          <span style={productNameTextStyle}>{prodName}</span>
        </div>
      </div>
    );
  };

  // ─── 0 REVIEWS ─────────────────────────────────────────────────────────────
  if (approvedReviews.length === 0) {
    return (
      <section style={sectionWrapStyle} className="customer-reviews-section">
        <div style={containerStyle}>
          <div style={titleHeaderStyle} className="reviews-title-header">
            <h2 style={sectionTitleStyle}>WHAT YOU'RE SAYING</h2>
            <p style={emptyStateTextStyle}>No customer reviews yet.</p>
          </div>
        </div>
      </section>
    );
  }

  const reviewCount = approvedReviews.length;

  return (
    <section
      style={sectionWrapStyle}
      className="customer-reviews-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={containerStyle}>
        {/* SECTION HEADER & RATING SUMMARY */}
        <div style={titleHeaderStyle} className="reviews-title-header">
          <h2 style={sectionTitleStyle}>WHAT YOU'RE SAYING</h2>
          <div style={summaryRowStyle}>
            <div style={starsRowStyle}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= Math.round(Number(avgRating)) ? "#14151A" : "#E7E7E2"}
                  color={star <= Math.round(Number(avgRating)) ? "#14151A" : "#E7E7E2"}
                />
              ))}
            </div>
            <span style={avgRatingTextStyle}><strong>{avgRating}</strong></span>
            <span style={reviewCountTextStyle}>{totalCount} {totalCount === 1 ? "review" : "reviews"}</span>
          </div>
        </div>

        {/* ─── DYNAMIC EQUAL-HEIGHT LAYOUT BASED ON REVIEW COUNT ───────────── */}
        
        {/* 1. EXACTLY 1 REVIEW: Centered Single Card (520px max width) */}
        {reviewCount === 1 && (
          <div style={singleReviewContainerStyle} className="reviews-grid single-review">
            <div style={singleCardWrapperStyle}>
              {renderReviewCard(approvedReviews[0])}
            </div>
          </div>
        )}

        {/* 2. EXACTLY 2 REVIEWS: Centered Pair Equal Height */}
        {reviewCount === 2 && (
          <div style={twoReviewsContainerStyle} className="reviews-grid two-reviews">
            {approvedReviews.map((rev) => (
              <div key={rev.id} style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", height: "100%" }}>
                {renderReviewCard(rev)}
              </div>
            ))}
          </div>
        )}

        {/* 3. EXACTLY 3 REVIEWS: 3-Card Row Centered Equal Height */}
        {reviewCount === 3 && (
          <div style={threeReviewsContainerStyle} className="reviews-grid three-reviews">
            {approvedReviews.map((rev) => (
              <div key={rev.id} style={{ width: "100%", minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                {renderReviewCard(rev)}
              </div>
            ))}
          </div>
        )}

        {/* 4. 4 OR MORE REVIEWS: Interactive Carousel with Equal Height Slides */}
        {reviewCount >= 4 && (
          <div style={carouselOuterWrapStyle} className="reviews-carousel-wrap">
            {/* Left Arrow Button */}
            {approvedReviews.length > cardsPerView && (
              <button
                onClick={handlePrev}
                style={arrowBtnStyle}
                aria-label="Previous Reviews"
                className="carousel-arrow-btn"
                type="button"
              >
                <ChevronLeft size={20} color="#1B1F8C" />
              </button>
            )}

            {/* Cards Track Container */}
            <div
              style={trackViewportStyle}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  ...trackFlexStyle,
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
                }}
              >
                {approvedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      ...cardColWrapStyle,
                      flex: `0 0 ${100 / cardsPerView}%`,
                      maxWidth: `${100 / cardsPerView}%`
                    }}
                  >
                    {renderReviewCard(rev)}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow Button */}
            {approvedReviews.length > cardsPerView && (
              <button
                onClick={handleNext}
                style={arrowBtnStyle}
                aria-label="Next Reviews"
                className="carousel-arrow-btn"
                type="button"
              >
                <ChevronRight size={20} color="#1B1F8C" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. FULL REVIEW DETAIL MODAL */}
      {selectedReviewForModal && (
        <div style={modalOverlayStyle} onClick={() => setSelectedReviewForModal(null)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedReviewForModal(null)}
              style={modalCloseBtnStyle}
              aria-label="Close review"
              type="button"
            >
              <X size={18} color="#14151A" />
            </button>

            <div style={cardHeaderRowStyle}>
              <strong style={{ fontSize: "18px", color: "#14151A" }}>
                {selectedReviewForModal.customerName || selectedReviewForModal.customer || selectedReviewForModal.author}
              </strong>
              <span style={dateTextStyle}>{selectedReviewForModal.date ? formatDate(selectedReviewForModal.date) : "12/8/2026"}</span>
            </div>

            <div style={{ ...cardStarsRowStyle, margin: "14px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= (Number(selectedReviewForModal.rating) || 5) ? "#14151A" : "#E7E7E2"}
                  color={star <= (Number(selectedReviewForModal.rating) || 5) ? "#14151A" : "#E7E7E2"}
                />
              ))}
            </div>

            {selectedReviewForModal.title && (
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1B1F8C", margin: "0 0 10px 0" }}>
                {selectedReviewForModal.title}
              </h3>
            )}

            <p style={{ fontSize: "15px", color: "#14151A", lineHeight: "1.6", margin: "0 0 18px 0", overflowWrap: "break-word", wordBreak: "break-word" }}>
              "{selectedReviewForModal.review || selectedReviewForModal.comment || selectedReviewForModal.feedback}"
            </p>

            {/* Modal Review Images */}
            {getReviewImages(selectedReviewForModal).length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "0 0 20px 0" }}>
                {getReviewImages(selectedReviewForModal).map((img, idx) => (
                  <img
                    key={idx}
                    src={getResolvedImageUrlSync(img, "/images/mattresses/foam/haven.jpg")}
                    alt={`Review attachment ${idx + 1}`}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "1px solid #E7E7E2" }}
                  />
                ))}
              </div>
            )}

            <div
              onClick={() => {
                const pId = selectedReviewForModal.productId || "foamcloud";
                setSelectedReviewForModal(null);
                handleProductNavigate(pId);
              }}
              style={{ ...productAnchorRowStyle, backgroundColor: "#F7F7F2", padding: "12px 16px" }}
              role="button"
              tabIndex={0}
            >
              <img
                src={
                  (products || []).find((p) => p.id === selectedReviewForModal.productId)?.images?.[0] ||
                  "/images/mattresses/foam/haven.jpg"
                }
                alt={selectedReviewForModal.product || "Product"}
                style={productThumbStyle}
              />
              <span style={{ ...productNameTextStyle, fontSize: "14px" }}>
                {selectedReviewForModal.product || selectedReviewForModal.productName || "Mellosoft Classic Mattress"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX Hover Animations & Responsive Equal-Height Adjustments */}
      <style>{`
        .hover-lift-review {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-lift-review:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(27, 31, 140, 0.08);
        }
        .carousel-arrow-btn {
          transition: all 0.2s ease;
        }
        .carousel-arrow-btn:hover {
          background-color: #1B1F8C !important;
          border-color: #1B1F8C !important;
        }
        .carousel-arrow-btn:hover svg {
          stroke: #FFFFFF !important;
        }
        .two-reviews,
        .three-reviews,
        .reviews-grid {
          align-items: stretch !important;
        }
        .review-card {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .product-reference {
          margin-top: auto !important;
        }
        @media (max-width: 1024px) {
          .three-reviews {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 767px) {
          .customer-reviews-section {
            padding: 24px 0 20px !important;
          }
          .reviews-title-header {
            margin-bottom: 20px !important;
          }
          .reviews-grid.single-review,
          .reviews-grid.two-reviews,
          .reviews-grid.three-reviews {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
          }
          .reviews-grid.single-review > div,
          .reviews-grid.two-reviews > div,
          .reviews-grid.three-reviews > div {
            max-width: 100% !important;
            width: 100% !important;
          }
          .review-card {
            padding: 20px !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .product-reference {
            margin-top: 16px !important;
          }
          .carousel-arrow-btn {
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}

// Inlined Styling Objects
const sectionWrapStyle = {
  width: "100%",
  padding: "36px 0 32px",
  backgroundColor: "#F7F7F2",
  boxSizing: "border-box"
};

const containerStyle = {
  width: "100%",
  maxWidth: "1320px",
  margin: "0 auto",
  padding: "0 24px",
  boxSizing: "border-box"
};

const titleHeaderStyle = {
  textAlign: "center",
  marginBottom: "28px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px"
};

const sectionTitleStyle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0,
  letterSpacing: "-0.5px"
};

const summaryRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const starsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "3px"
};

const avgRatingTextStyle = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#14151A"
};

const reviewCountTextStyle = {
  fontSize: "14px",
  color: "#6B6B75",
  fontWeight: "500"
};

const singleReviewContainerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "100%"
};

const singleCardWrapperStyle = {
  width: "100%",
  maxWidth: "520px",
  boxSizing: "border-box"
};

const twoReviewsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 480px))",
  justifyContent: "center",
  alignItems: "stretch",
  gap: "24px",
  maxWidth: "1020px",
  margin: "0 auto",
  width: "100%"
};

const threeReviewsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 380px))",
  justifyContent: "center",
  alignItems: "stretch",
  gap: "24px",
  maxWidth: "1200px",
  margin: "0 auto",
  width: "100%"
};

const carouselOuterWrapStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "16px"
};

const arrowBtnStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  flexShrink: 0,
  zIndex: 5
};

const trackViewportStyle = {
  overflow: "hidden",
  width: "100%",
  borderRadius: "20px"
};

const trackFlexStyle = {
  display: "flex",
  alignItems: "stretch",
  transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
  width: "100%"
};

const cardColWrapStyle = {
  padding: "0 10px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  height: "auto"
};

const reviewCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "24px",
  height: "100%",
  width: "100%",
  maxWidth: "520px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
};

const reviewMainContentStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%"
};

const cardHeaderRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "10px"
};

const customerNameStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#14151A"
};

const dateTextStyle = {
  fontSize: "12px",
  color: "#9CA3AF"
};

const cardStarsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2px",
  marginBottom: "12px"
};

const reviewTitleStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 6px 0",
  lineHeight: "1.3"
};

const reviewTextBodyStyle = {
  marginBottom: "14px"
};

const reviewParagraphStyle = {
  fontSize: "14px",
  color: "#14151A",
  lineHeight: "1.55",
  margin: 0,
  overflowWrap: "break-word",
  wordBreak: "break-word"
};

const readMoreBtnStyle = {
  border: "none",
  background: "none",
  color: "#1B1F8C",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
  padding: 0,
  marginTop: "4px"
};

const reviewImagesStripStyle = {
  display: "flex",
  gap: "8px",
  margin: "0 0 14px 0",
  flexWrap: "wrap"
};

const reviewImageThumbStyle = {
  width: "56px",
  height: "56px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  cursor: "pointer"
};

const productAnchorRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  paddingTop: "12px",
  borderTop: "1px solid #F1F5F9",
  cursor: "pointer",
  borderRadius: "10px",
  marginTop: "auto",
  width: "100%"
};

const productThumbStyle = {
  width: "36px",
  height: "36px",
  objectFit: "cover",
  borderRadius: "8px",
  backgroundColor: "#F7F7F2",
  flexShrink: 0
};

const productNameTextStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1B1F8C",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const emptyStateTextStyle = {
  fontSize: "15px",
  color: "#6B6B75"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(20, 21, 26, 0.6)",
  backdropFilter: "blur(4px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "32px",
  maxWidth: "520px",
  width: "100%",
  position: "relative",
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  maxHeight: "90vh",
  overflowY: "auto"
};

const modalCloseBtnStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  border: "none",
  backgroundColor: "#F7F7F2",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};
