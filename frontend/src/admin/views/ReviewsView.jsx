import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import StatusBadge from "../components/StatusBadge";
import {
  CheckCircle, XCircle, Trash2, Star, AlertCircle, X, RotateCcw, Calendar,
  Search, Filter, ChevronDown
} from "lucide-react";
import { getResolvedImageUrlSync } from "../../utils/imageStorage";

const getReviewImages = (r) => {
  if (!r) return [];
  if (Array.isArray(r.images) && r.images.length > 0) return r.images;
  if (Array.isArray(r.uploadedImages) && r.uploadedImages.length > 0) return r.uploadedImages;
  if (Array.isArray(r.photos) && r.photos.length > 0) return r.photos;
  if (Array.isArray(r.imageUrls) && r.imageUrls.length > 0) return r.imageUrls;
  if (typeof r.image === "string" && r.image.trim()) return [r.image];
  return [];
};

export default function ReviewsView() {
  const { reviews, approveReview, rejectReview, deleteReview, restoreReview, toggleShowOnHome, hasPermission } = useAdmin();
  
  const allReviews = useMemo(() => reviews || [], [reviews]);

  const pendingReviews = useMemo(() => allReviews.filter((r) => r.status === "Pending" || r.status === "pending"), [allReviews]);
  const approvedReviews = useMemo(() => allReviews.filter((r) => r.status === "Approved" || r.status === "approved"), [allReviews]);
  const homeReviews = useMemo(() => allReviews.filter((r) => (r.status === "Approved" || r.status === "approved") && r.showOnHome === true), [allReviews]);
  const rejectedReviews = useMemo(() => allReviews.filter((r) => r.status === "Rejected" || r.status === "rejected"), [allReviews]);
  const deletedReviews = useMemo(() => allReviews.filter((r) => r.status === "Deleted" || r.status === "deleted"), [allReviews]);

  // Tab State: default to Approved, or Pending if pending items exist
  const [activeTab, setActiveTab] = useState("approved");

  // Search & Filter State — STAR RATING ONLY
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRating, setFilterRating] = useState("All"); // "All", "5", "4", "3", "2", "1"

  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewToRestore, setReviewToRestore] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Responsive Breakpoint Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll when modal or filter is open
  useEffect(() => {
    if (reviewToDelete || reviewToRestore || (isFilterOpen && isMobile)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [reviewToDelete, reviewToRestore, isFilterOpen, isMobile]);

  const activeList = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pendingReviews;
      case "approved":
        return approvedReviews;
      case "home":
        return homeReviews;
      case "rejected":
        return rejectedReviews;
      case "deleted":
        return deletedReviews;
      default:
        return approvedReviews;
    }
  }, [activeTab, pendingReviews, approvedReviews, homeReviews, rejectedReviews, deletedReviews]);

  // Filtered review list (Search + Star Rating Only)
  const filteredReviews = useMemo(() => {
    let result = [...activeList];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((r) => {
        const name = (r.customer || r.customerName || "").toLowerCase();
        const prod = (r.product || r.productName || "").toLowerCase();
        const text = (r.review || r.comment || "").toLowerCase();
        return name.includes(term) || prod.includes(term) || text.includes(term);
      });
    }

    if (filterRating !== "All") {
      const targetRating = Number(filterRating);
      result = result.filter((r) => Number(r.rating) === targetRating);
    }

    return result;
  }, [activeList, searchTerm, filterRating]);

  const isRatingFilterActive = filterRating !== "All";

  const handleApprove = async (id) => {
    setActionError("");
    setProcessingId(id);
    try {
      approveReview(id);
    } catch (err) {
      setActionError("Unable to approve review. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionError("");
    setProcessingId(id);
    try {
      rejectReview(id);
    } catch (err) {
      setActionError("Unable to reject review. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setActionError("");
    const targetId = reviewToDelete.id;
    setProcessingId(targetId);
    try {
      deleteReview(targetId);
      setReviewToDelete(null);
    } catch (err) {
      setActionError("Unable to delete review. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRestore = async (targetStatus) => {
    if (!reviewToRestore) return;
    setActionError("");
    const targetId = reviewToRestore.id;
    setProcessingId(targetId);
    try {
      restoreReview(targetId, targetStatus || reviewToRestore.previousStatus || "Approved");
      setReviewToRestore(null);
    } catch (err) {
      setActionError("Unable to restore review. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={14} fill={s <= rating ? "#F59E0B" : "none"} color={s <= rating ? "#F59E0B" : "#E7E7E2"} />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%", overflowX: "hidden" }}>
      
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Review Moderation</h3>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>
          {(searchTerm || isRatingFilterActive)
            ? `${filteredReviews.length} reviews matching your filter (${allReviews.length} total)`
            : `${allReviews.length} reviews total`}
        </p>
      </div>

      {/* Segmented Tab Navigation (Horizontally scrollable on mobile without page overflow) */}
      <div style={tabNavWrapperStyle}>
        {pendingReviews.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            style={{
              ...tabBtnStyle,
              ...(activeTab === "pending" ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Pending ({pendingReviews.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          style={{
            ...tabBtnStyle,
            ...(activeTab === "approved" ? activeTabStyle : inactiveTabStyle),
          }}
        >
          Approved ({approvedReviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          style={{
            ...tabBtnStyle,
            ...(activeTab === "home" ? activeTabStyle : inactiveTabStyle),
          }}
        >
          Home Reviews ({homeReviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          style={{
            ...tabBtnStyle,
            ...(activeTab === "rejected" ? activeTabStyle : inactiveTabStyle),
          }}
        >
          Rejected ({rejectedReviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("deleted")}
          style={{
            ...tabBtnStyle,
            ...(activeTab === "deleted" ? activeTabStyle : inactiveTabStyle),
          }}
        >
          Deleted ({deletedReviews.length})
        </button>
      </div>

      {/* Search & Star Rating Filter Controls Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        {isMobile ? (
          /* Mobile Stacked Controls Layout */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <div style={searchWrapStyle}>
              <Search size={15} color="#6B6B75" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} style={searchClearBtnStyle}>
                  <X size={14} color="#6B6B75" />
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                style={{
                  ...filterToggleBtnStyle,
                  backgroundColor: isRatingFilterActive ? "#EEF0FF" : "#F7F7F2",
                  color: isRatingFilterActive ? "#1B1F8C" : "#14151A",
                  borderColor: isRatingFilterActive ? "#C7D2FE" : "#E7E7E2",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Filter size={15} />
                <span>Filter{isRatingFilterActive ? " (1)" : ""}</span>
                <ChevronDown size={14} />
              </button>

              <span style={{ fontSize: "12.5px", color: "#6B6B75", fontWeight: 500, whiteSpace: "nowrap" }}>
                Showing <strong>{filteredReviews.length}</strong> of {activeList.length}
              </span>
            </div>
          </div>
        ) : (
          /* Desktop Horizontal Controls Layout */
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
              <div style={searchWrapStyle}>
                <Search size={15} color="#6B6B75" />
                <input
                  type="text"
                  placeholder="Search reviews by customer, product, text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchInputStyle}
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")} style={searchClearBtnStyle}>
                    <X size={14} color="#6B6B75" />
                  </button>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  style={{
                    ...filterToggleBtnStyle,
                    backgroundColor: isRatingFilterActive ? "#EEF0FF" : "#F7F7F2",
                    color: isRatingFilterActive ? "#1B1F8C" : "#14151A",
                    borderColor: isRatingFilterActive ? "#C7D2FE" : "#E7E7E2",
                  }}
                >
                  <Filter size={15} />
                  <span>Filter{isRatingFilterActive ? " (1)" : ""}</span>
                  <ChevronDown size={14} />
                </button>

                {/* Desktop Filter Dropdown Popover */}
                {isFilterOpen && !isMobile && (
                  <div style={filterPopoverStyle}>
                    <div style={filterPopoverHeaderStyle}>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", margin: 0 }}>Filter Reviews</h4>
                      <button type="button" onClick={() => setIsFilterOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                        <X size={16} color="#6B6B75" />
                      </button>
                    </div>

                    <div style={filterPopoverBodyStyle}>
                      <div style={filterFieldGroupStyle}>
                        <label style={filterLabelStyle}>Star Rating</label>
                        <select
                          value={filterRating}
                          onChange={(e) => {
                            setFilterRating(e.target.value);
                            setIsFilterOpen(false);
                          }}
                          style={filterSelectStyle}
                        >
                          <option value="All">All Ratings</option>
                          <option value="5">★★★★★ 5 Stars</option>
                          <option value="4">★★★★☆ 4 Stars</option>
                          <option value="3">★★★☆☆ 3 Stars</option>
                          <option value="2">★★☆☆☆ 2 Stars</option>
                          <option value="1">★☆☆☆☆ 1 Star</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12.5px", color: "#6B6B75", fontWeight: 500 }}>
                Showing <strong>{filteredReviews.length}</strong> of {activeList.length} reviews
              </span>
            </div>
          </div>
        )}

        {/* Mobile Portal Bottom-Sheet Filter Modal */}
        {isFilterOpen && isMobile && typeof document !== "undefined" && createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 3000,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: 0,
            }}
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "480px",
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                padding: "20px 20px 32px",
                boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>Filter Reviews</h4>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                >
                  <X size={18} color="#6B6B75" />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#14151A" }}>Star Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(e.target.value);
                    setIsFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E7E7E2",
                    fontSize: "14px",
                    color: "#14151A",
                    backgroundColor: "#FAFAF7",
                    outline: "none",
                  }}
                >
                  <option value="All">All Ratings</option>
                  <option value="5">★★★★★ 5 Stars</option>
                  <option value="4">★★★★☆ 4 Stars</option>
                  <option value="3">★★★☆☆ 3 Stars</option>
                  <option value="2">★★☆☆☆ 2 Stars</option>
                  <option value="1">★☆☆☆☆ 1 Star</option>
                </select>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Active Filter Badges */}
        {(searchTerm || isRatingFilterActive) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            {searchTerm && (
              <span style={activeFilterPillStyle}>
                Search: &quot;{searchTerm}&quot;
                <X size={12} cursor="pointer" onClick={() => setSearchTerm("")} />
              </span>
            )}
            {isRatingFilterActive && (
              <span style={activeFilterPillStyle}>
                ★ {filterRating} Stars
                <X size={12} cursor="pointer" onClick={() => setFilterRating("All")} />
              </span>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <div style={errorAlertStyle} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Active Tab Reviews List */}
      {filteredReviews.length === 0 ? (
        <div style={emptyCardStyle}>
          {activeList.length > 0 ? (
            <>
              <Search size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#14151A", margin: 0 }}>No reviews found</p>
              <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0" }}>
                No reviews match your search or star rating filter.
              </p>
            </>
          ) : (
            <p style={{ fontSize: "14px", color: "#6B6B75", margin: 0 }}>
              {activeTab === "pending" && "No pending reviews."}
              {activeTab === "approved" && "No approved reviews yet."}
              {activeTab === "home" && "No customer reviews selected for homepage yet. Go to Approved reviews and click 'Show on Home'."}
              {activeTab === "rejected" && "No rejected reviews."}
              {activeTab === "deleted" && "No deleted reviews."}
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {filteredReviews.map((review) => {
            const customerInit = (review.customer || review.customerName || "A")[0].toUpperCase();
            const customerName = review.customer || review.customerName || "Anonymous";
            const productName = review.product || review.productName || "Product";
            const isProcessing = processingId === review.id;

            return (
              <div key={review.id} style={cardStyle}>
                {isMobile ? (
                  /* Single Column Mobile Card Layout */
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    
                    {/* Top Row: Avatar + Customer Name & Product Name + Status Badge */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: "100%" }}>
                      <div style={avatarStyle}>{customerInit}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#14151A", wordBreak: "break-word", lineHeight: 1.3 }}>
                          {customerName}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6B6B75", wordBreak: "break-word", lineHeight: 1.3 }}>
                          {productName}
                        </span>
                      </div>
                      <StatusBadge status={review.status} />
                    </div>

                    {/* Second Row: Rating & Date */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {renderStars(review.rating)}
                      {review.date && (
                        <span style={{ fontSize: "12px", color: "#8E8E93", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} />
                          {formatDate(review.date)}
                        </span>
                      )}
                    </div>

                    {/* Third Row: Review Comment */}
                    <p style={{ fontSize: "13.5px", color: "#2D2E33", lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>
                      {review.review || review.comment || review.feedback}
                    </p>

                    {/* Uploaded Review Images (Mobile) */}
                    {(() => {
                      const revImages = getReviewImages(review);
                      if (!revImages.length) return null;
                      return (
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                          {revImages.map((img, idx) => {
                            const resolvedSrc = getResolvedImageUrlSync(img);
                            return (
                              <img
                                key={idx}
                                src={resolvedSrc}
                                alt={`Review attachment ${idx + 1}`}
                                onClick={() => setPreviewImage(resolvedSrc)}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  border: "1px solid #CBD5E1",
                                  cursor: "pointer",
                                  backgroundColor: "#F8FAFC"
                                }}
                                className="hover-lift"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Fourth Row: Action Buttons */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", paddingTop: "4px" }}>
                      {activeTab === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(review.id)}
                            style={{ ...actionBtnStyle, borderColor: "#DCFCE7", opacity: isProcessing ? 0.6 : 1 }}
                            title="Approve review"
                            aria-label="Approve review"
                          >
                            <CheckCircle size={16} color="#16A34A" />
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReject(review.id)}
                            style={{ ...actionBtnStyle, borderColor: "#FEF3C7", opacity: isProcessing ? 0.6 : 1 }}
                            title="Reject review"
                            aria-label="Reject review"
                          >
                            <XCircle size={16} color="#F59E0B" />
                          </button>

                          {hasPermission("reviews", "delete") && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setReviewToDelete(review)}
                              style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                              title="Delete review"
                              aria-label="Delete review"
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </button>
                          )}
                        </>
                      )}

                      {activeTab === "approved" && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => toggleShowOnHome(review.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              backgroundColor: review.showOnHome ? "#DCFCE7" : "#F3F4F6",
                              color: review.showOnHome ? "#15803D" : "#4B5563",
                              border: `1px solid ${review.showOnHome ? "#86EFAC" : "#D1D5DB"}`,
                              borderRadius: "999px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: review.showOnHome ? "0 2px 6px rgba(22, 163, 74, 0.15)" : "none"
                            }}
                            title={review.showOnHome ? "Click to remove from Homepage" : "Click to feature on Homepage"}
                          >
                            {review.showOnHome ? <Star size={13} fill="#15803D" color="#15803D" /> : <Star size={13} color="#6B7280" />}
                            <span>{review.showOnHome ? "✓ Showing on Home" : "☆ Show on Home"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReject(review.id)}
                            style={{ ...actionBtnStyle, borderColor: "#FEF3C7", opacity: isProcessing ? 0.6 : 1 }}
                            title="Reject review"
                            aria-label="Reject review"
                          >
                            <XCircle size={16} color="#F59E0B" />
                          </button>

                          {hasPermission("reviews", "delete") && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setReviewToDelete(review)}
                              style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                              title="Delete review"
                              aria-label="Delete review"
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </button>
                          )}
                        </>
                      )}

                      {activeTab === "home" && (
                        <>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              backgroundColor: "#DCFCE7",
                              color: "#15803D",
                              border: "1px solid #86EFAC",
                              borderRadius: "999px",
                              padding: "5px 12px",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            <Star size={13} fill="#15803D" color="#15803D" />
                            <span>✓ Showing on Home</span>
                          </div>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => toggleShowOnHome(review.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              border: "1px solid #FCA5A5",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            title="Remove from Homepage"
                            aria-label="Remove from Homepage"
                          >
                            <XCircle size={14} color="#DC2626" />
                            <span>Remove from Home</span>
                          </button>
                        </>
                      )}

                      {activeTab === "rejected" && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(review.id)}
                            style={{ ...actionBtnStyle, borderColor: "#DCFCE7", opacity: isProcessing ? 0.6 : 1 }}
                            title="Approve review"
                            aria-label="Approve review"
                          >
                            <CheckCircle size={16} color="#16A34A" />
                          </button>

                          {hasPermission("reviews", "delete") && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setReviewToDelete(review)}
                              style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                              title="Delete review"
                              aria-label="Delete review"
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </button>
                          )}
                        </>
                      )}

                      {activeTab === "deleted" && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setReviewToRestore(review)}
                          style={{
                            ...restoreTextBtnStyle,
                            opacity: isProcessing ? 0.6 : 1,
                          }}
                          title="Restore review"
                          aria-label="Restore review"
                        >
                          <RotateCcw size={15} color="#1B1F8C" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Desktop Card Layout (Unchanged) */
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    
                    {/* Left Info: Avatar, Customer Name, Product, Rating, Review */}
                    <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "240px" }}>
                      <div style={avatarStyle}>{customerInit}</div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#14151A" }}>{customerName}</span>
                          <span style={{ fontSize: "12px", color: "#6B6B75" }}>•</span>
                          <span style={{ fontSize: "12.5px", color: "#6B6B75", fontWeight: 500 }}>{productName}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px", flexWrap: "wrap" }}>
                          {renderStars(review.rating)}
                          {review.date && (
                            <span style={{ fontSize: "12px", color: "#8E8E93", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Calendar size={12} />
                              {formatDate(review.date)}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "13.5px", color: "#2D2E33", lineHeight: 1.5, margin: "6px 0 0" }}>
                          {review.review || review.comment || review.feedback}
                        </p>

                        {/* Uploaded Review Images (Desktop) */}
                        {(() => {
                          const revImages = getReviewImages(review);
                          if (!revImages.length) return null;
                          return (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                              {revImages.map((img, idx) => {
                                const resolvedSrc = getResolvedImageUrlSync(img);
                                return (
                                  <img
                                    key={idx}
                                    src={resolvedSrc}
                                    alt={`Review attachment ${idx + 1}`}
                                    onClick={() => setPreviewImage(resolvedSrc)}
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid #CBD5E1",
                                      cursor: "pointer",
                                      backgroundColor: "#F8FAFC"
                                    }}
                                    className="hover-lift"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Right Status & Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                      <StatusBadge status={review.status} />

                      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        
                        {/* PENDING TAB ACTIONS */}
                        {activeTab === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(review.id)}
                              style={{ ...actionBtnStyle, borderColor: "#DCFCE7", opacity: isProcessing ? 0.6 : 1 }}
                              title="Approve review"
                              aria-label="Approve review"
                            >
                              <CheckCircle size={16} color="#16A34A" />
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReject(review.id)}
                              style={{ ...actionBtnStyle, borderColor: "#FEF3C7", opacity: isProcessing ? 0.6 : 1 }}
                              title="Reject review"
                              aria-label="Reject review"
                            >
                              <XCircle size={16} color="#F59E0B" />
                            </button>

                            {hasPermission("reviews", "delete") && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setReviewToDelete(review)}
                                style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                                title="Delete review"
                                aria-label="Delete review"
                              >
                                <Trash2 size={16} color="#DC2626" />
                              </button>
                            )}
                          </>
                        )}

                        {/* APPROVED TAB ACTIONS */}
                        {activeTab === "approved" && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => toggleShowOnHome(review.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: review.showOnHome ? "#DCFCE7" : "#F3F4F6",
                                color: review.showOnHome ? "#15803D" : "#4B5563",
                                border: `1px solid ${review.showOnHome ? "#86EFAC" : "#D1D5DB"}`,
                                borderRadius: "999px",
                                padding: "5px 12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: review.showOnHome ? "0 2px 6px rgba(22, 163, 74, 0.15)" : "none"
                              }}
                              title={review.showOnHome ? "Click to remove from Homepage" : "Click to feature on Homepage"}
                            >
                              {review.showOnHome ? <Star size={13} fill="#15803D" color="#15803D" /> : <Star size={13} color="#6B7280" />}
                              <span>{review.showOnHome ? "✓ Showing on Home" : "☆ Show on Home"}</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReject(review.id)}
                              style={{ ...actionBtnStyle, borderColor: "#FEF3C7", opacity: isProcessing ? 0.6 : 1 }}
                              title="Reject review"
                              aria-label="Reject review"
                            >
                              <XCircle size={16} color="#F59E0B" />
                            </button>

                            {hasPermission("reviews", "delete") && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setReviewToDelete(review)}
                                style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                                title="Delete review"
                                aria-label="Delete review"
                              >
                                <Trash2 size={16} color="#DC2626" />
                              </button>
                            )}
                          </>
                        )}

                        {/* HOME REVIEWS TAB ACTIONS */}
                        {activeTab === "home" && (
                          <>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#DCFCE7",
                                color: "#15803D",
                                border: "1px solid #86EFAC",
                                borderRadius: "999px",
                                padding: "4px 12px",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              <Star size={13} fill="#15803D" color="#15803D" />
                              <span>✓ Showing on Home</span>
                            </div>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => toggleShowOnHome(review.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                                border: "1px solid #FCA5A5",
                                borderRadius: "8px",
                                padding: "5px 12px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                              title="Remove from Homepage"
                              aria-label="Remove from Homepage"
                            >
                              <XCircle size={14} color="#DC2626" />
                              <span>Remove from Home</span>
                            </button>
                          </>
                        )}

                        {/* REJECTED TAB ACTIONS */}
                        {activeTab === "rejected" && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(review.id)}
                              style={{ ...actionBtnStyle, borderColor: "#DCFCE7", opacity: isProcessing ? 0.6 : 1 }}
                              title="Approve review"
                              aria-label="Approve review"
                            >
                              <CheckCircle size={16} color="#16A34A" />
                            </button>

                            {hasPermission("reviews", "delete") && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setReviewToDelete(review)}
                                style={{ ...actionBtnStyle, borderColor: "#FEE2E2", opacity: isProcessing ? 0.6 : 1 }}
                                title="Delete review"
                                aria-label="Delete review"
                              >
                                <Trash2 size={16} color="#DC2626" />
                              </button>
                            )}
                          </>
                        )}

                        {/* DELETED TAB ACTIONS (RESTORE ONLY) */}
                        {activeTab === "deleted" && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => setReviewToRestore(review)}
                            style={{
                              ...restoreTextBtnStyle,
                              opacity: isProcessing ? 0.6 : 1,
                            }}
                            title="Restore review"
                            aria-label="Restore review"
                          >
                            <RotateCcw size={15} color="#1B1F8C" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {reviewToDelete && typeof document !== "undefined" && createPortal(
        <div style={modalBackdropStyle} onClick={() => setReviewToDelete(null)}>
          <div 
            style={modalCardStyle} 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-modal-title"
          >
            <div style={modalHeaderStyle}>
              <h4 id="delete-review-modal-title" style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>
                Delete Review?
              </h4>
              <button 
                type="button" 
                onClick={() => setReviewToDelete(null)} 
                style={closeIconBtnStyle}
                aria-label="Close modal"
              >
                <X size={18} color="#6B6B75" />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "14px", color: "#6B6B75", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete the review by{" "}
                <strong style={{ color: "#14151A" }}>{reviewToDelete.customer || reviewToDelete.customerName}</strong>?
              </p>
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                style={cancelBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={dangerBtnStyle}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {reviewToRestore && typeof document !== "undefined" && createPortal(
        <div style={modalBackdropStyle} onClick={() => setReviewToRestore(null)}>
          <div 
            style={modalCardStyle} 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-review-modal-title"
          >
            <div style={modalHeaderStyle}>
              <h4 id="restore-review-modal-title" style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>
                Restore Review?
              </h4>
              <button 
                type="button" 
                onClick={() => setReviewToRestore(null)} 
                style={closeIconBtnStyle}
                aria-label="Close modal"
              >
                <X size={18} color="#6B6B75" />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "14px", color: "#6B6B75", lineHeight: 1.5, margin: 0 }}>
                Where should this review by{" "}
                <strong style={{ color: "#14151A" }}>{reviewToRestore.customer || reviewToRestore.customerName}</strong> be restored?
              </p>
              {reviewToRestore.previousStatus && (
                <p style={{ fontSize: "13px", color: "#16A34A", marginTop: "8px", fontWeight: 500, margin: "8px 0 0" }}>
                  Previous Status: <strong>{reviewToRestore.previousStatus}</strong>
                </p>
              )}
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() => setReviewToRestore(null)}
                style={cancelBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRestore(reviewToRestore.previousStatus || "Approved")}
                style={primaryRestoreBtnStyle}
              >
                Restore to {reviewToRestore.previousStatus || "Approved"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.82)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              backgroundColor: "#1E293B",
              borderRadius: "12px",
              padding: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Review attachment preview"
              style={{
                maxWidth: "100%",
                maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: "8px",
                display: "block"
              }}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

const tabNavWrapperStyle = {
  display: "flex",
  gap: "8px",
  backgroundColor: "#F7F7F2",
  padding: "4px",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  alignSelf: "flex-start",
  maxWidth: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  whiteSpace: "nowrap",
};

const tabBtnStyle = {
  border: "none",
  fontSize: "13.5px",
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

const activeTabStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(27, 31, 140, 0.2)",
};

const inactiveTabStyle = {
  backgroundColor: "transparent",
  color: "#6B6B75",
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  padding: "20px",
};

const emptyCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7E7E2",
  padding: "40px",
  textAlign: "center",
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "#E8E9F8",
  color: "#1B1F8C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: 700,
  flexShrink: 0,
};

const actionBtnStyle = {
  width: "34px",
  height: "34px",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const restoreTextBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "34px",
  padding: "0 14px",
  border: "1px solid #D1D4F0",
  borderRadius: "8px",
  backgroundColor: "#F0F0FC",
  color: "#1B1F8C",
  fontSize: "12.5px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const errorAlertStyle = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FCA5A5",
  borderRadius: "12px",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#991B1B",
  fontSize: "13.5px",
  fontWeight: 500,
};

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.12)",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  filter: "none",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const modalCardStyle = {
  position: "relative",
  zIndex: 1001,
  backgroundColor: "#FFFFFF",
  opacity: 1,
  borderRadius: "16px",
  border: "1px solid #E7E7E2",
  width: "100%",
  maxWidth: "440px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  overflow: "hidden",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #E7E7E2",
  backgroundColor: "#FAFAF7",
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  padding: "14px 20px",
  borderTop: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF",
};

const closeIconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  padding: 0,
};

const cancelBtnStyle = {
  height: "38px",
  padding: "0 18px",
  backgroundColor: "#FFFFFF",
  color: "#14151A",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const dangerBtnStyle = {
  height: "38px",
  padding: "0 18px",
  backgroundColor: "#DC2626",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const primaryRestoreBtnStyle = {
  height: "38px",
  padding: "0 18px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  padding: "8px 14px",
  flex: 1,
  minWidth: "200px",
};

const searchInputStyle = {
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontSize: "13px",
  color: "#14151A",
  width: "100%",
};

const searchClearBtnStyle = {
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const filterToggleBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  height: "38px",
  padding: "0 14px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

const filterPopoverStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  width: "280px",
  maxWidth: "calc(100vw - 32px)",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
  padding: "16px",
  zIndex: 2500,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const filterPopoverHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "8px",
  borderBottom: "1px solid #E7E7E2",
};

const filterPopoverBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const filterFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const filterLabelStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#14151A",
};

const filterSelectStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  fontSize: "13px",
  color: "#14151A",
  backgroundColor: "#FAFAF7",
  outline: "none",
};

const filterPopoverFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "10px",
  borderTop: "1px solid #E7E7E2",
};

const filterClearBtnStyle = {
  border: "none",
  background: "none",
  fontSize: "12.5px",
  fontWeight: 700,
  color: "#6B6B75",
  cursor: "pointer",
  padding: 0,
};

const filterApplyBtnStyle = {
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  padding: "7px 14px",
  fontSize: "12.5px",
  fontWeight: 700,
  cursor: "pointer",
};

const clearAllPillBtnStyle = {
  backgroundColor: "#FEF2F2",
  color: "#DC2626",
  border: "1px solid #FCA5A5",
  borderRadius: "999px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const activeFilterPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#EEF0FF",
  color: "#1B1F8C",
  border: "1px solid #C7D2FE",
  borderRadius: "999px",
  padding: "3px 10px",
  fontSize: "11.5px",
  fontWeight: 700,
};
