"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import StatusBadge from "../components/StatusBadge";
import { CheckCircle, XCircle, Trash2, Star, AlertCircle, X, RotateCcw, Calendar } from "lucide-react";

export default function ReviewsView() {
  const { reviews, approveReview, rejectReview, deleteReview, restoreReview, hasPermission } = useAdmin();
  
  const allReviews = useMemo(() => reviews || [], [reviews]);

  const pendingReviews = useMemo(() => allReviews.filter((r) => r.status === "Pending" || r.status === "pending"), [allReviews]);
  const approvedReviews = useMemo(() => allReviews.filter((r) => r.status === "Approved" || r.status === "approved"), [allReviews]);
  const rejectedReviews = useMemo(() => allReviews.filter((r) => r.status === "Rejected" || r.status === "rejected"), [allReviews]);
  const deletedReviews = useMemo(() => allReviews.filter((r) => r.status === "Deleted" || r.status === "deleted"), [allReviews]);

  // Tab State: default to Approved, or Pending if pending items exist
  const [activeTab, setActiveTab] = useState("approved");

  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewToRestore, setReviewToRestore] = useState(null);
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (reviewToDelete || reviewToRestore) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [reviewToDelete, reviewToRestore]);

  const activeList = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pendingReviews;
      case "approved":
        return approvedReviews;
      case "rejected":
        return rejectedReviews;
      case "deleted":
        return deletedReviews;
      default:
        return approvedReviews;
    }
  }, [activeTab, pendingReviews, approvedReviews, rejectedReviews, deletedReviews]);

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
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Review Moderation</h3>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{allReviews.length} reviews total</p>
      </div>

      {/* Segmented Tab Navigation */}
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

      {actionError && (
        <div style={errorAlertStyle} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Active Tab Reviews List */}
      {activeList.length === 0 ? (
        <div style={emptyCardStyle}>
          <p style={{ fontSize: "14px", color: "#6B6B75", margin: 0 }}>
            {activeTab === "pending" && "No pending reviews."}
            {activeTab === "approved" && "No approved reviews yet."}
            {activeTab === "rejected" && "No rejected reviews."}
            {activeTab === "deleted" && "No deleted reviews."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activeList.map((review) => {
            const customerInit = (review.customer || review.customerName || "A")[0].toUpperCase();
            const customerName = review.customer || review.customerName || "Anonymous";
            const productName = review.product || review.productName || "Product";
            const commentText = review.review || review.comment || "";
            const isProcessing = processingId === review.id;

            return (
              <div key={review.id} className="admin-card-hover" style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  
                  {/* Left content */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <div style={avatarStyle}>{customerInit}</div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#14151A", margin: 0 }}>{customerName}</p>
                        <p style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px" }}>{review.date}</p>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: "13px", color: "#6B6B75", marginBottom: "6px" }}>
                      Product: <span style={{ fontWeight: 600, color: "#14151A" }}>{productName}</span>
                    </p>

                    <div style={{ marginBottom: "10px" }}>{renderStars(review.rating)}</div>

                    <p style={{ fontSize: "14px", color: "#14151A", lineHeight: 1.6, margin: 0 }}>{commentText}</p>

                    {/* Deleted metadata timestamp */}
                    {activeTab === "deleted" && review.deletedAt && (
                      <p style={{ fontSize: "12px", color: "#991B1B", marginTop: "10px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                        <Calendar size={13} color="#991B1B" /> Deleted on: {formatDate(review.deletedAt)}
                      </p>
                    )}
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
              </div>
            );
          })}
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
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
                Are you sure you want to move this review by{" "}
                <strong style={{ color: "#14151A" }}>{reviewToDelete.customer || reviewToDelete.customerName}</strong> to Deleted?
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
  flexWrap: "wrap",
};

const tabBtnStyle = {
  border: "none",
  fontSize: "13.5px",
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
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


