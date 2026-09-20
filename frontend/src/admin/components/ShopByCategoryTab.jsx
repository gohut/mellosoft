"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import {
  Package, Plus, Edit2, Trash2, GripVertical, CheckCircle2,
  XCircle, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown, ArrowRight,
  Sparkles, ExternalLink, Image as ImageIcon, Palette, Compass, Link as LinkIcon, X
} from "lucide-react";
import {
  CATEGORY_THEME_PRESETS,
  PRESET_IMAGE_OPTIONS,
  DEFAULT_HOMEPAGE_CATEGORIES,
  resolveCategoryTileImage
} from "../../data/homepageCategoriesData";
import CategoryTileImage from "../../components/CategoryTileImage";
import { saveImageBlob, getResolvedImageUrlSync } from "../../utils/imageStorage";

function hexToRgb(hex) {
  let c = (hex || "#3B82F6").replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 59, g: 130, b: 246 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function generateThemeFromColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const pr1 = Math.round(r + (255 - r) * 0.88);
  const pg1 = Math.round(g + (255 - g) * 0.88);
  const pb1 = Math.round(b + (255 - b) * 0.88);

  const pr2 = Math.round(r + (255 - r) * 0.78);
  const pg2 = Math.round(g + (255 - g) * 0.78);
  const pb2 = Math.round(b + (255 - b) * 0.78);

  const pr3 = Math.round(r + (255 - r) * 0.68);
  const pg3 = Math.round(g + (255 - g) * 0.68);
  const pb3 = Math.round(b + (255 - b) * 0.68);

  return {
    color: `rgb(${pr1}, ${pg1}, ${pb1})`,
    gradient: `linear-gradient(135deg, rgb(${pr1}, ${pg1}, ${pb1}) 0%, rgb(${pr2}, ${pg2}, ${pb2}) 50%, rgb(${pr3}, ${pg3}, ${pb3}) 100%)`,
    accentGlow: `rgba(${r}, ${g}, ${b}, 0.45)`,
    ringColor: `rgba(${r}, ${g}, ${b}, 0.2)`
  };
}

export function getImageSrc(img) {
  if (!img) return "";
  if (typeof img === "string") return img.trim();
  if (Array.isArray(img) && img.length > 0) return getImageSrc(img[0]);
  if (typeof img === "object") {
    return (
      (typeof img.url === "string" && img.url.trim()) ||
      (typeof img.src === "string" && img.src.trim()) ||
      (typeof img.secure_url === "string" && img.secure_url.trim()) ||
      (typeof img.path === "string" && img.path.trim()) ||
      ""
    );
  }
  return String(img).trim();
}

