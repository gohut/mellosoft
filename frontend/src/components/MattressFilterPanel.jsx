"use client";

import React, { useEffect, useRef } from "react";
import { X, RefreshCw } from "lucide-react";

export default function MattressFilterPanel({
  isOpen,
  onClose,
  selectedThickness,
  setSelectedThickness,
  selectedSize,
  setSelectedSize,
  priceAvailability,
  setPriceAvailability,
  sortBy,
  setSortBy,
  resetAllFilters
}) {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on Click Outside (Desktop view)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Prevent immediate close if user clicked the toggle button (handled by parent button click)
        if (e.target.closest(".filter-toggle-btn")) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* MOBILE BACKDROP */}
      <div className="mobile-filter-backdrop" onClick={onClose} aria-hidden="true" />

      {/* FILTER PANEL / CONTAINER */}
      <div
        ref={panelRef}
        className="mattress-filter-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Filter Mattresses"
      >
        {/* PANEL HEADER */}
        <div style={headerStyle}>
          <span style={headerTitleStyle}>FILTERS</span>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close filter panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTROLS GRID */}
        <div style={gridStyle}>
          {/* Thickness Dropdown */}
          <div style={fieldGroupStyle}>
            <label htmlFor="filter-thickness" style={labelStyle}>
              Thickness
            </label>
            <select
              id="filter-thickness"
              value={selectedThickness}
              onChange={(e) => setSelectedThickness(e.target.value)}
              style={selectInputStyle}
            >
              <option value="All">All Thicknesses</option>
              <option value="4">4 Inch</option>
              <option value="5">5 Inch</option>
              <option value="6">6 Inch</option>
              <option value="8">8 Inch</option>
              <option value="10">10 Inch</option>
            </select>
          </div>

          {/* Size Type Dropdown */}
          <div style={fieldGroupStyle}>
            <label htmlFor="filter-size" style={labelStyle}>
              Size
            </label>
            <select
              id="filter-size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              style={selectInputStyle}
            >
              <option value="All">All Sizes</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Queen">Queen</option>
              <option value="King">King</option>
            </select>
          </div>

          {/* Pricing Filter */}
          <div style={fieldGroupStyle}>
            <label htmlFor="filter-pricing" style={labelStyle}>
              Pricing
            </label>
            <select
              id="filter-pricing"
              value={priceAvailability}
              onChange={(e) => setPriceAvailability(e.target.value)}
              style={selectInputStyle}
            >
              <option value="All">All Pricing</option>
              <option value="Priced">Priced Products</option>
              <option value="Contact">Contact for Price</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={fieldGroupStyle}>
            <label htmlFor="filter-sort" style={labelStyle}>
              Sort By
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectInputStyle}
            >
              <option value="Recommended">Recommended</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* PANEL FOOTER / ACTIONS */}
        <div style={footerStyle}>
          <button
            type="button"
            onClick={resetAllFilters}
            style={resetBtnStyle}
            title="Reset all filters to default"
          >
            <RefreshCw size={14} /> Reset Filters
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="mobile-apply-btn"
            style={applyBtnStyle}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style>{`
        /* Desktop Panel Styles */
        .mattress-filter-panel {
          background-color: #FFFFFF;
          border: 1px solid #E7E7E2;
          border-radius: 16px;
          padding: 20px;
          margin-top: 12px;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          animation: filterPanelSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-filter-backdrop {
          display: none;
        }

        .mobile-apply-btn {
          display: none;
        }

        @keyframes filterPanelSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Drawer (< 768px) */
        @media (max-width: 767px) {
          .mobile-filter-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(15, 23, 42, 0.5);
            z-index: 9998;
            backdrop-filter: blur(2px);
          }

          .mattress-filter-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            margin: 0;
            border-radius: 24px 24px 0 0;
            padding: 24px 20px 28px 20px;
            max-height: 85vh;
            overflow-y: auto;
            z-index: 9999;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
            animation: mobileFilterDrawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .mobile-apply-btn {
            display: inline-flex;
          }
        }

        @keyframes mobileFilterDrawerSlide {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

// ── STYLING OBJECTS ──────────────────────────────────────────────────────────
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid #F1F5F9"
};

const headerTitleStyle = {
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#1B1F8C"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#64748B",
  padding: "4px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginBottom: "20px"
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569"
};

const selectInputStyle = {
  height: "42px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "600",
  color: "#1E293B",
  outline: "none",
  cursor: "pointer",
  width: "100%"
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #F1F5F9"
};

const resetBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  height: "42px",
  padding: "0 18px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#F8FAFC",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const applyBtnStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: "42px",
  padding: "0 20px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  flex: "1"
};
