"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { Star, CheckCircle2, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";

export default function CustomerReviewsSection() {
  const { reviews, products, navigateTo } = useStore();

  // 1. Filter ONLY Approved Reviews that are selected for Homepage display
  const approvedReviews = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return [];
    return reviews.filter(
      (r) => (r.status === "Approved" || r.status === "approved") && r.showOnHome === true
    );
  }, [reviews]);

  // 2. Dynamic Rating Summary Calculation
  const { avgRating, totalCount } = useMemo(() => {
    if (approvedReviews.length === 0) return { avgRating: "0.0", totalCount: 0 };
    const sum = approvedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / approvedReviews.length).toFixed(1);
    return { avgRating: avg, totalCount: approvedReviews.length };
  }, [approvedReviews]);

  // 3. Carousel Index State
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

  // 5. Autoplay Timer (5 Seconds)
  useEffect(() => {
    if (isPaused || selectedReviewForModal || approvedReviews.length <= cardsPerView) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, selectedReviewForModal, maxIndex, cardsPerView, approvedReviews.length]);

  // 6. Touch Swipe Logic for Mobile
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

  if (approvedReviews.length === 0) {
    return (
      <section style={sectionWrapStyle}>
        <div style={containerStyle}>
          <div style={titleHeaderStyle}>
            <h2 style={sectionTitleStyle}>WHAT YOU'RE SAYING</h2>
            <p style={emptyStateTextStyle}>No customer reviews yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={sectionWrapStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={containerStyle}>
        {/* SECTION HEADER & RATING SUMMARY */}
        <div style={titleHeaderStyle}>
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

        {/* CAROUSEL WRAPPER WITH NAV ARROWS */}
        <div style={carouselOuterWrapStyle}>
          {/* Left Arrow Button */}
          {approvedReviews.length > cardsPerView && (
            <button
              onClick={handlePrev}
              style={arrowBtnStyle}
              aria-label="Previous Reviews"
              className="carousel-arrow-btn"
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
              {approvedReviews.map((rev) => {
                // Find matching product data
                const matchedProduct = (products || []).find(
                  (p) => p.id === rev.productId || p.name === rev.product || p.name === rev.productName
                );

                const prodName = rev.product || rev.productName || matchedProduct?.name || "Mellosoft Sleep Product";
                const prodImage = matchedProduct?.images?.[0] || "/asset/img1.jpg";
                const prodId = matchedProduct?.id || rev.productId || "classic-mattress";
                const isVerified = rev.verified !== false;

                const reviewText = rev.review || rev.comment || "";
                const isLong = reviewText.length > 120;
                const displayText = isLong ? `${reviewText.slice(0, 115)}...` : reviewText;

                // Format review date cleanly
                const formattedDate = rev.date ? formatDate(rev.date) : "12/8/2026";

                return (
                  <div
                    key={rev.id}
                    style={{
                      ...cardColWrapStyle,
                      flex: `0 0 ${100 / cardsPerView}%`,
                      maxWidth: `${100 / cardsPerView}%`
                    }}
                  >
                    <div style={reviewCardStyle} className="hover-lift-review">
                      {/* Top Header: Customer Info & Date */}
                      <div style={cardHeaderRowStyle}>
                        <div style={customerInfoWrapStyle}>
                          <strong style={customerNameStyle}>
                            {rev.customerName || rev.customer || "Helen M."}
                          </strong>
                          {isVerified && (
                            <span style={verifiedBadgeStyle}>
                              <CheckCircle2 size={13} color="#16A34A" />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
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
                            onClick={() => setSelectedReviewForModal(rev)}
                            style={readMoreBtnStyle}
                          >
                            Read More
                          </button>
                        )}
                      </div>

                      {/* Anchored Product Info at Bottom */}
                      <div
                        onClick={() => navigateTo("detail", prodId)}
                        style={productAnchorRowStyle}
                        title={`View ${prodName}`}
                      >
                        <img src={prodImage} alt={prodName} style={productThumbStyle} />
                        <span style={productNameTextStyle}>{prodName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Button */}
          {approvedReviews.length > cardsPerView && (
            <button
              onClick={handleNext}
              style={arrowBtnStyle}
              aria-label="Next Reviews"
              className="carousel-arrow-btn"
            >
              <ChevronRight size={20} color="#1B1F8C" />
            </button>
          )}
        </div>
      </div>

      {/* 7. FULL REVIEW DETAIL MODAL */}
      {selectedReviewForModal && (
        <div style={modalOverlayStyle} onClick={() => setSelectedReviewForModal(null)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedReviewForModal(null)}
              style={modalCloseBtnStyle}
              aria-label="Close review"
            >
              <X size={18} color="#14151A" />
            </button>

            <div style={cardHeaderRowStyle}>
              <div style={customerInfoWrapStyle}>
                <strong style={{ fontSize: "18px", color: "#14151A" }}>
                  {selectedReviewForModal.customerName || selectedReviewForModal.customer}
                </strong>
                <span style={verifiedBadgeStyle}>
                  <CheckCircle2 size={14} color="#16A34A" />
                  <span>Verified Buyer</span>
                </span>
              </div>
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

            <p style={{ fontSize: "15px", color: "#14151A", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              "{selectedReviewForModal.review || selectedReviewForModal.comment}"
            </p>

            <div
              onClick={() => {
                const pId = selectedReviewForModal.productId || "classic-mattress";
                setSelectedReviewForModal(null);
                navigateTo("detail", pId);
              }}
              style={{ ...productAnchorRowStyle, backgroundColor: "#F7F7F2", padding: "12px 16px" }}
            >
              <img
                src={
                  (products || []).find((p) => p.id === selectedReviewForModal.productId)?.images?.[0] ||
                  "/asset/img1.jpg"
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

      {/* Styled JSX Hover Animations & Responsive Adjustments */}
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
        @media (max-width: 767px) {
          .carousel-arrow-btn {
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
    </section>
  );
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

// Inlined Styling Objects
const sectionWrapStyle = {
  width: "100%",
  padding: "64px 0",
  backgroundColor: "#F7F7F2",
  boxSizing: "border-box"
};

const containerStyle = {
  width: "100%",
  padding: "0 48px",
  boxSizing: "border-box"
};

const titleHeaderStyle = {
  textAlign: "center",
  marginBottom: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px"
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
  transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
  width: "100%"
};

const cardColWrapStyle = {
  padding: "0 10px",
  boxSizing: "border-box"
};

const reviewCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "16px",
  padding: "28px",
  height: "100%",
  minHeight: "280px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxSizing: "border-box"
};

const cardHeaderRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "12px"
};

const customerInfoWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
};

const customerNameStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#14151A"
};

const verifiedBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B6B75"
};

const dateTextStyle = {
  fontSize: "12px",
  color: "#9CA3AF"
};

const cardStarsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2px",
  marginBottom: "14px"
};

const reviewTitleStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: "0 0 6px 0",
  lineHeight: "1.3"
};

const reviewTextBodyStyle = {
  flexGrow: 1,
  marginBottom: "20px"
};

const reviewParagraphStyle = {
  fontSize: "14px",
  color: "#14151A",
  lineHeight: "1.55",
  margin: 0
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

const productAnchorRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  paddingTop: "14px",
  borderTop: "1px solid #E7E7E2",
  cursor: "pointer",
  borderRadius: "10px",
  marginTop: "auto"
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
  padding: "36px",
  maxWidth: "540px",
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