export default function ShopByCategoryTab({ showToast, canEdit, canCreate, canDelete }) {
  const {
    homepageCategories = [],
    addHomepageCategory,
    updateHomepageCategory,
    deleteHomepageCategory,
    toggleHomepageCategoryStatus,
    reorderHomepageCategories,
    resetHomepageCategoriesToDefault
  } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Drag-and-drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, id) => {
    dragItem.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, id) => {
    e.preventDefault();
    dragOverItem.current = id;
    setDragOverId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItem.current || dragItem.current === dragOverItem.current) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const list = [...homepageCategories];
    const fromIndex = list.findIndex((c) => c.id === dragItem.current);
    const toIndex = list.findIndex((c) => c.id === dragOverItem.current);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    reorderHomepageCategories(list);
    showToast("Category order updated!");
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const list = [...homepageCategories];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    reorderHomepageCategories(list);
    showToast("Category moved up");
  };

  const moveDown = (index) => {
    if (index === homepageCategories.length - 1) return;
    const list = [...homepageCategories];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    reorderHomepageCategories(list);
    showToast("Category moved down");
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveModal = (formData) => {
    if (editingCategory) {
      updateHomepageCategory(editingCategory.id, formData);
      showToast(`Category "${formData.label}" updated successfully`);
    } else {
      addHomepageCategory(formData);
      showToast(`Category "${formData.label}" added to homepage`);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    deleteHomepageCategory(categoryToDelete.id);
    showToast(`Category "${categoryToDelete.label}" removed`);
    setCategoryToDelete(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all homepage categories to default? This will restore the 6 original category tiles.")) {
      resetHomepageCategoriesToDefault();
      showToast("Homepage categories reset to default");
    }
  };

  const activeCount = homepageCategories.filter((c) => c.isActive !== false && c.active !== false).length;
  const inactiveCount = homepageCategories.length - activeCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="shop-by-cat-tab-wrap">
      <style>{`
        .admin-scrollable-table {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 #F3F4F6;
        }
        .admin-scrollable-table::-webkit-scrollbar {
          height: 6px;
        }
        .admin-scrollable-table::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 999px;
        }
        .admin-scrollable-table::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 999px;
        }
        .admin-scrollable-table::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        .shop-by-category-desktop-table {
          display: block;
        }
        .shop-by-category-mobile-cards {
          display: none;
        }
        .admin-scrollable-hint {
          display: none;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: #4B5563;
          padding: 8px 14px;
          background-color: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
        }
        @media (max-width: 820px) {
          .shop-by-category-desktop-table {
            display: none !important;
          }
          .shop-by-category-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          .admin-scrollable-hint {
            display: none !important;
          }
          .content-stats-grid {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: thin !important;
            gap: 12px !important;
            padding-bottom: 8px !important;
          }
          .content-stats-grid::-webkit-scrollbar {
            height: 4px !important;
            display: block !important;
          }
          .content-stats-grid::-webkit-scrollbar-track {
            background: #F3F4F6 !important;
            border-radius: 999px !important;
          }
          .content-stats-grid::-webkit-scrollbar-thumb {
            background: #D1D5DB !important;
            border-radius: 999px !important;
          }
        }
      `}</style>
      {/* ── Header & Action Bar ── */}
      <div style={headerWrapStyle}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h2 style={tabHeadingStyle}>Shop By Category Management</h2>
            <span style={badgeCountStyle}>{homepageCategories.length} Tiles</span>
          </div>
          <p style={tabSubHeadingStyle}>
            Configure the categories and collection cards displayed in the <strong>"Shop By Category"</strong> section of the homepage.
            Customise tile labels, routing, colors, background gradients, and imagery in real-time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={secondaryBtnStyle}
            title="Reset to default 6 category cards"
          >
            <RotateCcw size={15} color="#4B5563" />
            <span>Reset Defaults</span>
          </button>

          {canCreate !== false && (
            <button
              type="button"
              onClick={handleOpenAdd}
              style={primaryBtnStyle}
            >
              <Plus size={16} color="#FFFFFF" />
              <span>Add Category Tile</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Live Storefront Interactive Preview ── */}
      <div style={previewBoxStyle}>
        <div style={previewHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#1B1F8C" />
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1B1F8C", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Live Storefront Preview
            </span>
          </div>
          <span style={livePillStyle}>● Customer View Synchronized</span>
        </div>

        <div style={previewContentStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#14151A", margin: 0 }}>Shop By Category</h3>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#16A34A", cursor: "pointer" }}>View All</span>
          </div>

          <div style={previewTilesRowStyle} className="preview-tiles-scroll">
            {homepageCategories
              .filter((c) => c.isActive !== false && c.active !== false)
              .map((item) => (
                <div
                  key={item.id || item.label}
                  style={{
                    ...previewTileStyle,
                    background: item.gradient || item.color || "#E0EFFE",
                  }}
                  title={`Click Edit below to customize ${item.label}`}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.12,
                      backgroundImage: `radial-gradient(#14151A 1px, transparent 1px)`,
                      backgroundSize: "8px 8px",
                      pointerEvents: "none"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      filter: "blur(20px)",
                      background: item.accentGlow || "rgba(147, 197, 253, 0.5)",
                      pointerEvents: "none"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "14px",
                      border: `1px solid ${item.ringColor || "rgba(59, 130, 246, 0.16)"}`,
                      pointerEvents: "none"
                    }}
                  />

                  <span style={previewTileLabelStyle}>{item.label}</span>
                  <div style={previewTileImgWrapStyle}>
                    <CategoryTileImage
                      src={resolveCategoryTileImage(item)}
                      alt={item.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: `scale(${item.scale || 1.18})`,
                        transition: "transform 0.2s ease"
                      }}
                    />
                  </div>
                </div>
              ))}
            {activeCount === 0 && (
              <div style={{ padding: "20px", color: "#6B7280", fontSize: "14px", textAlign: "center", width: "100%" }}>
                No active categories to display on homepage. Toggle at least one category to Active.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bar ── */}
      <div style={statsRowStyle} className="content-stats-grid admin-sliding-tabs">
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Total Categories</span>
          <strong style={statValStyle}>{homepageCategories.length}</strong>
          <span style={statSubStyle}>Configured for storefront</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Active & Visible</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }}>{activeCount}</strong>
          <span style={statSubStyle}>Shown to customers</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Hidden / Inactive</span>
          <strong style={{ ...statValStyle, color: inactiveCount > 0 ? "#DC2626" : "#6B7280" }}>{inactiveCount}</strong>
          <span style={statSubStyle}>Not shown on homepage</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Display Order</span>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }}>☰ Drag</strong>
          <span style={statSubStyle}>Grab handle to reorder</span>
        </div>
      </div>

      {/* ── Category Tiles Table / List ── */}
      <div style={tableContainerStyle}>
        {/* Mobile Swipe / Scroll Hint */}
        <div className="admin-scrollable-hint">
          <ArrowRight size={13} color="#1B1F8C" style={{ flexShrink: 0 }} />
          <span>Swipe or scroll horizontally to view all columns (Status, Actions)</span>
        </div>

        {/* ── Desktop Table View (screens > 820px) ── */}
        <div className="shop-by-category-desktop-table" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: "880px" }}>
            <div style={tableHeaderRowStyle}>
              <div style={{ width: "40px", flexShrink: 0 }}></div>
              <div style={{ width: "40px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6B7280", flexShrink: 0 }}>#</div>
              <div style={{ width: "90px", fontSize: "12px", fontWeight: "700", color: "#6B7280", flexShrink: 0 }}>PREVIEW</div>
              <div style={{ flex: 2, minWidth: "140px", fontSize: "12px", fontWeight: "700", color: "#6B7280" }}>CATEGORY NAME</div>
              <div style={{ flex: 2, minWidth: "170px", fontSize: "12px", fontWeight: "700", color: "#6B7280" }}>DESTINATION ROUTE</div>
              <div style={{ flex: 1.5, minWidth: "130px", fontSize: "12px", fontWeight: "700", color: "#6B7280" }}>THEME / COLOR</div>
              <div style={{ width: "110px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#6B7280", flexShrink: 0 }}>STATUS</div>
              <div style={{ width: "130px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#6B7280", flexShrink: 0 }}>ACTIONS</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
              {homepageCategories.map((item, index) => {
                const isDragging = draggingId === item.id;
                const isDragOver = dragOverId === item.id;
                const isActive = item.isActive !== false && item.active !== false;

                let routeDesc = "Mattress Catalog";
                if (item.href) {
                  routeDesc = `Direct Link: ${item.href}`;
                } else if (item.subcategory) {
                  routeDesc = `Subcategory: ${item.subcategory}`;
                } else if (item.firmness) {
                  routeDesc = `Firmness: ${item.firmness}`;
                }

                return (
                  <div
                    key={item.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnter={(e) => handleDragEnter(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    style={{
                      ...rowCardStyle,
                      opacity: isDragging ? 0.4 : 1,
                      border: isDragOver ? "2px dashed #1B1F8C" : "1px solid #E5E7EB",
                      backgroundColor: isDragOver ? "#EEF0FF" : isActive ? "#FFFFFF" : "#F9FAFB"
                    }}
                  >
                    {/* Drag Handle */}
                    <div style={{ ...dragHandleStyle, flexShrink: 0 }} title="Drag to reorder">
                      <GripVertical size={18} color="#9CA3AF" />
                    </div>

                    {/* Index Number */}
                    <div style={{ width: "40px", textAlign: "center", flexShrink: 0 }}>
                      <span style={numberBadgeStyle}>{index + 1}</span>
                    </div>

                    {/* Mini Preview Tile */}
                    <div style={{ width: "90px", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "78px",
                          height: "44px",
                          borderRadius: "8px",
                          background: item.gradient || item.color || "#E0EFFE",
                          position: "relative",
                          overflow: "hidden",
                          border: `1px solid ${item.ringColor || "#CBD5E1"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          paddingRight: "4px"
                        }}
                      >
                        <CategoryTileImage
                          src={resolveCategoryTileImage(item)}
                          alt={item.label}
                          style={{
                            width: "36px",
                            height: "36px",
                            objectFit: "contain",
                            transform: `scale(${item.scale || 1.18})`
                          }}
                        />
                      </div>
                    </div>

                    {/* Category Name */}
                    <div style={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <strong style={{ fontSize: "14px", color: isActive ? "#111827" : "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.label}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>ID: {item.id}</span>
                    </div>

                    {/* Destination Route */}
                    <div style={{ flex: 2, minWidth: 0, display: "flex", alignItems: "center", overflow: "hidden" }}>
                      <span style={{ ...routeBadgeStyle, maxWidth: "100%", overflow: "hidden" }}>
                        <Compass size={12} color="#1B1F8C" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {routeDesc}
                        </span>
                      </span>
                    </div>

                    {/* Theme Preview */}
                    <div style={{ flex: 1.5, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          background: item.gradient || item.color || "#E0EFFE",
                          border: "1px solid #D1D5DB",
                          flexShrink: 0
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#4B5563", textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {CATEGORY_THEME_PRESETS.find((p) => p.color === item.color)?.name || "Custom"}
                      </span>
                    </div>

                    {/* Status Toggle */}
                    <div style={{ width: "110px", textAlign: "center", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleHomepageCategoryStatus(item.id);
                          showToast(`"${item.label}" ${isActive ? "hidden" : "visible"} on homepage`);
                        }}
                        style={{
                          ...statusBtnStyle,
                          backgroundColor: isActive ? "#DEF7EC" : "#F3F4F6",
                          color: isActive ? "#03543F" : "#6B7280",
                          borderColor: isActive ? "#BCF0DA" : "#E5E7EB"
                        }}
                      >
                        {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{isActive ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div style={{ width: "130px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        style={{ ...actionIconBtnStyle, opacity: index === 0 ? 0.3 : 1 }}
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === homepageCategories.length - 1}
                        style={{ ...actionIconBtnStyle, opacity: index === homepageCategories.length - 1 ? 0.3 : 1 }}
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {canEdit !== false && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          style={{ ...actionIconBtnStyle, color: "#1B1F8C" }}
                          title="Edit Category Card"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      {canDelete !== false && (
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(item)}
                          style={{ ...actionIconBtnStyle, color: "#DC2626" }}
                          title="Delete Category Card"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile Card View (screens <= 820px) ── */}
        <div className="shop-by-category-mobile-cards">
          {homepageCategories.map((item, index) => {
            const isActive = item.isActive !== false && item.active !== false;

            let routeDesc = "Mattress Catalog";
            if (item.href) {
              routeDesc = `Direct Link: ${item.href}`;
            } else if (item.subcategory) {
              routeDesc = `Subcategory: ${item.subcategory}`;
            } else if (item.firmness) {
              routeDesc = `Firmness: ${item.firmness}`;
            }

            return (
              <div
                key={item.id || index}
                style={{
                  ...mobileCardStyle,
                  backgroundColor: isActive ? "#FFFFFF" : "#F9FAFB",
                  borderColor: isActive ? "#E5E7EB" : "#F3F4F6"
                }}
              >
                {/* Top Row: Index + Preview + Name + Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <span style={numberBadgeStyle}>#{index + 1}</span>
                    <div
                      style={{
                        width: "56px",
                        height: "36px",
                        borderRadius: "8px",
                        background: item.gradient || item.color || "#E0EFFE",
                        border: `1px solid ${item.ringColor || "#CBD5E1"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "3px",
                        flexShrink: 0
                      }}
                    >
                      <CategoryTileImage
                        src={resolveCategoryTileImage(item)}
                        alt={item.label}
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "contain",
                          transform: `scale(${item.scale || 1.18})`
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <strong style={{ fontSize: "14px", color: isActive ? "#111827" : "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>ID: {item.id}</span>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleHomepageCategoryStatus(item.id);
                      showToast(`"${item.label}" ${isActive ? "hidden" : "visible"} on homepage`);
                    }}
                    style={{
                      ...statusBtnStyle,
                      backgroundColor: isActive ? "#DEF7EC" : "#F3F4F6",
                      color: isActive ? "#03543F" : "#6B7280",
                      borderColor: isActive ? "#BCF0DA" : "#E5E7EB",
                      flexShrink: 0
                    }}
                  >
                    {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{isActive ? "Visible" : "Hidden"}</span>
                  </button>
                </div>

                {/* Middle Row: Route Badge & Theme Pill */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ ...routeBadgeStyle, maxWidth: "100%", fontSize: "11.5px" }}>
                    <Compass size={12} color="#1B1F8C" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {routeDesc}
                    </span>
                  </span>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", padding: "3px 8px", borderRadius: "8px" }}>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "4px",
                        background: item.gradient || item.color || "#E0EFFE",
                        border: "1px solid #D1D5DB",
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: "11.5px", color: "#4B5563", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                      {CATEGORY_THEME_PRESETS.find((p) => p.color === item.color)?.name || "Custom"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Row: Move Up/Down + Edit + Delete */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      style={{
                        ...actionIconBtnStyle,
                        opacity: index === 0 ? 0.3 : 1,
                        padding: "6px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        width: "auto"
                      }}
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                      <span>Up</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === homepageCategories.length - 1}
                      style={{
                        ...actionIconBtnStyle,
                        opacity: index === homepageCategories.length - 1 ? 0.3 : 1,
                        padding: "6px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        width: "auto"
                      }}
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                      <span>Down</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {canEdit !== false && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        style={{
                          ...actionIconBtnStyle,
                          color: "#1B1F8C",
                          backgroundColor: "#EEF0FF",
                          borderColor: "#C7D2FE",
                          padding: "6px 12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          width: "auto"
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    )}

                    {canDelete !== false && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(item)}
                        style={{
                          ...actionIconBtnStyle,
                          color: "#DC2626",
                          backgroundColor: "#FEF2F2",
                          borderColor: "#FECACA",
                          padding: "6px 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          width: "auto"
                        }}
                        title="Delete Category Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add / Edit Category Tile Modal ── */}
      {isModalOpen && (
        <CategoryTileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          initialData={editingCategory}
          existingCategories={homepageCategories}
        />
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {categoryToDelete && typeof document !== "undefined" && createPortal(
        <div style={modalOverlayStyle} onClick={() => setCategoryToDelete(null)}>
          <div style={confirmCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>
                Remove Category Tile?
              </h3>
            </div>
            <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              Are you sure you want to remove <strong>"{categoryToDelete.label}"</strong> from the homepage category grid? You can re-add it or reset to defaults anytime.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                style={secondaryBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{ ...primaryBtnStyle, backgroundColor: "#DC2626", borderColor: "#DC2626" }}
              >
                Delete Tile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * Add / Edit Category Tile Modal
 */
function CategoryTileModal({ isOpen, onClose, onSave, initialData, existingCategories }) {
  const [label, setLabel] = useState(initialData?.label || "");
  const [destType, setDestType] = useState(() => {
    if (initialData?.href) return "href";
    if (initialData?.subcategory) return "subcategory";
    if (initialData?.firmness) return "firmness";
    return "subcategory";
  });
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || "memory-foam");
  const [firmness, setFirmness] = useState(initialData?.firmness || "Hybrid");
  const [href, setHref] = useState(initialData?.href || "");
  const [image, setImage] = useState(() => resolveCategoryTileImage(initialData));
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    if (!initialData) return "blue-ice";
    const found = CATEGORY_THEME_PRESETS.find((p) => p.color === initialData.color);
    return found ? found.id : "custom";
  });
  const [customHex, setCustomHex] = useState(initialData?.customHex || "#3B82F6");
  const [color, setColor] = useState(initialData?.color || "#E0EFFE");
  const [gradient, setGradient] = useState(initialData?.gradient || "linear-gradient(135deg, #E8F3FE 0%, #D4E8FC 50%, #C3DEFA 100%)");
  const [accentGlow, setAccentGlow] = useState(initialData?.accentGlow || "rgba(147, 197, 253, 0.5)");
  const [ringColor, setRingColor] = useState(initialData?.ringColor || "rgba(59, 130, 246, 0.16)");
  const [scale, setScale] = useState(initialData?.scale || 1.18);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false && initialData?.active !== false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectTheme = (theme) => {
    setSelectedThemeId(theme.id);
    setColor(theme.color);
    setGradient(theme.gradient);
    setAccentGlow(theme.accentGlow);
    setRingColor(theme.ringColor);
  };

  const handleSelectCustomColor = (hex) => {
    setCustomHex(hex);
    setSelectedThemeId("custom");
    const generated = generateThemeFromColor(hex);
    setColor(generated.color);
    setGradient(generated.gradient);
    setAccentGlow(generated.accentGlow);
    setRingColor(generated.ringColor);
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const idbKey = `idb:cat-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await saveImageBlob(idbKey, file);
        setImage(idbKey);
      } catch (err) {
        console.warn("Category image upload error:", err);
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (typeof reader.result === "string") {
            const idbKey = `idb:cat-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await saveImageBlob(idbKey, reader.result);
            setImage(idbKey);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanLabel = typeof label === "string" ? label.trim() : String(label || "").trim();
    if (!cleanLabel) {
      setErrorMsg("Category Title / Label is required");
      return;
    }

    let safeImage = getImageSrc(image) || resolveCategoryTileImage({ label: cleanLabel, firmness, href, subcategory });
    if (safeImage.startsWith("data:")) {
      const idbKey = `idb:cat-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await saveImageBlob(idbKey, safeImage);
      safeImage = idbKey;
    }

    const payload = {
      label: cleanLabel,
      category: destType === "href" ? "" : "mattress",
      subcategory: destType === "subcategory" ? subcategory : null,
      firmness: destType === "firmness" ? firmness : "",
      href: destType === "href" ? (typeof href === "string" ? href.trim() : String(href || "").trim()) : "",
      image: safeImage,
      color,
      gradient,
      accentGlow,
      ringColor,
      customHex: selectedThemeId === "custom" ? customHex : undefined,
      scale: Number(scale) || 1.18,
      isActive
    };

    onSave(payload);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div style={modalOverlayStyle} className="modal-overlay admin-modal" onClick={onClose}>
      <div style={modalDialogStyle} className="modal-dialog admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={modalHeaderStyle}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111827", margin: 0 }}>
              {initialData ? "Edit Category Tile" : "Add Homepage Category Tile"}
            </h3>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              Configure how this category tile appears and where it navigates.
            </span>
          </div>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Close">
            <X size={18} color="#6B7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Live Card Preview Box */}
          <div style={modalPreviewBoxStyle}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
              Live Tile Preview
            </span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  ...previewTileStyle,
                  background: gradient || color,
                  width: "180px",
                  height: "76px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.12,
                    backgroundImage: `radial-gradient(#14151A 1px, transparent 1px)`,
                    backgroundSize: "8px 8px",
                    pointerEvents: "none"
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                    background: accentGlow,
                    pointerEvents: "none"
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "14px",
                    border: `1px solid ${ringColor}`,
                    pointerEvents: "none"
                  }}
                />
                <span style={previewTileLabelStyle}>{label || "Category Name"}</span>
                <div style={previewTileImgWrapStyle}>
                  <CategoryTileImage
                    src={getImageSrc(image) || resolveCategoryTileImage({ label, firmness, href, subcategory })}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: `scale(${scale})`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={errorBannerStyle}>
              {errorMsg}
            </div>
          )}

          {/* Title / Label Input */}
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>Category Title / Label *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="e.g. Memory Foam, Latex, Pillows, Bed Frames"
              style={inputStyle}
              required
            />
          </div>

          {/* Navigation Destination */}
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>Destination Route / Link Target</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => setDestType("subcategory")}
                style={{
                  ...destTabBtnStyle,
                  backgroundColor: destType === "subcategory" ? "#1B1F8C" : "#F3F4F6",
                  color: destType === "subcategory" ? "#FFFFFF" : "#4B5563"
                }}
              >
                Mattress Subcategory
              </button>
              <button
                type="button"
                onClick={() => setDestType("firmness")}
                style={{
                  ...destTabBtnStyle,
                  backgroundColor: destType === "firmness" ? "#1B1F8C" : "#F3F4F6",
                  color: destType === "firmness" ? "#FFFFFF" : "#4B5563"
                }}
              >
                Mattress Firmness
              </button>
              <button
                type="button"
                onClick={() => setDestType("href")}
                style={{
                  ...destTabBtnStyle,
                  backgroundColor: destType === "href" ? "#1B1F8C" : "#F3F4F6",
                  color: destType === "href" ? "#FFFFFF" : "#4B5563"
                }}
              >
                Direct Link / URL
              </button>
            </div>

            {destType === "subcategory" && (
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                style={selectStyle}
              >
                <option value="memory-foam">Memory Foam (/mattresses/memory-foam)</option>
                <option value="latex">Latex (/mattresses/latex)</option>
                <option value="orthopedic">Orthopedic (/mattresses/orthopedic)</option>
                <option value="pocket-spring">Pocket Spring (/mattresses/pocket-spring)</option>
                <option value="cool-gel">Cool Gel (/mattresses/cool-gel)</option>
                <option value="dual-comfort">Dual Comfort (/mattresses/dual-comfort)</option>
                <option value="bamboo">Bamboo (/mattresses/bamboo)</option>
              </select>
            )}

            {destType === "firmness" && (
              <select
                value={firmness}
                onChange={(e) => setFirmness(e.target.value)}
                style={selectStyle}
              >
                <option value="Hybrid">Hybrid (Catalog filtered by Hybrid)</option>
                <option value="Firm">Firm (Catalog filtered by Firm)</option>
                <option value="Medium">Medium (Catalog filtered by Medium)</option>
                <option value="Soft">Soft (Catalog filtered by Soft)</option>
              </select>
            )}

            {destType === "href" && (
              <div>
                <input
                  type="text"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="/accessories/memory-foam-pillow or /bed-frames"
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {[
                    { label: "Pillows", val: "/accessories/memory-foam-pillow" },
                    { label: "Bed Frames", val: "/bed-frames" },
                    { label: "Protectors", val: "/accessories/mattress-protector" },
                    { label: "Catalog", val: "/catalog" }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setHref(preset.val)}
                      style={presetChipStyle}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color & Gradient Theme Selector */}
          <div style={formGroupStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={formLabelStyle}>
                <Palette size={14} style={{ display: "inline", marginRight: "4px" }} />
                Card Color Theme & Glow
              </label>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280" }}>
                Choose preset or pick custom color
              </span>
            </div>

            <div style={themeGridStyle}>
              {CATEGORY_THEME_PRESETS.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme)}
                    style={{
                      ...themeSwatchBtnStyle,
                      border: isSelected ? "2px solid #1B1F8C" : "1px solid #E5E7EB",
                      background: theme.gradient,
                      boxShadow: isSelected ? "0 0 0 2px #C7CAF0" : "none"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#1E293B" }}>
                      {theme.name}
                    </span>
                    {isSelected && <CheckCircle2 size={13} color="#1B1F8C" style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}

              {/* Custom Color Button in Grid */}
              <button
                type="button"
                onClick={() => handleSelectCustomColor(customHex)}
                style={{
                  ...themeSwatchBtnStyle,
                  border: selectedThemeId === "custom" ? "2px solid #1B1F8C" : "1px solid #E5E7EB",
                  background: selectedThemeId === "custom" ? gradient : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                  boxShadow: selectedThemeId === "custom" ? "0 0 0 2px #C7CAF0" : "none"
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#1E293B", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Palette size={12} color="#1B1F8C" />
                  Custom Color
                </span>
                {selectedThemeId === "custom" && <CheckCircle2 size={13} color="#1B1F8C" style={{ marginLeft: "auto" }} />}
              </button>
            </div>

            {/* Custom Color Picker Panel */}
            <div style={{ marginTop: "10px", padding: "12px 14px", backgroundColor: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => handleSelectCustomColor(e.target.value)}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      border: "1px solid #D1D5DB",
                      cursor: "pointer",
                      padding: "1px",
                      backgroundColor: "#FFFFFF"
                    }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151" }}>Color Picker</span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600" }}>Hex:</span>
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomHex(val);
                      if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
                        handleSelectCustomColor(val);
                      }
                    }}
                    placeholder="#3B82F6"
                    style={{
                      width: "90px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #D1D5DB",
                      fontSize: "12px",
                      fontWeight: "700",
                      fontFamily: "monospace",
                      color: "#111827",
                      backgroundColor: "#FFFFFF"
                    }}
                  />
                </div>

                {/* Quick Accent Swatches */}
                <div style={{ display: "flex", gap: "5px", alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
                  {[
                    { name: "Rose", hex: "#F43F5E" },
                    { name: "Crimson", hex: "#E11D48" },
                    { name: "Orange", hex: "#F97316" },
                    { name: "Amber", hex: "#EAB308" },
                    { name: "Lime", hex: "#84CC16" },
                    { name: "Emerald", hex: "#10B981" },
                    { name: "Cyan", hex: "#06B6D4" },
                    { name: "Sky", hex: "#0EA5E9" },
                    { name: "Indigo", hex: "#6366F1" },
                    { name: "Purple", hex: "#A855F7" },
                    { name: "Fuchsia", hex: "#D946EF" }
                  ].map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => handleSelectCustomColor(p.hex)}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: p.hex,
                        border: customHex.toLowerCase() === p.hex.toLowerCase() && selectedThemeId === "custom" ? "2px solid #14151A" : "1px solid rgba(0,0,0,0.12)",
                        cursor: "pointer",
                        transform: customHex.toLowerCase() === p.hex.toLowerCase() && selectedThemeId === "custom" ? "scale(1.2)" : "scale(1)",
                        transition: "transform 0.15s ease"
                      }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Selection & Scale */}
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>
              <ImageIcon size={14} style={{ display: "inline", marginRight: "4px" }} />
              Category Image
            </label>
            <input
              type="text"
              value={typeof image === "string" ? image : getImageSrc(image)}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL path or upload file"
              style={inputStyle}
            />

            {/* Quick preset images */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
              {PRESET_IMAGE_OPTIONS.map((opt) => {
                const currentVal = typeof image === "string" ? image : getImageSrc(image);
                return (
                  <button
                    key={opt.url}
                    type="button"
                    onClick={() => setImage(opt.url)}
                    style={{
                      ...presetChipStyle,
                      backgroundColor: currentVal === opt.url ? "#EEF0FF" : "#F3F4F6",
                      borderColor: currentVal === opt.url ? "#1B1F8C" : "#E5E7EB",
                      color: currentVal === opt.url ? "#1B1F8C" : "#4B5563"
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* File Upload Alternative */}
            <div style={{ marginTop: "10px" }}>
              <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>
                Or upload local image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                style={{ fontSize: "12px" }}
              />
            </div>

            {/* Image Scale Slider */}
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#4B5563", marginBottom: "4px" }}>
                <span>Image Zoom / Scale:</span>
                <strong>{scale}x</strong>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.02"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#1B1F8C" }}
              />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
            <div>
              <strong style={{ fontSize: "14px", color: "#111827", display: "block" }}>Show on Homepage</strong>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>Enable to make this tile visible to customers.</span>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: "20px", height: "20px", accentColor: "#1B1F8C", cursor: "pointer" }}
            />
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={secondaryBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={primaryBtnStyle}
            >
              {initialData ? "Save Changes" : "Create Category Tile"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Inlined Style Objects ──
const headerWrapStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  paddingBottom: "16px",
  borderBottom: "1px solid #E5E7EB"
};

const tabHeadingStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#111827",
  margin: 0
};

const tabSubHeadingStyle = {
  fontSize: "14px",
  color: "#6B7280",
  margin: 0,
  maxWidth: "720px",
  lineHeight: "1.5"
};

const badgeCountStyle = {
  fontSize: "12px",
  fontWeight: "700",
  backgroundColor: "#EEF0FF",
  color: "#1B1F8C",
  padding: "3px 10px",
  borderRadius: "20px"
};

const primaryBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "1px solid #1B1F8C",
  borderRadius: "10px",
  padding: "10px 18px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(27, 31, 140, 0.2)",
  transition: "all 0.15s ease"
};

const secondaryBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#FFFFFF",
  color: "#374151",
  border: "1px solid #D1D5DB",
  borderRadius: "10px",
  padding: "10px 16px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer"
};

const previewBoxStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
};

const previewHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid #F3F4F6"
};

const livePillStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#16A34A",
  backgroundColor: "#DEF7EC",
  padding: "3px 10px",
  borderRadius: "20px"
};

const previewContentStyle = {
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  padding: "20px",
  border: "1px solid #E5E7EB"
};

const previewTilesRowStyle = {
  display: "flex",
  gap: "14px",
  overflowX: "auto",
  paddingBottom: "10px",
  scrollbarWidth: "thin"
};

const previewTileStyle = {
  flex: "0 0 170px",
  height: "76px",
  borderRadius: "14px",
  position: "relative",
  overflow: "hidden",
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxSizing: "border-box",
  cursor: "default"
};

const previewTileLabelStyle = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#14151A",
  position: "relative",
  zIndex: 2,
  maxWidth: "75px",
  lineHeight: "1.2"
};

const previewTileImgWrapStyle = {
  position: "relative",
  zIndex: 2,
  width: "56px",
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const statsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px"
};

const statCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "14px",
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
};

const statLabelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B7280",
  textTransform: "uppercase"
};

const statValStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#111827"
};

const statSubStyle = {
  fontSize: "12px",
  color: "#9CA3AF"
};

const tableContainerStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
};

const tableHeaderRowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  backgroundColor: "#F9FAFB",
  borderBottom: "1px solid #E5E7EB",
  gap: "12px"
};

const mobileCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "14px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease"
};

const rowCardStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: "12px",
  gap: "12px",
  transition: "all 0.15s ease",
  boxSizing: "border-box"
};

