"use client";

import React from "react";
import { MOCK_REVIEWS } from "../data/adminMockData";
import StatusBadge from "../components/StatusBadge";
import { CheckCircle, XCircle, Trash2, Star } from "lucide-react";

export default function ReviewsView() {
  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={14} fill={s <= rating ? "#F59E0B" : "none"} color={s <= rating ? "#F59E0B" : "#E7E7E2"} />
        ))}
      </div>
    );
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Review Moderation</h3>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{MOCK_REVIEWS.length} reviews</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="admin-card-hover" style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={avatarStyle}>{review.customer[0]}</div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#14151A", margin: 0 }}>{review.customer}</p>
                    <p style={{ fontSize: "12px", color: "#6B6B75", marginTop: "2px" }}>{review.date}</p>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#6B6B75", marginBottom: "6px" }}>
                  Product: <span style={{ fontWeight: 600, color: "#14151A" }}>{review.product}</span>
                </p>
                <div style={{ marginBottom: "10px" }}>{renderStars(review.rating)}</div>
                <p style={{ fontSize: "14px", color: "#14151A", lineHeight: 1.6, margin: 0 }}>{review.review}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <StatusBadge status={review.status} />
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <button style={{ ...actionBtnStyle, borderColor: "#DCFCE7" }} title="Approve">
                    <CheckCircle size={16} color="#16A34A" />
                  </button>
                  <button style={{ ...actionBtnStyle, borderColor: "#FEF3C7" }} title="Reject">
                    <XCircle size={16} color="#F59E0B" />
                  </button>
                  <button style={{ ...actionBtnStyle, borderColor: "#FEE2E2" }} title="Delete">
                    <Trash2 size={16} color="#DC2626" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px",
};

const avatarStyle = {
  width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#E8E9F8",
  color: "#1B1F8C", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "14px", fontWeight: 700, flexShrink: 0,
};

const actionBtnStyle = {
  width: "34px", height: "34px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
