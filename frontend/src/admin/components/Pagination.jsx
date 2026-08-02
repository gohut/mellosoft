"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      padding: "16px 0",
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          ...navBtnStyle,
          opacity: currentPage <= 1 ? 0.4 : 1,
          cursor: currentPage <= 1 ? "default" : "pointer",
        }}
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            ...pageBtnStyle,
            backgroundColor: page === currentPage ? "#1B1F8C" : "transparent",
            color: page === currentPage ? "#FFFFFF" : "#6B6B75",
            fontWeight: page === currentPage ? 700 : 500,
          }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          ...navBtnStyle,
          opacity: currentPage >= totalPages ? 0.4 : 1,
          cursor: currentPage >= totalPages ? "default" : "pointer",
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const navBtnStyle = {
  width: "36px",
  height: "36px",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#14151A",
  transition: "all 0.15s ease",
};

const pageBtnStyle = {
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
  cursor: "pointer",
};