const dragHandleStyle = {
  cursor: "grab",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px"
};

const numberBadgeStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#6B7280",
  backgroundColor: "#F3F4F6",
  padding: "3px 8px",
  borderRadius: "6px"
};

const routeBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "12px",
  fontWeight: "600",
  backgroundColor: "#F0F0FB",
  color: "#1B1F8C",
  padding: "4px 10px",
  borderRadius: "8px",
  maxWidth: "240px"
};

const statusBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "5px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "700",
  border: "1px solid transparent",
  cursor: "pointer"
};

const actionIconBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "1px solid #E5E7EB",
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
  color: "#4B5563"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  zIndex: 999999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  overflow: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none"
};

const modalDialogStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px",
  maxWidth: "560px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  position: "relative",
  margin: "auto"
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: "20px",
  paddingBottom: "14px",
  borderBottom: "1px solid #E5E7EB"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px"
};

const modalPreviewBoxStyle = {
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  padding: "16px",
  border: "1px solid #E5E7EB",
  textAlign: "center"
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const formLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151"
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  width: "100%"
};

const selectStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box",
  width: "100%"
};

const destTabBtnStyle = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const presetChipStyle = {
  fontSize: "11px",
  fontWeight: "600",
  padding: "3px 8px",
  borderRadius: "6px",
  backgroundColor: "#F3F4F6",
  color: "#4B5563",
  border: "1px solid #E5E7EB",
  cursor: "pointer"
};

const themeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
  gap: "8px"
};

const themeSwatchBtnStyle = {
  padding: "8px 10px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const errorBannerStyle = {
  padding: "10px 14px",
  backgroundColor: "#FEE2E2",
  color: "#DC2626",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600"
};

const confirmCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "420px",
  width: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
};
