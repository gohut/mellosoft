"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * MobileSubcategoryDropdown
 * Compact single-dropdown category selector for mobile views (<= 768px).
 * Replaces wrapped subcategory pill rows on mobile while preserving exact filter state and dynamic counts.
 */
export default function MobileSubcategoryDropdown({
  items = [],
  categoryCounts = {},
  selectedValue = "all",
  onChange,
  allLabel = "All Products",
  allCount = 0,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Determine current active label
  const isAll =
    !selectedValue ||
    selectedValue === "all" ||
    selectedValue === "All" ||
    selectedValue === "mattress" ||
    selectedValue === "mattresses";

  let selectedLabel = `${allLabel} (${allCount ?? 0})`;

  if (!isAll) {
    const match = items.find(
      (item) =>
        item.slug === selectedValue ||
        item.id === selectedValue ||
        (item.name && item.name.toLowerCase() === String(selectedValue).toLowerCase())
    );
    if (match) {
      const count =
        categoryCounts[match.slug] !== undefined
          ? categoryCounts[match.slug]
          : categoryCounts[match.id] !== undefined
          ? categoryCounts[match.id]
          : match.count ?? 0;
      selectedLabel = `${match.name} (${count})`;
    } else {
      // Fallback formatting if item meta isn't found
      const count = categoryCounts[selectedValue] ?? 0;
      const formattedName = String(selectedValue)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      selectedLabel = `${formattedName} (${count})`;
    }
  }

  const handleSelect = (slug) => {
    setIsOpen(false);
    if (onChange) {
      onChange(slug);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`mobile-subcategory-dropdown ${className}`}
      style={wrapperStyle}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          ...buttonStyle,
          borderColor: isOpen ? "#1B1F8C" : "#E7E7E2",
          boxShadow: isOpen ? "0 0 0 2px rgba(27, 31, 140, 0.12)" : "0 1px 4px rgba(0,0,0,0.04)"
        }}
        className="mobile-subcategory-trigger"
      >
        <span style={labelStyle}>{selectedLabel}</span>
        <ChevronDown
          size={16}
          color="#1B1F8C"
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}
        />
      </button>

      {isOpen && (
        <div style={menuStyle} role="listbox" className="mobile-subcategory-menu">
          {/* Option: All Products */}
          <div
            role="option"
            aria-selected={isAll}
            onClick={() => handleSelect("all")}
            style={{
              ...optionStyle,
              backgroundColor: isAll ? "#EEF2FF" : "#FFFFFF",
              fontWeight: isAll ? "700" : "500",
              color: isAll ? "#1B1F8C" : "#14151A"
            }}
            className="mobile-subcategory-option"
          >
            <span>
              {allLabel} ({allCount ?? 0})
            </span>
            {isAll && <Check size={16} color="#16A34A" style={{ flexShrink: 0 }} />}
          </div>

          {/* Subcategory options */}
          {items.map((item) => {
            const slug = item.slug || item.id;
            const isSelected = selectedValue === slug;
            const count =
              categoryCounts[slug] !== undefined
                ? categoryCounts[slug]
                : item.count !== undefined
                ? item.count
                : 0;

            return (
              <div
                key={slug}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(slug)}
                style={{
                  ...optionStyle,
                  backgroundColor: isSelected ? "#EEF2FF" : "#FFFFFF",
                  fontWeight: isSelected ? "700" : "500",
                  color: isSelected ? "#1B1F8C" : "#14151A"
                }}
                className="mobile-subcategory-option"
              >
                <span>
                  {item.name} ({count})
                </span>
                {isSelected && <Check size={16} color="#16A34A" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const wrapperStyle = {
  position: "relative",
  flex: "1 1 0%",
  minWidth: 0,
  width: "100%"
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  width: "100%",
  height: "42px",
  padding: "0 14px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "999px",
  cursor: "pointer",
  boxSizing: "border-box",
  textAlign: "left",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease"
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1B1F8C",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const menuStyle = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
  maxHeight: "280px",
  overflowY: "auto",
  zIndex: 150,
  boxSizing: "border-box",
  padding: "4px 0"
};

const optionStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "42px",
  padding: "10px 14px",
  fontSize: "13px",
  cursor: "pointer",
  borderBottom: "1px solid #F7F7F2",
  transition: "background-color 0.15s ease",
  userSelect: "none"
};
