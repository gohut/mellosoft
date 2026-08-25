"use client";

import React, { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import HeroSlideCard from "../../components/HeroSlideCard";
import PromoBannerCard from "../../components/PromoBannerCard";
import PromoBannerRenderer from "../../components/PromoBannerRenderer";
import {
  LayoutList, Image as ImageIcon, Plus, Edit2, Trash2,
  CheckCircle2, XCircle, Search, GripVertical,
  Eye, EyeOff, Check, ChevronRight, Star, Tag, Zap, Package, Info, AlertTriangle, Award
} from "lucide-react";
import {
  isProductInCategory,
  getProductCategoryLabel,
  getProductPrimaryImage,
  getMinimumProductPrice,
  formatPrice,
  isProductDeleted
} from "../../utils/productHelpers";

// ─── Banner types and destinations ────────────────────────────────────────────
const BANNER_TYPES = ["Offer", "New Arrival", "Promotion", "Collection"];

const DESTINATION_OPTIONS = [
  { label: "Mattresses Collection", value: "mattress" },
  { label: "Pillows Collection",    value: "pillows" },
  { label: "Bed Frames Collection", value: "bed frames" },
  { label: "Protectors Collection", value: "protectors" },
  { label: "All Products Catalog",  value: "All" },
];

// ─── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "homepage-layout", label: "Homepage Layout",   icon: LayoutList },
  { id: "hero-slides",     label: "Hero Slides",       icon: Star },
  { id: "promo-banners",   label: "Promo Banners",     icon: Tag },
  { id: "new-arrivals",    label: "New Arrivals",      icon: Zap },
  { id: "best-sellers",    label: "Best Sellers",      icon: Award },
];

// ─── Section icons for Homepage Layout ────────────────────────────────────────
const SECTION_ICONS = {
  "hero-slider":      Star,
  "shop-by-category": Package,
  "promo-banner":     Tag,
  "promo-banners":    Tag,
  "new-arrivals":     Zap,
  "best-sellers":     CheckCircle2,
  "customer-reviews": Star,
  "about-us":         Info,
  "about-section":    Info,
  "big-deals":        Eye,
};

// ─── Banner type filter per tab ────────────────────────────────────────────────
// Hero Slides → type "Offer"      (feeds the homepage hero slider)
// Promo Banners → type "Promotion" (feeds the promo banner section)
// New Arrivals → type "New Arrival" (feeds the new arrivals section)
const TAB_BANNER_FILTER = {
  "hero-slides":   "Offer",
  "promo-banners": "Promotion",
  "new-arrivals":  "New Arrival",
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main ContentView component
// ═══════════════════════════════════════════════════════════════════════════════
export default function ContentView() {
  const {
    banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus, reorderBanners,
    bannerTypes, addBannerType, deleteBannerType,
    homepageConfig, updateHomepageConfig, contentActiveTab
  } = useAdmin();

  const [activeTab, setActiveTab] = useState(contentActiveTab || "homepage-layout");
  const [toastMessage, setToastMessage] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  React.useEffect(() => {
    if (contentActiveTab) {
      setActiveTab(contentActiveTab);
    }
  }, [contentActiveTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Derive dynamic tabs (built-in + custom sections) without infinite loop
  const dynamicTabs = React.useMemo(() => {
    const builtInTabs = [
      { id: "homepage-layout", label: "Homepage Layout", icon: LayoutList },
      { id: "hero-slides",     label: "Hero Slides",     icon: Star },
      { id: "promo-banners",   label: "Promo Banners",   icon: Tag },
      { id: "new-arrivals",    label: "New Arrivals",    icon: Zap },
      { id: "best-sellers",    label: "Best Sellers",    icon: Award },
    ];

    const customSections = (homepageConfig?.sections || []).filter((s) => s.isCustom);
    const customTabs = customSections.map((s) => ({
      id: s.id,
      label: s.name || s.label || "Custom Section",
      icon: Package,
      isCustom: true,
      section: s,
    }));

    return [...builtInTabs, ...customTabs];
  }, [homepageConfig]);

  const activeTabRef = useRef(null);

  React.useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }, [activeTab]);

  return (
    <div style={containerStyle} className="admin-fade-in content-page-container">
      <style>{`
        .content-tab-list::-webkit-scrollbar {
          display: none;
        }
        .content-tab-list {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .content-mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-fade-in, .content-page-container {
            padding: 12px 12px 40px 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .content-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .content-title-text {
            font-size: 20px !important;
          }
          .content-subtitle-text {
            font-size: 12.5px !important;
          }
          .content-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .content-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .content-search-wrap, .content-select-filter {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .content-create-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px !important;
          }
          .content-desktop-table {
            display: none !important;
          }
          .content-mobile-cards {
            display: flex !important;
          }
          .content-modal-card {
            width: calc(100vw - 24px) !important;
            max-width: 100vw !important;
            padding: 16px !important;
            border-radius: 14px !important;
          }
          .content-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .content-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .content-stat-card {
            padding: 12px 10px !important;
          }
          .content-stat-val {
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* Toast */}
      {toastMessage && (
        <div style={toastStyle} role="alert">
          <Check size={16} color="#FFFFFF" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={headerRowStyle} className="content-header-row">
        <div>
          <div style={badgeRowStyle}>
            <span style={adminBadgeStyle}>
              <LayoutList size={14} color="#1B1F8C" />
              Homepage Management
            </span>
          </div>
          <h1 style={titleStyle} className="content-title-text">Homepage Content</h1>
          <p style={subtitleStyle} className="content-subtitle-text">
            Manage and customize your user homepage — control layout, promotional banners, hero slides, and featured sections from one place.
          </p>
        </div>
      </div>

      {/* Tab Bar with Horizontal Overflow & Plus Button */}
      <div style={tabBarStyle} className="content-tab-bar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            flexWrap: "nowrap",
            width: "100%",
            paddingBottom: "4px",
            boxSizing: "border-box"
          }}
          className="content-tab-list"
        >
          {dynamicTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...tabBtnStyle,
                  backgroundColor: isActive ? "#1B1F8C" : "transparent",
                  color: isActive ? "#FFFFFF" : "#6B6B75",
                  borderColor: isActive ? "#1B1F8C" : "#E7E7E2",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#F0F0FB";
                    e.currentTarget.style.color = "#1B1F8C";
                    e.currentTarget.style.borderColor = "#C7CAF0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#6B6B75";
                    e.currentTarget.style.borderColor = "#E7E7E2";
                  }
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {tab.label}
              </button>
            );
          })}

          {/* Compact Plus Button for Creating Custom Homepage Product Section */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            title="Create Homepage Product Section"
            style={{
              ...tabBtnStyle,
              backgroundColor: "#F0F0FB",
              color: "#1B1F8C",
              borderColor: "#C7CAF0",
              fontWeight: "800",
              padding: "8px 14px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1B1F8C";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "#1B1F8C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F0F0FB";
              e.currentTarget.style.color = "#1B1F8C";
              e.currentTarget.style.borderColor = "#C7CAF0";
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: "24px" }}>
        {activeTab === "homepage-layout" && (
          <HomepageLayoutTab
            homepageConfig={homepageConfig}
            updateHomepageConfig={updateHomepageConfig}
            showToast={showToast}
          />
        )}
        {activeTab === "hero-slides" && (
          <BannerTab
            tabId="hero-slides"
            banners={banners}
            addBanner={addBanner}
            updateBanner={updateBanner}
            deleteBanner={deleteBanner}
            toggleBannerStatus={toggleBannerStatus}
            reorderBanners={reorderBanners}
            bannerTypes={bannerTypes}
            addBannerType={addBannerType}
            deleteBannerType={deleteBannerType}
            showToast={showToast}
            title="Hero Slides"
            description="Manage the homepage hero slider. These slides (type = Offer) appear at the very top of the user homepage. Add, edit, reorder, or toggle slides — changes reflect immediately on the homepage slider."
            createLabel="Add Hero Slide"
            emptyMsg="No hero slides yet. Create slides with type 'Offer' to populate the homepage hero slider."
            defaultType="Offer"
            filterType="Offer"
          />
        )}
        {activeTab === "promo-banners" && (
          <BannerTab
            tabId="promo-banners"
            banners={banners}
            addBanner={addBanner}
            updateBanner={updateBanner}
            deleteBanner={deleteBanner}
            toggleBannerStatus={toggleBannerStatus}
            reorderBanners={reorderBanners}
            bannerTypes={bannerTypes}
            addBannerType={addBannerType}
            deleteBannerType={deleteBannerType}
            showToast={showToast}
            title="Promo Banners"
            description="Manage promotional banners and special offer campaigns displayed on the homepage."
            createLabel="Create Promo Banner"
            emptyMsg="No promotional banners yet. Create your first promo banner to attract customers."
            defaultType="Promotion"
            filterType="Promotion"
          />
        )}
        {activeTab === "new-arrivals" && (
          <NewArrivalsTab showToast={showToast} />
        )}
        {activeTab === "best-sellers" && (
          <BestSellersTab showToast={showToast} />
        )}

        {/* Custom Section Tab Renderer */}
        {dynamicTabs.some((t) => t.isCustom && t.id === activeTab) && (
          <CustomSectionTab
            sectionId={activeTab}
            homepageConfig={homepageConfig}
            updateHomepageConfig={updateHomepageConfig}
            showToast={showToast}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {/* Modal for Creating New Custom Section */}
      {isCreateModalOpen && (
        <CreateSectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          homepageConfig={homepageConfig}
          updateHomepageConfig={updateHomepageConfig}
          showToast={showToast}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Homepage Layout Tab — drag-to-reorder sections with visibility toggles
// ═══════════════════════════════════════════════════════════════════════════════
function HomepageLayoutTab({ homepageConfig, updateHomepageConfig, showToast }) {
  const sections = homepageConfig?.sections || [];
  const [dragOverId, setDragOverId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
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

    const newSections = [...sections];
    const fromIndex = newSections.findIndex((s) => s.id === dragItem.current);
    const toIndex = newSections.findIndex((s) => s.id === dragOverItem.current);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    updateHomepageConfig({ ...homepageConfig, sections: newSections });
    showToast("Section order updated!");
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

  const toggleVisibility = (id) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    updateHomepageConfig({ ...homepageConfig, sections: updated });
    const sec = sections.find((s) => s.id === id);
    showToast(`"${sec?.label}" ${sec?.visible ? "hidden" : "shown"} on homepage`);
  };

  const visibleCount = sections.filter((s) => s.visible).length;

  return (
    <div>
      {/* Stats row */}
      <div style={statsRowStyle}>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Total Sections</span>
          <strong style={statValStyle}>{sections.length}</strong>
          <span style={statSubStyle}>Homepage sections configured</span>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Visible Sections</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }}>{visibleCount}</strong>
          <span style={statSubStyle}>Shown to customers</span>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Hidden Sections</span>
          <strong style={{ ...statValStyle, color: "#DC2626" }}>{sections.length - visibleCount}</strong>
          <span style={statSubStyle}>Not displayed on homepage</span>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Drag to Reorder</span>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }}>☰</strong>
          <span style={statSubStyle}>Grab handle to change order</span>
        </div>
      </div>

      {/* Info banner */}
      <div style={infoBannerStyle}>
        <GripVertical size={16} color="#1B1F8C" />
        <span>Drag the <strong>☰ handle</strong> on any section to reorder it. Use the toggle to show or hide sections from the user homepage.</span>
      </div>

      {/* Section list */}
      <div style={sectionListStyle}>
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.id] || LayoutList;
          const isDragging = draggingId === section.id;
          const isDragOver = dragOverId === section.id;
          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragEnter={(e) => handleDragEnter(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              style={{
                ...sectionCardStyle,
                opacity: isDragging ? 0.45 : 1,
                border: isDragOver ? "2px dashed #1B1F8C" : "1px solid #E7E7E2",
                backgroundColor: isDragOver ? "#EEF0FF" : "#FFFFFF",
                transform: isDragging ? "scale(0.98)" : "scale(1)",
                transition: "all 0.15s ease",
              }}
            >
              {/* Drag handle */}
              <div
                style={dragHandleStyle}
                title="Drag to reorder"
              >
                <GripVertical size={20} color="#9CA3AF" />
              </div>

              {/* Section number */}
              <div style={sectionNumberStyle}>
                <span style={sectionNumberBadgeStyle}>{index + 1}</span>
              </div>

              {/* Icon */}
              <div style={{
                ...sectionIconWrapStyle,
                backgroundColor: section.visible ? "#EEF0FF" : "#F7F7F2",
              }}>
                <Icon size={18} color={section.visible ? "#1B1F8C" : "#9CA3AF"} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: section.visible ? "#14151A" : "#9CA3AF",
                  }}>
                    {section.label}
                  </strong>
                  {(section.type === "promo-banner" || section.bannerId) && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1B1F8C",
                      backgroundColor: "#EEF0FF",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      letterSpacing: "0.02em"
                    }}>
                      Promo Banner • Promotion
                    </span>
                  )}
                  {!section.visible && (
                    <span style={hiddenBadgeStyle}>Hidden</span>
                  )}
                </div>
                <p style={{
                  fontSize: "12.5px",
                  color: "#6B6B75",
                  margin: 0,
                  marginTop: "2px",
                }}>
                  {section.description || (section.type === "promo-banner" ? "Independent static banner block" : "")}
                </p>
              </div>

              {/* Visibility toggle button only */}
              <button
                type="button"
                onClick={() => toggleVisibility(section.id)}
                style={{
                  ...toggleBtnStyle,
                  backgroundColor: section.visible ? "#DCFCE7" : "#FEE2E2",
                  color: section.visible ? "#16A34A" : "#DC2626",
                  border: `1px solid ${section.visible ? "#86EFAC" : "#FCA5A5"}`,
                }}
                title={section.visible ? "Click to hide section" : "Click to show section"}
              >
                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                {section.visible ? "Visible" : "Hidden"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Banner Tab — shared UI for Hero Slides, Promo Banners, New Arrivals
// Uses existing banner data from AdminContext — no duplication
// ═══════════════════════════════════════════════════════════════════════════════
function BannerTab({
  tabId, banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus, reorderBanners,
  bannerTypes = [], addBannerType, deleteBannerType,
  showToast, title, description, createLabel, emptyMsg, defaultType, filterType
}) {
  const { products = [] } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteModalBanner, setDeleteModalBanner] = useState(null);

  // Add / Manage Type Modal state
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [cannotDeleteModal, setCannotDeleteModal] = useState(null);

  // Drag and drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  // Compute available types dynamically
  const availableTypes = React.useMemo(() => {
    const customNames = (bannerTypes && bannerTypes.length > 0)
      ? bannerTypes.map((t) => (typeof t === "string" ? t : t.name))
      : ["Offer", "New Arrival", "Promotion", "Collection"];
    return Array.from(new Set([...BANNER_TYPES, ...customNames]));
  }, [bannerTypes]);

  // Form state
  const [formData, setFormData] = useState({
    title: tabId === "hero-slides" ? "Hero Slide Title" : "",
    type: defaultType || "Offer",
    image: "/asset/img2.jpg",
    subtitle: tabId === "hero-slides" ? "Subtitle text" : "",
    description: tabId === "hero-slides" ? "Premium comfort designed for better sleep." : "",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    displayOrder: 1,
    isActive: true
  });

  const fileInputRef = useRef(null);

  // Sort banners by type and assign sequential 1..N order
  const typeBanners = React.useMemo(() => {
    const list = (banners || []).filter((b) => !filterType || b.type === filterType);
    const sorted = [...list].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
    return sorted.map((b, idx) => ({
      ...b,
      displayOrder: idx + 1
    }));
  }, [banners, filterType]);

  // Filter by search + status
  const filteredBanners = React.useMemo(() => {
    return typeBanners.filter((b) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        b.title.toLowerCase().includes(term) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(term));
      const matchStatus =
        filterStatus === "All" ||
        (filterStatus === "Active" && b.isActive !== false) ||
        (filterStatus === "Inactive" && b.isActive === false);
      return matchSearch && matchStatus;
    });
  }, [typeBanners, searchTerm, filterStatus]);

  const totalInType = typeBanners;
  const activeCount = totalInType.filter((b) => b.isActive !== false).length;
  const inactiveCount = totalInType.length - activeCount;

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    dragItemRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, id) => {
    e.preventDefault();
    dragOverItemRef.current = id;
    setDragOverId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItemRef.current || dragItemRef.current === dragOverItemRef.current) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const currentList = [...filteredBanners];
    const fromIndex = currentList.findIndex((b) => b.id === dragItemRef.current);
    const toIndex = currentList.findIndex((b) => b.id === dragOverItemRef.current);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);

    const reorderedList = currentList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    if (reorderBanners) {
      reorderBanners(reorderedList);
    }
    showToast("Slide order updated!");

    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    if (tabId === "hero-slides") {
      const defaultProd = (products || [])[0];
      setFormData({
        productId: defaultProd ? defaultProd.id : "",
        title: defaultProd ? (defaultProd.name || defaultProd.title) : "Hero Slide Title",
        type: defaultType || "Offer",
        image: defaultProd ? (defaultProd.image || (defaultProd.images && defaultProd.images[0])) || "/asset/img2.jpg" : "/asset/img2.jpg",
        subtitle: "Enjoy 60% savings",
        description: "Premium comfort designed for better sleep.",
        ctaText: "Shop Now",
        ctaLink: "mattress",
        displayOrder: (filteredBanners?.length || 0) + 1,
        isActive: true
      });
    } else if (tabId === "promo-banners") {
      setFormData({
        productId: "",
        title: "Promotional Banner",
        type: defaultType || "Promotion",
        image: "/asset/img2.jpg",
        subtitle: "Promotion",
        description: "Premium comfort designed for better sleep.",
        ctaText: "Shop Now",
        ctaLink: "mattress",
        displayOrder: (filteredBanners?.length || 0) + 1,
        isActive: true
      });
    } else {
      setFormData({
        productId: "",
        title: "",
        type: defaultType || "Offer",
        image: "/asset/img2.jpg",
        subtitle: "",
        description: "",
        ctaText: "Shop Now",
        ctaLink: "mattress",
        displayOrder: (filteredBanners?.length || 0) + 1,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      productId: banner.productId || "",
      title: banner.title ?? "",
      type: banner.type || defaultType || "Offer",
      image: banner.image || "/asset/img2.jpg",
      subtitle: banner.subtitle ?? "",
      description: banner.description ?? "",
      ctaText: banner.ctaText !== undefined ? banner.ctaText : "Shop Now",
      ctaLink: banner.ctaLink || "mattress",
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a title.");
      return;
    }
    if (!formData.image) {
      showToast("Please upload or enter an image URL.");
      return;
    }
    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
      showToast("Updated successfully!");
    } else {
      addBanner(formData);
      showToast(`New ${title.replace(/s$/, "")} created at #1 position!`);
    }
    setIsModalOpen(false);
  };

  const handleSaveNewType = (e) => {
    e.preventDefault();
    const cleanName = newTypeName.trim();
    if (!cleanName) {
      showToast("Type Name is required.");
      return;
    }
    if (addBannerType) {
      const res = addBannerType(cleanName);
      if (res && !res.success) {
        showToast(res.error || "Failed to add type.");
        return;
      }
      showToast(`New type "${cleanName}" added successfully!`);
    }
    setNewTypeName("");
    setIsAddTypeModalOpen(false);
  };

  const handleRequestDeleteType = (typeName) => {
    const bannersUsing = (banners || []).filter(
      (b) => (b.type || "").toLowerCase() === typeName.toLowerCase()
    );
    setTypeToDelete({ name: typeName, count: bannersUsing.length });
  };

  const handleConfirmDeleteType = () => {
    if (typeToDelete && deleteBannerType) {
      deleteBannerType(typeToDelete.name);
      showToast(`Type "${typeToDelete.name}" deleted successfully!`);
      setTypeToDelete(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModalBanner) {
      deleteBanner(deleteModalBanner.id);
      showToast(`Deleted "${deleteModalBanner.title}"`);
      setDeleteModalBanner(null);
    }
  };

  return (
    <div>
      {/* Tab header */}
      <div style={tabSectionHeaderStyle} className="content-header-row">
        <div>
          <h2 style={tabSectionTitleStyle}>{title}</h2>
          <p style={tabSectionSubStyle}>{description}</p>
        </div>
        <button onClick={handleOpenCreate} style={createBtnStyle} className="content-create-btn">
          <Plus size={16} />
          {createLabel}
        </button>
      </div>

      {/* Stats */}
      <div style={statsRowStyle} className="content-stats-grid">
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Total</span>
          <strong style={statValStyle} className="content-stat-val">{totalInType.length}</strong>
          <span style={statSubStyle}>Configured in system</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Active</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }} className="content-stat-val">{activeCount}</strong>
          <span style={statSubStyle}>Live on storefront</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Inactive</span>
          <strong style={{ ...statValStyle, color: "#DC2626" }} className="content-stat-val">{inactiveCount}</strong>
          <span style={statSubStyle}>Hidden from customers</span>
        </div>
        <div
          style={{ ...statCardStyle, cursor: "pointer" }}
          className="content-stat-card"
          onClick={() => setIsManageTypesModalOpen(true)}
          title="Click to view and manage types"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "4px" }}>
            <span style={statLabelStyle}>Types</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsManageTypesModalOpen(true);
              }}
              style={{
                backgroundColor: "#EEF0FF",
                color: "#1B1F8C",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11.5px",
                fontWeight: "800",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
              title="Click to manage types"
            >
              Manage Types
            </button>
          </div>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }} className="content-stat-val">{availableTypes.length}</strong>
          <span style={statSubStyle}>
            {availableTypes.slice(0, 4).join(", ")}{availableTypes.length > 4 ? "..." : ""}
          </span>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div style={filterBarStyle} className="content-filter-bar">
        <div style={searchWrapStyle} className="content-search-wrap">
          <Search size={16} color="#6B6B75" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectFilterStyle}
          className="content-select-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
      </div>

      {/* Desktop Data Table */}
      <div style={tableWrapStyle} className="content-desktop-table">
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={{ ...thStyle, width: "36px", textAlign: "center" }}>☷</th>
              <th style={{ ...thStyle, width: "65px" }}>Order</th>
              <th style={{ ...thStyle, width: "120px" }}>Preview</th>
              <th style={thStyle}>Details</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>CTA</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.length === 0 ? (
              <tr>
                <td colSpan={8} style={emptyTdStyle}>
                  <ImageIcon size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No items found.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>{emptyMsg}</p>
                </td>
              </tr>
            ) : (
              filteredBanners.map((banner, index) => {
                const isActive = banner.isActive !== false;
                const isDragging = draggingId === banner.id;
                const isDragOver = dragOverId === banner.id;

                const associatedProduct = (products || []).find((p) => p.id === banner.productId || p.id === banner.id);
                const displayProductName = associatedProduct
                  ? (associatedProduct.name || associatedProduct.title)
                  : banner.title;
                const displayImage = banner.image || (associatedProduct ? (associatedProduct.image || (associatedProduct.images && associatedProduct.images[0])) : "/asset/img2.jpg");

                return (
                  <tr
                    key={banner.id}
                    onDragEnter={(e) => handleDragEnter(e, banner.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    style={{
                      ...tableRowStyle,
                      opacity: isDragging ? 0.4 : 1,
                      backgroundColor: isDragOver ? "#EEF0FF" : "transparent",
                      borderTop: isDragOver ? "2px solid #1B1F8C" : undefined,
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ ...tdStyle, width: "36px", textAlign: "center" }}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, banner.id)}
                        style={{ cursor: "grab", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                        title="Drag handle to reorder slide"
                      >
                        <GripVertical size={18} color="#9CA3AF" />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={orderBadgeStyle}>#{banner.displayOrder || (index + 1)}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={thumbContainerStyle}>
                        <img src={displayImage} alt={displayProductName} style={thumbImgStyle} />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong style={{ fontSize: "14px", fontWeight: 700, color: "#1B1F8C" }}>
                            {displayProductName}
                          </strong>
                        </div>
                        {associatedProduct && banner.title && banner.title !== displayProductName && (
                          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }}>
                            {banner.title}
                          </span>
                        )}
                        {banner.subtitle && (
                          <span style={{ fontSize: "12px", color: "#6B6B75" }}>{banner.subtitle}</span>
                        )}
                        {banner.description && (
                          <span style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{banner.description}</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={getTypeBadgeStyle(banner.type)}>
                        {banner.type || "Offer"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#14151A" }}>
                          {banner.ctaText || "(No CTA)"}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#6B6B75" }}>
                          → {banner.ctaLink || "mattress"}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBannerStatus(banner.id);
                          showToast(`Slide "${banner.title}" is now ${isActive ? "Inactive" : "Active"}`);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: isActive ? "#DCFCE7" : "#F3F4F6",
                          color: isActive ? "#15803D" : "#4B5563",
                          border: `1px solid ${isActive ? "#86EFAC" : "#D1D5DB"}`,
                          borderRadius: "999px",
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: isActive ? "0 2px 6px rgba(22, 163, 74, 0.15)" : "none"
                        }}
                        title="Click to toggle status"
                      >
                        {isActive ? <CheckCircle2 size={13} color="#15803D" /> : <XCircle size={13} color="#6B7280" />}
                        <span>{isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px" }}>
                      <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => handleOpenEdit(banner)}
                          style={iconBtnStyle}
                          title="Edit"
                        >
                          <Edit2 size={15} color="#1B1F8C" />
                        </button>
                        <button
                          onClick={() => setDeleteModalBanner(banner)}
                          style={iconBtnDangerStyle}
                          title="Delete"
                        >
                          <Trash2 size={15} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View for Banners & Hero Slides */}
      <div className="content-mobile-cards" style={{ display: "none", flexDirection: "column", gap: "12px" }}>
        {filteredBanners.length === 0 ? (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
            <ImageIcon size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
            <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No items found.</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>{emptyMsg}</p>
          </div>
        ) : (
          filteredBanners.map((banner, index) => {
            const isActive = banner.isActive !== false;
            const associatedProduct = (products || []).find((p) => p.id === banner.productId || p.id === banner.id);
            const displayProductName = associatedProduct
              ? (associatedProduct.name || associatedProduct.title)
              : banner.title;
            const displayImage = banner.image || (associatedProduct ? (associatedProduct.image || (associatedProduct.images && associatedProduct.images[0])) : "/asset/img2.jpg");

            return (
              <div key={banner.id} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "14px", padding: "14px", display: "flex", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <img src={displayImage} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <span style={orderBadgeStyle}>#{banner.displayOrder || (index + 1)}</span>
                    <span style={getTypeBadgeStyle(banner.type)}>{banner.type || defaultType || "Offer"}</span>
                  </div>
                  <strong style={{ fontSize: "14px", color: "#1B1F8C", overflowWrap: "anywhere", marginTop: "2px" }}>{displayProductName}</strong>
                  {associatedProduct && banner.title && banner.title !== displayProductName && (
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{banner.title}</span>
                  )}
                  {banner.subtitle && <span style={{ fontSize: "11.5px", color: "#6B6B75" }}>{banner.subtitle}</span>}
                  {banner.description && (
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {banner.description}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #F3F4F6" }}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleBannerStatus(banner.id);
                        showToast(`Slide "${banner.title}" is now ${isActive ? "Inactive" : "Active"}`);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: isActive ? "#DCFCE7" : "#F3F4F6",
                        color: isActive ? "#15803D" : "#4B5563",
                        border: `1px solid ${isActive ? "#86EFAC" : "#D1D5DB"}`,
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {isActive ? <CheckCircle2 size={12} color="#15803D" /> : <XCircle size={12} color="#6B7280" />}
                      {isActive ? "Active" : "Inactive"}
                    </button>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleOpenEdit(banner)} style={iconBtnStyle} title="Edit">
                        <Edit2 size={14} color="#1B1F8C" />
                      </button>
                      <button onClick={() => setDeleteModalBanner(banner)} style={iconBtnDangerStyle} title="Delete">
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={modalBackdropStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalCardStyle} className="content-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>
                {editingBanner ? `Edit ${title.replace(/s$/, "")}` : `Create New ${title.replace(/s$/, "")}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <form onSubmit={handleSave} style={formStyle}>
              {/* Image Live Preview */}
              {tabId === "hero-slides" ? (
                <div style={{ width: "100%", marginBottom: "6px" }}>
                  <HeroSlideCard slide={formData} preview={true} />
                </div>
              ) : tabId === "promo-banners" ? (
                <div style={{ width: "100%", marginBottom: "6px" }}>
                  <PromoBannerRenderer banner={formData} preview={true} />
                </div>
              ) : (
                <div style={imagePreviewBoxStyle}>
                  {formData.image ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <img src={formData.image} alt="Preview" style={previewImgStyle} />
                      <div style={previewOverlayStyle}>
                        <span style={getTypeBadgeStyle(formData.type)}>{formData.type}</span>
                        <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                          {formData.title || "Banner Title"}
                        </h4>
                        <p style={{ fontSize: "12.5px", color: "#E0E7FF", margin: 0 }}>
                          {formData.subtitle || "Subtitle"}
                        </p>
                        {formData.ctaText && (
                          <span style={previewCtaBtnStyle}>{formData.ctaText}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={noPreviewBoxStyle}>
                      <ImageIcon size={32} color="#9CA3AF" />
                      <span>Image Preview</span>
                    </div>
                  )}
                </div>
              )}

              {/* Associated Store Product Selection */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Associated Store Product (Catalog Reference)</label>
                <select
                  value={formData.productId || ""}
                  onChange={(e) => {
                    const selectedPid = e.target.value;
                    const selectedProd = (products || []).find((p) => p.id === selectedPid);
                    setFormData((prev) => ({
                      ...prev,
                      productId: selectedPid,
                      title: selectedProd ? (selectedProd.name || selectedProd.title) : prev.title,
                      image: selectedProd ? (selectedProd.image || (selectedProd.images && selectedProd.images[0])) || prev.image : prev.image
                    }));
                  }}
                  style={selectStyle}
                >
                  <option value="">-- Select Store Product (Optional) --</option>
                  {(products || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title} (${(Number(p.price) || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Image Source</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={uploadFileBtnStyle}
                  >
                    <ImageIcon size={15} />
                    Upload File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <input
                    type="text"
                    placeholder="Or enter image URL (e.g. /asset/img2.jpg)"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Title + Type */}
              <div style={formGrid2Style}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Sleep Sale"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    style={selectStyle}
                  >
                    {availableTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtitle + Order */}
              <div style={formGrid2Style}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Subtitle / Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 60% Off"
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted mattresses for deep restorative sleep."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* CTA */}
              <div style={formGrid2Style}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={formData.ctaText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>CTA Destination</label>
                  <select
                    value={formData.ctaLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                    style={selectStyle}
                  >
                    {DESTINATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ marginTop: "4px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#14151A", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#1B1F8C", cursor: "pointer" }}
                  />
                  <span>Active &amp; Visible on Storefront</span>
                </label>
              </div>

              {/* Footer */}
              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" style={saveBtnStyle}>
                  {editingBanner ? "Update" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HERO SLIDE TYPE MODAL (Simplified: Type Name only) */}
      {isAddTypeModalOpen && (
        <div style={modalBackdropStyle} onClick={() => setIsAddTypeModalOpen(false)}>
          <div style={{ ...modalCardStyle, maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Add Hero Slide Type</h2>
              <button type="button" onClick={() => setIsAddTypeModalOpen(false)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <form onSubmit={handleSaveNewType} style={formStyle}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seasonal, Flash Sale, Clearance"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setIsAddTypeModalOpen(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" style={saveBtnStyle}>
                  Save Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE TYPES MODAL */}
      {isManageTypesModalOpen && (
        <div style={modalBackdropStyle} onClick={() => setIsManageTypesModalOpen(false)}>
          <div style={{ ...modalCardStyle, maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{title.replace(/s$/, "")} Types</h2>
              <button type="button" onClick={() => setIsManageTypesModalOpen(false)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto", padding: "4px 0" }}>
              {availableTypes.map((tName) => (
                <div
                  key={tName}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB"
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#14151A" }}>
                    {tName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteType(tName)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#DC2626",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      cursor: "pointer"
                    }}
                    title={`Delete type "${tName}"`}
                  >
                    <Trash2 size={13} color="#DC2626" />
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div style={{ ...modalFooterStyle, justifyContent: "space-between", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsManageTypesModalOpen(false);
                  setIsAddTypeModalOpen(true);
                }}
                style={{ ...createBtnStyle, padding: "8px 14px", fontSize: "12.5px" }}
              >
                <Plus size={14} /> Add New Type
              </button>
              <button type="button" onClick={() => setIsManageTypesModalOpen(false)} style={cancelBtnStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TYPE CONFIRMATION MODAL WITH IN-USE WARNING */}
      {typeToDelete && (
        <div style={modalBackdropStyle} onClick={() => setTypeToDelete(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "440px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "12px 0" }}>
              {typeToDelete.count > 0 ? (
                <AlertTriangle size={42} color="#D97706" style={{ margin: "0 auto 12px", display: "block" }} />
              ) : (
                <Trash2 size={42} color="#DC2626" style={{ margin: "0 auto 12px", display: "block" }} />
              )}
              
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: "0 0 8px" }}>
                Delete &quot;{typeToDelete.name}&quot; type?
              </h3>
              
              {typeToDelete.count > 0 ? (
                <div style={{
                  fontSize: "13px",
                  color: "#92400E",
                  backgroundColor: "#FEF3C7",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #FCD34D",
                  margin: "0 0 14px",
                  lineHeight: "1.45",
                  textAlign: "left"
                }}>
                  ⚠️ <strong>&quot;{typeToDelete.name}&quot;</strong> is currently used by <strong>{typeToDelete.count}</strong> banner{typeToDelete.count > 1 ? "s" : ""}. Deleting this type will remove it from future type dropdowns. Existing banner data will remain intact.
                </div>
              ) : (
                <p style={{ fontSize: "13.5px", color: "#4B5563", margin: "0 0 14px" }}>
                  This type will no longer be available for new banners.
                </p>
              )}
            </div>

            <div style={{ ...modalFooterStyle, justifyContent: "center", gap: "10px" }}>
              <button type="button" onClick={() => setTypeToDelete(null)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteType}
                style={{ ...saveBtnStyle, backgroundColor: "#DC2626" }}
              >
                Delete Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalBanner && (
        <div style={modalBackdropStyle} onClick={() => setDeleteModalBanner(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={deleteIconWrapStyle}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: "12px 0 6px" }}>
                Delete Item?
              </h3>
              <p style={{ fontSize: "13.5px", color: "#6B6B75", margin: "0 0 20px" }}>
                Are you sure you want to remove <strong>"{deleteModalBanner.title}"</strong>? It will no longer appear on the storefront.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => setDeleteModalBanner(null)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button onClick={handleDeleteConfirm} style={dangerBtnStyle}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// New Arrivals Tab — connects Admin to Products database for storefront showcase
// ═══════════════════════════════════════════════════════════════════════════════
function NewArrivalsTab({ showToast }) {
  const {
    navigateTo,
    products = [],
    categories = [],
    newArrivalItems = [],
    addProductsToNewArrivals,
    removeFromNewArrivals,
    toggleNewArrivalStatus,
    reorderNewArrivals,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Selection Modal states
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState("All");

  // Edit item modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ displayOrder: 1, isActive: true });

  // Removal confirmation modal state
  const [itemToRemove, setItemToRemove] = useState(null);

  // Drag and drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  // Resolve items with actual product details & sequential 1..N order
  const resolvedArrivals = React.useMemo(() => {
    const sorted = [...(newArrivalItems || [])].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
    return sorted.map((item, index) => {
      const prod = (products || []).find((p) => p.id === item.productId || p.id === item.id) || {
        id: item.productId || item.id,
        name: "Unknown Product",
        title: "Unknown Product",
        price: 0,
        category: "general",
        images: ["/asset/img2.jpg"],
        image: "/asset/img2.jpg"
      };
      return {
        ...item,
        product: prod,
        displayOrder: index + 1,
        isActive: item.isActive !== false
      };
    });
  }, [newArrivalItems, products]);

  // Existing product IDs already added
  const existingProductIds = React.useMemo(() => {
    return new Set((newArrivalItems || []).map((item) => item.productId));
  }, [newArrivalItems]);

  // Filtered rows for management table
  const filteredRows = resolvedArrivals.filter((item) => {
    const pName = (item.product.name || item.product.title || "").toLowerCase();
    const matchSearch = pName.includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && item.isActive) ||
      (filterStatus === "Inactive" && !item.isActive);
    return matchSearch && matchStatus;
  });

  const activeCount = resolvedArrivals.filter((r) => r.isActive).length;
  const inactiveCount = resolvedArrivals.length - activeCount;

  // Handlers
  const handleOpenSelectModal = () => {
    setSelectedProductIds([]);
    setModalSearch("");
    setModalCategory("All");
    setIsSelectModalOpen(true);
  };

  const handleToggleProductSelection = (pid) => {
    if (existingProductIds.has(pid)) return;
    setSelectedProductIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleAddSelectedProducts = () => {
    if (selectedProductIds.length === 0) {
      showToast("Please select at least one product.");
      return;
    }
    if (addProductsToNewArrivals) {
      addProductsToNewArrivals(selectedProductIds);
      showToast(`Added ${selectedProductIds.length} product(s) to New Arrivals!`);
    }
    setIsSelectModalOpen(false);
  };

  const handleCreateNewProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.title.trim()) {
      showToast("Please enter a product title.");
      return;
    }
    if (!newProductForm.price || isNaN(parseFloat(newProductForm.price))) {
      showToast("Please enter a valid price.");
      return;
    }

    const prodData = {
      name: newProductForm.title.trim(),
      title: newProductForm.title.trim(),
      price: parseFloat(newProductForm.price),
      category: newProductForm.category,
      badge: newProductForm.badge || "New",
      description: newProductForm.description || "Premium comfort product.",
      images: [newProductForm.image || "/asset/img2.jpg"],
      image: newProductForm.image || "/asset/img2.jpg",
      inStock: newProductForm.inStock !== false,
      rating: 5.0,
      reviewCount: 1
    };

    if (addNewProductAndAddToNewArrivals) {
      const res = addNewProductAndAddToNewArrivals(prodData);
      if (res && res.success) {
        showToast(`Created "${prodData.title}" and added to New Arrivals!`);
        setIsSelectModalOpen(false);
      } else {
        showToast(res?.error || "Failed to create product.");
      }
    }
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setEditFormData({
      displayOrder: item.displayOrder || 1,
      isActive: item.isActive !== false
    });
  };

  const handleSaveEditItem = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (reorderNewArrivals && editingItem.displayOrder !== editFormData.displayOrder) {
      const updatedList = resolvedArrivals.map((i) =>
        i.id === editingItem.id ? { ...i, displayOrder: editFormData.displayOrder } : i
      );
      reorderNewArrivals(updatedList);
    }

    if (toggleNewArrivalStatus && editingItem.isActive !== editFormData.isActive) {
      toggleNewArrivalStatus(editingItem.id);
    }

    showToast(`Updated "${editingItem.product.name || editingItem.product.title}" settings`);
    setEditingItem(null);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove && removeFromNewArrivals) {
      removeFromNewArrivals(itemToRemove.id);
      showToast(`Removed "${itemToRemove.product.name || itemToRemove.product.title}" from New Arrivals`);
      setItemToRemove(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    dragItemRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, id) => {
    e.preventDefault();
    dragOverItemRef.current = id;
    setDragOverId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItemRef.current || dragItemRef.current === dragOverItemRef.current) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const currentList = [...resolvedArrivals];
    const fromIndex = currentList.findIndex((item) => item.id === dragItemRef.current);
    const toIndex = currentList.findIndex((item) => item.id === dragOverItemRef.current);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);

    const reorderedList = currentList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    if (reorderNewArrivals) {
      reorderNewArrivals(reorderedList);
    }
    showToast("New Arrival display order updated!");

    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  // Catalog products for selection modal
  const modalCatalogProducts = (products || []).filter((p) => {
    const term = modalSearch.toLowerCase();
    const pName = (p.name || p.title || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();
    const matchSearch = pName.includes(term) || pCat.includes(term);
    const matchCat = modalCategory === "All" || p.category === modalCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div style={tabSectionHeaderStyle} className="content-header-row">
        <div>
          <h2 style={tabSectionTitleStyle}>New Arrivals</h2>
          <p style={tabSectionSubStyle}>
            Select store products to showcase in the homepage New Arrivals section, set display order, and toggle storefront visibility.
          </p>
        </div>
        <button onClick={handleOpenSelectModal} style={createBtnStyle} className="content-create-btn">
          <Plus size={16} />
          Add New Arrival
        </button>
      </div>

      {/* Stats */}
      <div style={statsRowStyle} className="content-stats-grid">
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Total New Arrivals</span>
          <strong style={statValStyle} className="content-stat-val">{resolvedArrivals.length}</strong>
          <span style={statSubStyle}>Configured for section</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Active Products</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }} className="content-stat-val">{activeCount}</strong>
          <span style={statSubStyle}>Live on storefront</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Inactive Products</span>
          <strong style={{ ...statValStyle, color: "#DC2626" }} className="content-stat-val">{inactiveCount}</strong>
          <span style={statSubStyle}>Hidden from customers</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Store Catalog</span>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }} className="content-stat-val">{products.length}</strong>
          <span style={statSubStyle}>Total store products</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={filterBarStyle} className="content-filter-bar">
        <div style={searchWrapStyle} className="content-search-wrap">
          <Search size={16} color="#6B6B75" />
          <input
            type="text"
            placeholder="Search new arrivals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectFilterStyle}
          className="content-select-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
      </div>

      {/* Desktop Data Table */}
      <div style={tableWrapStyle} className="content-desktop-table">
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={{ ...thStyle, width: "36px", textAlign: "center" }}>☷</th>
              <th style={{ ...thStyle, width: "65px" }}>Order</th>
              <th style={{ ...thStyle, width: "100px" }}>Preview</th>
              <th style={thStyle}>Product Details</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={emptyTdStyle}>
                  <Package size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No New Arrival products found.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>Click "+ Add New Arrival" to select existing products or create a new product.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((item, index) => {
                const prod = item.product;
                const isDragging = draggingId === item.id;
                const isDragOver = dragOverId === item.id;
                return (
                  <tr
                    key={item.id}
                    onDragEnter={(e) => handleDragEnter(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    style={{
                      ...tableRowStyle,
                      opacity: isDragging ? 0.4 : 1,
                      backgroundColor: isDragOver ? "#EEF0FF" : "transparent",
                      borderTop: isDragOver ? "2px solid #1B1F8C" : undefined,
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ ...tdStyle, width: "36px", textAlign: "center" }}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        style={{ cursor: "grab", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                        title="Drag handle to reorder product"
                      >
                        <GripVertical size={18} color="#9CA3AF" />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={orderBadgeStyle}>#{item.displayOrder || (index + 1)}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={thumbContainerStyle}>
                        <img src={getProductPrimaryImage(prod)} alt={prod.name || prod.title} style={thumbImgStyle} />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ fontSize: "14px", color: "#14151A", display: "block" }}>
                        {prod.name || prod.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#6B6B75" }}>
                        Product ID: {prod.id}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#4B5563" }}>
                        {getProductCategoryLabel(prod)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ fontSize: "13.5px", color: "#16A34A" }}>
                        {formatPrice(getMinimumProductPrice(prod))}
                      </strong>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => toggleNewArrivalStatus && toggleNewArrivalStatus(item.id)}
                        style={item.isActive ? activeStatusBtnStyle : inactiveStatusBtnStyle}
                        title="Click to toggle status"
                      >
                        {item.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          style={iconBtnStyle}
                          title="Edit settings"
                        >
                          <Edit2 size={14} color="#6B6B75" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToRemove(item)}
                          style={iconBtnDangerStyle}
                          title="Remove from New Arrivals"
                        >
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View for New Arrivals */}
      <div className="content-mobile-cards" style={{ display: "none", flexDirection: "column", gap: "12px" }}>
        {filteredRows.length === 0 ? (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
            <Package size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
            <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No New Arrival products found.</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>Click "+ Add New Arrival" to select existing products.</p>
          </div>
        ) : (
          filteredRows.map((item, index) => {
            const prod = item.product;
            const imgSrc = getProductPrimaryImage(prod);
            return (
              <div key={item.id} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "14px", padding: "14px", display: "flex", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <img src={imgSrc} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <span style={orderBadgeStyle}>#{item.displayOrder || (index + 1)}</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#4B5563" }}>{getProductCategoryLabel(prod)}</span>
                  </div>
                  <strong style={{ fontSize: "14px", color: "#14151A", overflowWrap: "anywhere", marginTop: "2px" }}>{prod.name || prod.title}</strong>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#16A34A" }}>{formatPrice(getMinimumProductPrice(prod))}</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F3F4F6" }}>
                    <button
                      type="button"
                      onClick={() => toggleNewArrivalStatus && toggleNewArrivalStatus(item.id)}
                      style={item.isActive ? activeStatusBtnStyle : inactiveStatusBtnStyle}
                    >
                      {item.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button type="button" onClick={() => handleOpenEditItem(item)} style={iconBtnStyle} title="Edit settings">
                        <Edit2 size={14} color="#6B6B75" />
                      </button>
                      <button type="button" onClick={() => setItemToRemove(item)} style={iconBtnDangerStyle} title="Remove">
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SHARED SELECTION MODAL */}
      <ProductSelectionModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Select New Arrivals"
        sectionType="new-arrivals"
        existingProductIds={existingProductIds}
        onAddSelected={(selectedIds) => {
          if (addProductsToNewArrivals) {
            addProductsToNewArrivals(selectedIds);
            showToast(`Added ${selectedIds.length} product(s) to New Arrivals!`);
          }
        }}
        navigateTo={navigateTo}
      />

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div style={modalBackdropStyle} onClick={() => setEditingItem(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Edit New Arrival Settings</h2>
              <button type="button" onClick={() => setEditingItem(null)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} style={formStyle}>
              {/* Product summary card */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                <img
                  src={editingItem.product.image || (editingItem.product.images && editingItem.product.images[0]) || "/asset/img2.jpg"}
                  alt={editingItem.product.name}
                  style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div>
                  <strong style={{ fontSize: "14px", color: "#111827", display: "block" }}>
                    {editingItem.product.name || editingItem.product.title}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>
                    Category: {editingItem.product.category} • Price: ${(Number(editingItem.product.price) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={editFormData.displayOrder}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#14151A", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#1B1F8C", cursor: "pointer" }}
                  />
                  <span>Active &amp; Visible on Storefront New Arrivals</span>
                </label>
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setEditingItem(null)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" style={saveBtnStyle}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE FROM NEW ARRIVALS CONFIRMATION MODAL */}
      {itemToRemove && (
        <div style={modalBackdropStyle} onClick={() => setItemToRemove(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "440px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "12px 0" }}>
              <Trash2 size={40} color="#DC2626" style={{ margin: "0 auto 12px", display: "block" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: "0 0 8px" }}>
                Remove &quot;{itemToRemove.product.name || itemToRemove.product.title}&quot; from New Arrivals?
              </h3>
              <p style={{ fontSize: "13.5px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.4" }}>
                This will remove the product from the New Arrivals section but will not delete the product from the store catalog.
              </p>
            </div>
            <div style={{ ...modalFooterStyle, justifyContent: "center", gap: "10px" }}>
              <button type="button" onClick={() => setItemToRemove(null)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                style={{ ...saveBtnStyle, backgroundColor: "#DC2626" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const containerStyle = { width: "100%", boxSizing: "border-box" };

const toastStyle = {
  position: "fixed", bottom: "24px", right: "24px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF",
  padding: "12px 20px", borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 4000,
  display: "flex", alignItems: "center", gap: "10px",
  fontSize: "13.5px", fontWeight: 700,
};

const headerRowStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-start", marginBottom: "24px", gap: "16px",
};

const badgeRowStyle = { marginBottom: "6px" };

const adminBadgeStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  backgroundColor: "#EEF0FF", color: "#1B1F8C",
  fontSize: "12px", fontWeight: 800,
  padding: "4px 10px", borderRadius: "999px",
};

const titleStyle = { fontSize: "24px", fontWeight: 800, color: "#1B1F8C", margin: 0 };

const subtitleStyle = { fontSize: "13.5px", color: "#6B6B75", margin: "4px 0 0", maxWidth: "700px" };

const tabBarStyle = {
  borderBottom: "2px solid #E7E7E2",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
};

const tabListStyle = {
  display: "inline-flex", gap: "6px",
  padding: "0 0 12px 0",
  minWidth: "max-content",
};

const tabBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "8px",
  padding: "9px 18px", border: "1.5px solid",
  borderRadius: "10px", fontSize: "13.5px", fontWeight: 700,
  cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const tabSectionHeaderStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-start", marginBottom: "20px", gap: "16px",
};

const tabSectionTitleStyle = { fontSize: "18px", fontWeight: 800, color: "#14151A", margin: 0 };
const tabSectionSubStyle = { fontSize: "13px", color: "#6B6B75", margin: "4px 0 0", maxWidth: "600px" };

const createBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "8px",
  backgroundColor: "#16A34A", color: "#FFFFFF",
  border: "none", borderRadius: "10px",
  padding: "11px 20px", fontSize: "13.5px", fontWeight: 800,
  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
};

const statsRowStyle = {
  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px", marginBottom: "20px",
};

const statCardStyle = {
  backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2",
  borderRadius: "14px", padding: "18px 20px",
  display: "flex", flexDirection: "column", gap: "4px",
};

const statLabelStyle = { fontSize: "12.5px", fontWeight: 700, color: "#6B6B75" };
const statValStyle   = { fontSize: "24px", fontWeight: 800, color: "#14151A" };
const statSubStyle   = { fontSize: "11.5px", color: "#9CA3AF" };

const infoBannerStyle = {
  display: "flex", alignItems: "center", gap: "10px",
  backgroundColor: "#EEF0FF", border: "1px solid #C7CAF0",
  borderRadius: "10px", padding: "12px 16px",
  fontSize: "13px", color: "#1B1F8C", marginBottom: "16px",
};

const sectionListStyle = {
  display: "flex", flexDirection: "column", gap: "8px",
};

const sectionCardStyle = {
  display: "flex", alignItems: "center", gap: "12px",
  padding: "14px 16px", borderRadius: "12px",
  cursor: "default",
};

const dragHandleStyle = {
  cursor: "grab", padding: "4px", borderRadius: "6px",
  display: "flex", alignItems: "center", flexShrink: 0,
};

const sectionNumberStyle = { flexShrink: 0 };
const sectionNumberBadgeStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: "24px", height: "24px", borderRadius: "50%",
  backgroundColor: "#EEF0FF", color: "#1B1F8C",
  fontSize: "11px", fontWeight: 800,
};

const sectionIconWrapStyle = {
  width: "38px", height: "38px", borderRadius: "10px",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

const hiddenBadgeStyle = {
  fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
  backgroundColor: "#FEE2E2", color: "#DC2626",
  padding: "2px 7px", borderRadius: "999px",
};

const toggleBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  borderRadius: "8px", padding: "6px 12px",
  fontSize: "12px", fontWeight: 700, cursor: "pointer",
  flexShrink: 0, whiteSpace: "nowrap",
};

const filterBarStyle = {
  display: "flex", gap: "12px", alignItems: "center",
  marginBottom: "16px", flexWrap: "wrap",
};

const searchWrapStyle = {
  display: "flex", alignItems: "center", gap: "10px",
  backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2",
  borderRadius: "10px", padding: "0 14px", height: "42px",
  flex: 1, minWidth: "200px", maxWidth: "420px",
};

const searchInputStyle = {
  border: "none", background: "transparent",
  outline: "none", fontSize: "13.5px", width: "100%", color: "#14151A",
};

const selectFilterStyle = {
  height: "42px", borderRadius: "10px", border: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF", padding: "0 14px",
  fontSize: "13px", color: "#14151A", fontWeight: 600,
  outline: "none", cursor: "pointer", flexShrink: 0,
};

const tableWrapStyle = {
  backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2",
  borderRadius: "14px", overflow: "hidden",
};

const tableStyle = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const tableHeaderRowStyle = { backgroundColor: "#F7F7F2", borderBottom: "1px solid #E7E7E2" };

const thStyle = {
  padding: "14px 16px", fontSize: "12px", fontWeight: 800,
  color: "#1B1F8C", textTransform: "uppercase", letterSpacing: "0.03em",
};

const tableRowStyle = { borderBottom: "1px solid #F0EFE9" };

const tdStyle = { padding: "14px 16px", fontSize: "13.5px", color: "#14151A", verticalAlign: "middle" };

const emptyTdStyle = { textAlign: "center", padding: "48px 24px" };

const orderBadgeStyle = {
  fontWeight: 800, color: "#1B1F8C", backgroundColor: "#EEF0FF",
  padding: "3px 8px", borderRadius: "6px", fontSize: "12px",
};

const thumbContainerStyle = {
  width: "72px", height: "44px", borderRadius: "8px",
  overflow: "hidden", backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2",
};

const thumbImgStyle = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

const getTypeBadgeStyle = (type) => {
  let bg = "#EEF0FF", color = "#1B1F8C";
  if (type === "Offer")       { bg = "#DCFCE7"; color = "#16A34A"; }
  else if (type === "Promotion") { bg = "#FEF3C7"; color = "#D97706"; }
  else if (type === "New Arrival") { bg = "#E0E7FF"; color = "#4338CA"; }
  else if (type === "Collection")  { bg = "#F3E8FF"; color = "#7E22CE"; }
  return {
    display: "inline-block", fontSize: "11px", fontWeight: 800,
    textTransform: "uppercase", letterSpacing: "0.04em",
    backgroundColor: bg, color,
    padding: "3px 9px", borderRadius: "999px",
  };
};

const activeStatusBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  backgroundColor: "#DCFCE7", color: "#16A34A",
  border: "none", borderRadius: "999px",
  padding: "4px 10px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
};

const inactiveStatusBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  backgroundColor: "#FEE2E2", color: "#DC2626",
  border: "none", borderRadius: "999px",
  padding: "4px 10px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
};

const iconBtnStyle = {
  backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2",
  borderRadius: "8px", width: "32px", height: "32px",
  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

const iconBtnDangerStyle = {
  backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5",
  borderRadius: "8px", width: "32px", height: "32px",
  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  boxSizing: "border-box",
};

const modalCardStyle = {
  position: "relative",
  backgroundColor: "#FFFFFF",
  borderRadius: "18px",
  border: "1px solid #E7E7E2",
  padding: "24px 28px",
  width: "min(700px, calc(100vw - 32px))",
  maxWidth: "700px",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25), 0 6px 20px rgba(0, 0, 0, 0.15)",
  boxSizing: "border-box",
  zIndex: 100000,
};

const modalOverlayStyle = modalBackdropStyle;
const modalContentStyle = modalCardStyle;

const modalHeaderStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px",
};

const modalTitleStyle = { fontSize: "18px", fontWeight: 800, color: "#1B1F8C", margin: 0 };

const modalCloseBtnStyle = { border: "none", background: "none", cursor: "pointer", padding: 0 };

const formStyle = { display: "flex", flexDirection: "column", gap: "14px" };

const imagePreviewBoxStyle = {
  width: "100%", height: "150px", borderRadius: "14px",
  overflow: "hidden", backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2",
};

const previewImgStyle  = { width: "100%", height: "100%", objectFit: "cover" };

const previewOverlayStyle = {
  position: "absolute", inset: 0,
  backgroundColor: "rgba(20,21,26,0.45)", padding: "16px",
  display: "flex", flexDirection: "column",
  justifyContent: "center", alignItems: "flex-start", gap: "4px",
};

const previewCtaBtnStyle = {
  backgroundColor: "#16A34A", color: "#FFFFFF",
  borderRadius: "999px", padding: "5px 14px",
  fontSize: "11px", fontWeight: 800, marginTop: "4px",
};

const noPreviewBoxStyle = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  height: "100%", color: "#9CA3AF", fontSize: "13px",
};

const fieldGroupStyle = { display: "flex", flexDirection: "column", gap: "5px" };

const labelStyle = { fontSize: "12.5px", fontWeight: 700, color: "#14151A" };

const uploadFileBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF",
  border: "none", borderRadius: "8px", padding: "0 14px",
  fontSize: "12px", fontWeight: 700, cursor: "pointer",
  flexShrink: 0, whiteSpace: "nowrap", height: "38px",
};

const inputStyle = {
  width: "100%", height: "38px", borderRadius: "8px",
  border: "1px solid #E7E7E2", padding: "0 12px",
  fontSize: "13px", color: "#14151A", outline: "none", boxSizing: "border-box",
};

const selectStyle = {
  width: "100%", height: "38px", borderRadius: "8px",
  border: "1px solid #E7E7E2", padding: "0 12px",
  fontSize: "13px", color: "#14151A", outline: "none",
  boxSizing: "border-box", backgroundColor: "#FFFFFF",
};

const formGrid2Style = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };

const modalFooterStyle = {
  display: "flex", justifyContent: "flex-end", gap: "10px",
  marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #E7E7E2",
};

const cancelBtnStyle = {
  backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2",
  color: "#6B6B75", borderRadius: "8px", padding: "8px 18px",
  fontSize: "13px", fontWeight: 700, cursor: "pointer",
};

const saveBtnStyle = {
  backgroundColor: "#16A34A", color: "#FFFFFF",
  border: "none", borderRadius: "8px", padding: "8px 20px",
  fontSize: "13px", fontWeight: 800, cursor: "pointer",
};

const deleteIconWrapStyle = {
  width: "48px", height: "48px", borderRadius: "50%",
  backgroundColor: "#FEF2F2",
  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
};

const dangerBtnStyle = {
  backgroundColor: "#DC2626", color: "#FFFFFF",
  border: "none", borderRadius: "8px", padding: "8px 18px",
  fontSize: "13px", fontWeight: 700, cursor: "pointer",
};

// ═══════════════════════════════════════════════════════════════════════════════
// Best Sellers Tab — connects Admin to Products database for storefront showcase
// ═══════════════════════════════════════════════════════════════════════════════
function BestSellersTab({ showToast }) {
  const {
    navigateTo,
    products = [],
    categories = [],
    bestSellerItems = [],
    addProductsToBestSellers,
    removeFromBestSellers,
    toggleBestSellerStatus,
    reorderBestSellers,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Selection Modal states
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState("All");

  // Edit item modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ displayOrder: 1, isActive: true });

  // Removal confirmation modal state
  const [itemToRemove, setItemToRemove] = useState(null);

  // Drag and drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  // Resolve items with actual product details & sequential 1..N order
  const resolvedBestSellers = React.useMemo(() => {
    const sorted = [...(bestSellerItems || [])].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
    return sorted.map((item, index) => {
      const prod = (products || []).find((p) => p.id === item.productId || p.id === item.id) || {
        id: item.productId || item.id,
        name: "Unknown Product",
        title: "Unknown Product",
        price: 0,
        category: "general",
        images: ["/asset/img2.jpg"],
        image: "/asset/img2.jpg"
      };
      return {
        ...item,
        product: prod,
        displayOrder: index + 1,
        isActive: item.isActive !== false
      };
    });
  }, [bestSellerItems, products]);

  // Existing product IDs already added
  const existingProductIds = React.useMemo(() => {
    return new Set((bestSellerItems || []).map((item) => item.productId));
  }, [bestSellerItems]);

  // Filtered rows for management table
  const filteredRows = resolvedBestSellers.filter((item) => {
    const pName = (item.product.name || item.product.title || "").toLowerCase();
    const matchSearch = pName.includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && item.isActive) ||
      (filterStatus === "Inactive" && !item.isActive);
    return matchSearch && matchStatus;
  });

  const activeCount = resolvedBestSellers.filter((r) => r.isActive).length;
  const inactiveCount = resolvedBestSellers.length - activeCount;

  // Handlers
  const handleOpenSelectModal = () => {
    setSelectedProductIds([]);
    setModalSearch("");
    setModalCategory("All");
    setIsSelectModalOpen(true);
  };

  const handleToggleProductSelection = (pid) => {
    if (existingProductIds.has(pid)) return;
    setSelectedProductIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleAddSelectedProducts = () => {
    if (selectedProductIds.length === 0) {
      showToast("Please select at least one product.");
      return;
    }
    if (addProductsToBestSellers) {
      addProductsToBestSellers(selectedProductIds);
      showToast(`Added ${selectedProductIds.length} product(s) to Best Sellers!`);
    }
    setIsSelectModalOpen(false);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setEditFormData({
      displayOrder: item.displayOrder || 1,
      isActive: item.isActive !== false
    });
  };

  const handleSaveEditItem = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (reorderBestSellers && editingItem.displayOrder !== editFormData.displayOrder) {
      const updatedList = resolvedBestSellers.map((i) =>
        i.id === editingItem.id ? { ...i, displayOrder: editFormData.displayOrder } : i
      );
      reorderBestSellers(updatedList);
    }

    if (toggleBestSellerStatus && editingItem.isActive !== editFormData.isActive) {
      toggleBestSellerStatus(editingItem.id);
    }

    showToast(`Updated "${editingItem.product.name || editingItem.product.title}" settings`);
    setEditingItem(null);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove && removeFromBestSellers) {
      removeFromBestSellers(itemToRemove.id);
      showToast(`Removed "${itemToRemove.product.name || itemToRemove.product.title}" from Best Sellers`);
      setItemToRemove(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    dragItemRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, id) => {
    e.preventDefault();
    dragOverItemRef.current = id;
    setDragOverId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItemRef.current || dragItemRef.current === dragOverItemRef.current) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const currentList = [...resolvedBestSellers];
    const fromIndex = currentList.findIndex((item) => item.id === dragItemRef.current);
    const toIndex = currentList.findIndex((item) => item.id === dragOverItemRef.current);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);

    const reorderedList = currentList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    if (reorderBestSellers) {
      reorderBestSellers(reorderedList);
    }
    showToast("Best Sellers display order updated!");

    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  return (
    <div>
      {/* Header */}
      <div style={tabSectionHeaderStyle} className="content-header-row">
        <div>
          <h2 style={tabSectionTitleStyle}>Best Sellers</h2>
          <p style={tabSectionSubStyle}>
            Select store products to showcase in the homepage Best Sellers section, set display order, and toggle storefront visibility.
          </p>
        </div>
        <button onClick={handleOpenSelectModal} style={createBtnStyle} className="content-create-btn">
          <Plus size={16} />
          Add Best Seller
        </button>
      </div>

      {/* Stats */}
      <div style={statsRowStyle} className="content-stats-grid">
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Total Best Sellers</span>
          <strong style={statValStyle} className="content-stat-val">{resolvedBestSellers.length}</strong>
          <span style={statSubStyle}>Configured for section</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Active Products</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }} className="content-stat-val">{activeCount}</strong>
          <span style={statSubStyle}>Live on storefront</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Inactive Products</span>
          <strong style={{ ...statValStyle, color: "#DC2626" }} className="content-stat-val">{inactiveCount}</strong>
          <span style={statSubStyle}>Hidden from customers</span>
        </div>
        <div style={statCardStyle} className="content-stat-card">
          <span style={statLabelStyle}>Store Catalog</span>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }} className="content-stat-val">{products.length}</strong>
          <span style={statSubStyle}>Total store products</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={filterBarStyle} className="content-filter-bar">
        <div style={searchWrapStyle} className="content-search-wrap">
          <Search size={16} color="#6B6B75" />
          <input
            type="text"
            placeholder="Search best sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectFilterStyle}
          className="content-select-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
      </div>

      {/* Desktop Data Table */}
      <div style={tableWrapStyle} className="content-desktop-table">
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={{ ...thStyle, width: "36px", textAlign: "center" }}>☷</th>
              <th style={{ ...thStyle, width: "65px" }}>Order</th>
              <th style={{ ...thStyle, width: "100px" }}>Preview</th>
              <th style={thStyle}>Product Details</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={emptyTdStyle}>
                  <Package size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No Best Seller products found.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>Click "+ Add Best Seller" to select existing products or create a new product.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((item, index) => {
                const prod = item.product;
                const imgSrc = prod.image || (prod.images && prod.images[0]) || "/asset/img2.jpg";
                const isDragging = draggingId === item.id;
                const isDragOver = dragOverId === item.id;
                return (
                  <tr
                    key={item.id}
                    onDragEnter={(e) => handleDragEnter(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    style={{
                      ...tableRowStyle,
                      opacity: isDragging ? 0.4 : 1,
                      backgroundColor: isDragOver ? "#EEF0FF" : "transparent",
                      borderTop: isDragOver ? "2px solid #1B1F8C" : undefined,
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ ...tdStyle, width: "36px", textAlign: "center" }}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        style={{ cursor: "grab", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                        title="Drag handle to reorder product"
                      >
                        <GripVertical size={18} color="#9CA3AF" />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={orderBadgeStyle}>#{item.displayOrder || (index + 1)}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={thumbContainerStyle}>
                        <img src={imgSrc} alt={prod.name || prod.title} style={thumbImgStyle} />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ fontSize: "14px", color: "#14151A", display: "block" }}>
                        {prod.name || prod.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#6B6B75" }}>
                        Product ID: {prod.id}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#4B5563", textTransform: "capitalize" }}>
                        {prod.category || "General"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ fontSize: "13.5px", color: "#16A34A" }}>
                        ${(Number(prod.price) || 0).toFixed(2)}
                      </strong>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => toggleBestSellerStatus && toggleBestSellerStatus(item.id)}
                        style={item.isActive ? activeStatusBtnStyle : inactiveStatusBtnStyle}
                        title="Click to toggle status"
                      >
                        {item.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          style={iconBtnStyle}
                          title="Edit settings"
                        >
                          <Edit2 size={14} color="#6B6B75" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToRemove(item)}
                          style={iconBtnDangerStyle}
                          title="Remove from Best Sellers"
                        >
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SHARED SELECTION MODAL */}
      <ProductSelectionModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Select Best Sellers"
        sectionType="best-sellers"
        existingProductIds={existingProductIds}
        onAddSelected={(selectedIds) => {
          if (addProductsToBestSellers) {
            addProductsToBestSellers(selectedIds);
            showToast(`Added ${selectedIds.length} product(s) to Best Sellers!`);
          }
        }}
        navigateTo={navigateTo}
      />

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div style={modalBackdropStyle} onClick={() => setEditingItem(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Edit Best Seller Settings</h2>
              <button type="button" onClick={() => setEditingItem(null)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} style={formStyle}>
              {/* Product summary card */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                <img
                  src={editingItem.product.image || (editingItem.product.images && editingItem.product.images[0]) || "/asset/img2.jpg"}
                  alt={editingItem.product.name}
                  style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover" }}
                />
                <div>
                  <strong style={{ fontSize: "14px", color: "#111827", display: "block" }}>
                    {editingItem.product.name || editingItem.product.title}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>
                    Category: {editingItem.product.category} • Price: ${(Number(editingItem.product.price) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={editFormData.displayOrder}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#14151A", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "#1B1F8C", cursor: "pointer" }}
                  />
                  <span>Active &amp; Visible on Storefront Best Sellers</span>
                </label>
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setEditingItem(null)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" style={saveBtnStyle}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE FROM BEST SELLERS CONFIRMATION MODAL */}
      {itemToRemove && (
        <div style={modalBackdropStyle} onClick={() => setItemToRemove(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "440px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "12px 0" }}>
              <Trash2 size={40} color="#DC2626" style={{ margin: "0 auto 12px", display: "block" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: "0 0 8px" }}>
                Remove &quot;{itemToRemove.product ? (itemToRemove.product.name || itemToRemove.product.title) : "Product"}&quot;?
              </h3>
              <p style={{ fontSize: "13.5px", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.4" }}>
                This will remove the product from this section, but will not delete it from the store catalog.
              </p>
            </div>
            <div style={{ ...modalFooterStyle, justifyContent: "center", gap: "10px" }}>
              <button type="button" onClick={() => setItemToRemove(null)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                style={{ ...saveBtnStyle, backgroundColor: "#DC2626" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shared Product Selection Modal Component (New Arrivals & Best Sellers)
// ═══════════════════════════════════════════════════════════════════════════════
function ProductSelectionModal({
  isOpen,
  onClose,
  title = "Select Products",
  sectionType,
  existingProductIds = new Set(),
  onAddSelected,
  navigateTo,
}) {
  const { products = [] } = useAdmin();
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState("All");

  React.useEffect(() => {
    if (isOpen) {
      setSelectedProductIds([]);
      setModalSearch("");
      setModalCategory("All");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleProductSelection = (pid, e) => {
    if (e) {
      e.stopPropagation();
    }
    if (existingProductIds.has(pid)) return;
    setSelectedProductIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleAddSelected = () => {
    if (selectedProductIds.length === 0) return;
    onAddSelected(selectedProductIds);
    onClose();
  };

  const activeStoreProducts = (products || []).filter(
    (p) => p && !isProductDeleted(p.id || p.Product_Id || p.slug) && (p.status ? p.status === "Active" : true)
  );

  const getCategoryCount = (catKey) => {
    if (catKey === "All" || catKey === "all") return activeStoreProducts.length;
    return activeStoreProducts.filter((p) => isProductInCategory(p, catKey)).length;
  };

  const modalCatalogProducts = activeStoreProducts.filter((p) => {
    const term = modalSearch.toLowerCase().trim();
    const pName = (p.name || p.title || p.Product_Name || "").toLowerCase();
    const pCatLabel = getProductCategoryLabel(p).toLowerCase();
    
    const matchSearch = !term || pName.includes(term) || pCatLabel.includes(term);
    const matchCat = isProductInCategory(p, modalCategory);

    return matchSearch && matchCat;
  });

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={{ ...modalCardStyle, maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>{title}</h2>
            <span style={{ fontSize: "12.5px", color: "#6B6B75" }}>
              Choose existing products from store catalog or create a new product
            </span>
          </div>
          <button type="button" onClick={onClose} style={modalCloseBtnStyle}>
            <XCircle size={20} color="#6B6B75" />
          </button>
        </div>

        {/* Modal top action bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#F9FAFB",
          padding: "12px 14px",
          borderRadius: "10px",
          border: "1px solid #E5E7EB",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", display: "block" }}>
              Need a product not in your store catalog?
            </span>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              Open full Add Product page to create &amp; publish a new product.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (navigateTo) navigateTo("add-product", sectionType);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              backgroundColor: "#16A34A",
              color: "#FFFFFF",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            <Plus size={15} />
            Create New Product
          </button>
        </div>

        <div>
          {/* Search & Category filter */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ ...searchWrapStyle, height: "38px" }}>
              <Search size={14} color="#6B6B75" />
              <input
                type="text"
                placeholder="Search store products..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <select
              value={modalCategory}
              onChange={(e) => setModalCategory(e.target.value)}
              style={{ ...selectFilterStyle, height: "38px" }}
            >
              <option value="All">All Categories ({getCategoryCount("All")})</option>

              <optgroup label="Mattresses">
                <option value="mattresses">All Mattresses ({getCategoryCount("mattresses")})</option>
                <option value="foam">Foam Mattress ({getCategoryCount("foam")})</option>
                <option value="ortho">Ortho Mattress ({getCategoryCount("ortho")})</option>
                <option value="spring">Spring Mattress ({getCategoryCount("spring")})</option>
                <option value="latex">Latex Mattress ({getCategoryCount("latex")})</option>
                <option value="memory-foam">Memory Foam Mattress ({getCategoryCount("memory-foam")})</option>
              </optgroup>

              <optgroup label="Accessories">
                <option value="accessories">All Accessories ({getCategoryCount("accessories")})</option>
                <option value="memory-foam-pillow">Memory Foam Pillow ({getCategoryCount("memory-foam-pillow")})</option>
                <option value="latex-pillow">Latex Pillow ({getCategoryCount("latex-pillow")})</option>
                <option value="fiber-pillow">Fiber Pillow ({getCategoryCount("fiber-pillow")})</option>
                <option value="mattress-protector">Mattress Protector ({getCategoryCount("mattress-protector")})</option>
                <option value="fitted-bedspread">Fitted Bedspread ({getCategoryCount("fitted-bedspread")})</option>
                <option value="blanket-duvet">Blanket / Duvet ({getCategoryCount("blanket-duvet")})</option>
                <option value="travel-bed">Travel Bed ({getCategoryCount("travel-bed")})</option>
              </optgroup>
            </select>
          </div>

          {/* Catalog Product Selection List */}
          <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "6px" }}>
            {modalCatalogProducts.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#6B6B75", fontSize: "13px" }}>
                No matching products found in store catalog.
              </div>
            ) : (
              modalCatalogProducts.map((p) => {
                const isAlreadyAdded =
                  existingProductIds.has(p.id) ||
                  existingProductIds.has(p.Product_Id) ||
                  existingProductIds.has(p.slug);
                const isSelected = selectedProductIds.includes(p.id);
                const imgSrc = getProductPrimaryImage(p);
                const catLabel = getProductCategoryLabel(p);
                const minPrice = getMinimumProductPrice(p);
                const formattedPrice = formatPrice(minPrice);

                return (
                  <div
                    key={p.id}
                    onClick={(e) => handleToggleProductSelection(p.id, e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      marginBottom: "4px",
                      backgroundColor: isAlreadyAdded
                        ? "#F3F4F6"
                        : isSelected
                        ? "#EEF0FF"
                        : "#FFFFFF",
                      border: `1px solid ${isSelected ? "#1B1F8C" : "#E5E7EB"}`,
                      cursor: isAlreadyAdded ? "not-allowed" : "pointer",
                      opacity: isAlreadyAdded ? 0.65 : 1,
                      userSelect: "none"
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={isAlreadyAdded}
                      checked={isSelected || isAlreadyAdded}
                      onChange={(e) => handleToggleProductSelection(p.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: "18px", height: "18px", accentColor: "#1B1F8C", cursor: isAlreadyAdded ? "not-allowed" : "pointer" }}
                    />
                    <div style={{ width: "42px", height: "42px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#F3F4F6", flexShrink: 0 }}>
                      <img src={imgSrc} alt={p.name || p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "13.5px", color: "#111827", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name || p.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>
                        Category: {catLabel} • Price: {formattedPrice}
                      </span>
                    </div>
                    {isAlreadyAdded ? (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "3px 8px", borderRadius: "999px" }}>
                        ✓ Already Added
                      </span>
                    ) : isSelected ? (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B1F8C", backgroundColor: "#EEF0FF", padding: "3px 8px", borderRadius: "999px" }}>
                        Selected
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ ...modalFooterStyle, marginTop: "16px" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={selectedProductIds.length === 0}
              style={{
                ...saveBtnStyle,
                backgroundColor: selectedProductIds.length > 0 ? "#1B1F8C" : "#9CA3AF",
                cursor: selectedProductIds.length > 0 ? "pointer" : "not-allowed"
              }}
            >
              Add Selected ({selectedProductIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Color Helper Functions ───────────────────────────────────────────────────
const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex || "");

const isDarkHex = (hex) => {
  if (!isValidHex(hex)) return false;
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Create Homepage Product Section Modal
// ═══════════════════════════════════════════════════════════════════════════════
function CreateSectionModal({ isOpen, onClose, homepageConfig, updateHomepageConfig, showToast, setActiveTab }) {
  const { products = [], categories = [] } = useAdmin();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [visible, setVisible] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    const pName = (p.name || p.title || "").toLowerCase();
    const matchSearch = pName.includes(search.toLowerCase());
    const matchCategory = category === "All" || isProductInCategory(p, category);
    return matchSearch && matchCategory;
  });

  const handleToggleSelect = (pid) => {
    setSelectedProductIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a section name.");
      return;
    }
    if (!description.trim()) {
      showToast("Please enter a short description.");
      return;
    }
    const cleanHex = backgroundColor.trim().toUpperCase();
    if (!isValidHex(cleanHex)) {
      showToast("Please enter a valid Hex color code (e.g. #FFFFFF or #20289A).");
      return;
    }

    const newId = "custom-section-" + Date.now();
    const newSection = {
      id: newId,
      type: "product-section",
      isCustom: true,
      name: name.trim(),
      label: name.trim(),
      description: description.trim(),
      backgroundColor: cleanHex,
      styles: { backgroundColor: cleanHex },
      productIds: selectedProductIds,
      visible: visible !== false,
      displayOrder: (homepageConfig?.sections?.length || 0) + 1
    };

    const existingSections = homepageConfig?.sections || [];
    updateHomepageConfig({
      ...homepageConfig,
      sections: [...existingSections, newSection]
    });

    showToast(`Created section "${newSection.name}" and added to Homepage Layout!`);
    setName("");
    setDescription("");
    setBackgroundColor("#FFFFFF");
    setSelectedProductIds([]);
    onClose();
    setActiveTab(newId);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>Create Homepage Product Section</h2>
            <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0 0" }}>
              Create a custom section that will appear as a new tab in Content and on the customer homepage.
            </p>
          </div>
          <button type="button" onClick={onClose} style={modalCloseBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleCreate} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Section Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trending Products"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Short Description / Subtitle *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Popular comfort choices this week."
              style={inputStyle}
              required
            />
          </div>

          {/* Background Color Field & Live Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Background Color *</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="color"
                value={isValidHex(backgroundColor) ? backgroundColor : "#FFFFFF"}
                onChange={(e) => setBackgroundColor(e.target.value.toUpperCase())}
                style={{
                  width: "44px",
                  height: "38px",
                  padding: "2px",
                  border: "1px solid #E7E7E2",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  flexShrink: 0
                }}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith("#") && val.length > 0) val = "#" + val;
                  setBackgroundColor(val);
                }}
                placeholder="#FFFFFF"
                style={{ ...inputStyle, width: "130px", textTransform: "uppercase", fontFamily: "monospace", fontWeight: "700" }}
              />
              <button
                type="button"
                onClick={() => setBackgroundColor("#FFFFFF")}
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#4B5563",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                Reset to Default
              </button>
            </div>

            {/* Live Section Color Preview */}
            <div
              style={{
                marginTop: "10px",
                padding: "16px 20px",
                borderRadius: "12px",
                backgroundColor: isValidHex(backgroundColor) ? backgroundColor : "#FFFFFF",
                border: "1px solid #E7E7E2",
                transition: "background-color 0.2s ease"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: isDarkHex(backgroundColor) ? "#94A3B8" : "#6B6B75", marginBottom: "4px" }}>
                Live Section Background Preview
              </div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: isDarkHex(backgroundColor) ? "#FFFFFF" : "#1B1F8C" }}>
                {name || "Section Name Preview"}
              </div>
              <div style={{ fontSize: "12px", color: isDarkHex(backgroundColor) ? "#CBD5E1" : "#6B6B75" }}>
                {description || "Section subtitle preview text..."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="visible-check-create"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#1B1F8C" }}
            />
            <label htmlFor="visible-check-create" style={{ fontSize: "14px", fontWeight: "600", color: "#14151A", cursor: "pointer" }}>
              Visible on Customer Homepage
            </label>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={labelStyle}>Select Products * ({selectedProductIds.length} selected)</label>
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: "10px", top: "11px" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalogue products..."
                  style={{ ...inputStyle, paddingLeft: "32px", fontSize: "13px" }}
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, width: "160px", fontSize: "13px" }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Product list checklist */}
            <div style={{ border: "1px solid #E7E7E2", borderRadius: "10px", maxHeight: "240px", overflowY: "auto", padding: "8px" }}>
              {filteredProducts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6B6B75", padding: "16px", fontSize: "13px" }}>No products match filters.</p>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const img = getProductPrimaryImage(p);
                  const catLabel = getProductCategoryLabel(p);
                  const price = getMinimumProductPrice(p);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleSelect(p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#EEF0FF" : "transparent",
                        marginBottom: "4px"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ width: "16px", height: "16px", accentColor: "#1B1F8C" }}
                      />
                      <img src={img} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: "13px", color: "#14151A", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name || p.title}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#6B7280" }}>
                          {catLabel} • {formatPrice(price)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ ...modalFooterStyle, marginTop: "12px" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={saveBtnStyle}>Create Section</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Custom Section Management View
// ═══════════════════════════════════════════════════════════════════════════════
function CustomSectionTab({ sectionId, homepageConfig, updateHomepageConfig, showToast, setActiveTab }) {
  const { products = [] } = useAdmin();
  const section = (homepageConfig?.sections || []).find((s) => s.id === sectionId);

  const [name, setName] = useState(section?.name || section?.label || "");
  const [description, setDescription] = useState(section?.description || "");
  const [backgroundColor, setBackgroundColor] = useState(section?.backgroundColor || section?.styles?.backgroundColor || "#FFFFFF");
  const [visible, setVisible] = useState(section?.visible !== false);
  const [productIds, setProductIds] = useState(section?.productIds || []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  React.useEffect(() => {
    if (section) {
      setName(section.name || section.label || "");
      setDescription(section.description || "");
      setBackgroundColor(section.backgroundColor || section.styles?.backgroundColor || "#FFFFFF");
      setVisible(section.visible !== false);
      setProductIds(section.productIds || []);
    }
  }, [sectionId, homepageConfig]);

  if (!section) {
    return <p style={{ padding: "24px", color: "#6B6B75" }}>Section not found or has been deleted.</p>;
  }

  // Resolved product objects for selected IDs
  const resolvedProducts = productIds
    .map((pid) => products.find((p) => String(p.id).trim().toLowerCase() === String(pid).trim().toLowerCase()))
    .filter(Boolean);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Section Name cannot be empty.");
      return;
    }
    if (!description.trim()) {
      showToast("Short Description cannot be empty.");
      return;
    }
    const cleanHex = backgroundColor.trim().toUpperCase();
    if (!isValidHex(cleanHex)) {
      showToast("Please enter a valid Hex color code (e.g. #FFFFFF or #20289A).");
      return;
    }

    const updatedSections = (homepageConfig?.sections || []).map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          name: name.trim(),
          label: name.trim(),
          description: description.trim(),
          backgroundColor: cleanHex,
          styles: { ...s.styles, backgroundColor: cleanHex },
          visible: visible !== false,
          productIds
        };
      }
      return s;
    });

    updateHomepageConfig({ ...homepageConfig, sections: updatedSections });
    showToast(`Saved changes for "${name.trim()}"!`);
  };

  const handleDeleteSection = () => {
    const updatedSections = (homepageConfig?.sections || []).filter((s) => s.id !== sectionId);
    updateHomepageConfig({ ...homepageConfig, sections: updatedSections });
    showToast(`Deleted section "${name}"`);
    setIsDeleteModalOpen(false);
    setActiveTab("homepage-layout");
  };

  const handleRemoveProduct = (pid) => {
    setProductIds((prev) => prev.filter((id) => id !== pid));
  };

  const handleAddProducts = (newIds) => {
    setProductIds((prev) => Array.from(new Set([...prev, ...newIds])));
    setIsAddModalOpen(false);
    showToast("Added products to section!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header Card */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "16px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#EEF0FF", color: "#1B1F8C", padding: "3px 10px", borderRadius: "999px" }}>
              Custom Section
            </span>
            {visible ? (
              <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#DCFCE7", color: "#16A34A", padding: "3px 10px", borderRadius: "999px" }}>
                ✓ Visible on Homepage
              </span>
            ) : (
              <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#FEE2E2", color: "#DC2626", padding: "3px 10px", borderRadius: "999px" }}>
                Hidden from Homepage
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1B1F8C", margin: "8px 0 4px 0" }}>{name || "Custom Section"}</h2>
          <p style={{ fontSize: "14px", color: "#6B6B75", margin: 0 }}>{description || "No description set."}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          style={{
            backgroundColor: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FCA5A5",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Trash2 size={15} />
          Delete Section
        </button>
      </div>

      {/* Section Form */}
      <form onSubmit={handleSave} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#14151A", margin: 0 }}>Section Configuration</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Section Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Short Description / Subtitle *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Background Color Field & Live Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Background Color *</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="color"
              value={isValidHex(backgroundColor) ? backgroundColor : "#FFFFFF"}
              onChange={(e) => setBackgroundColor(e.target.value.toUpperCase())}
              style={{
                width: "44px",
                height: "38px",
                padding: "2px",
                border: "1px solid #E7E7E2",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "#FFFFFF",
                flexShrink: 0
              }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("#") && val.length > 0) val = "#" + val;
                setBackgroundColor(val);
              }}
              placeholder="#FFFFFF"
              style={{ ...inputStyle, width: "130px", textTransform: "uppercase", fontFamily: "monospace", fontWeight: "700" }}
            />
            <button
              type="button"
              onClick={() => setBackgroundColor("#FFFFFF")}
              style={{
                backgroundColor: "#F3F4F6",
                color: "#4B5563",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              Reset to Default
            </button>
          </div>

          {/* Live Section Color Preview */}
          <div
            style={{
              marginTop: "10px",
              padding: "16px 20px",
              borderRadius: "12px",
              backgroundColor: isValidHex(backgroundColor) ? backgroundColor : "#FFFFFF",
              border: "1px solid #E7E7E2",
              transition: "background-color 0.2s ease"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: isDarkHex(backgroundColor) ? "#94A3B8" : "#6B6B75", marginBottom: "4px" }}>
              Live Section Background Preview
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: isDarkHex(backgroundColor) ? "#FFFFFF" : "#1B1F8C" }}>
              {name || "Section Name Preview"}
            </div>
            <div style={{ fontSize: "12px", color: isDarkHex(backgroundColor) ? "#CBD5E1" : "#6B6B75" }}>
              {description || "Section subtitle preview text..."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="visible-check-edit"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "#1B1F8C" }}
          />
          <label htmlFor="visible-check-edit" style={{ fontSize: "14px", fontWeight: "600", color: "#14151A", cursor: "pointer" }}>
            Visible on Customer Homepage
          </label>
        </div>

        {/* Selected Products Section */}
        <div style={{ borderTop: "1px solid #E7E7E2", paddingTop: "20px", marginTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#14151A", margin: 0 }}>Selected Products ({resolvedProducts.length})</h4>
              <p style={{ fontSize: "12px", color: "#6B6B75", margin: "2px 0 0 0" }}>Manage products displayed in this homepage section.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              style={{ ...saveBtnStyle, padding: "8px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} /> Add Products
            </button>
          </div>

          {resolvedProducts.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", backgroundColor: "#FAFAF7", borderRadius: "12px", border: "1px dashed #E7E7E2" }}>
              <p style={{ color: "#6B6B75", margin: "0 0 12px 0" }}>No products added to this custom section yet.</p>
              <button type="button" onClick={() => setIsAddModalOpen(true)} style={cancelBtnStyle}>
                Select Products
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {resolvedProducts.map((p, idx) => {
                const img = getProductPrimaryImage(p);
                const catLabel = getProductCategoryLabel(p);
                const price = getMinimumProductPrice(p);
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 16px",
                      backgroundColor: "#FAFAF7",
                      border: "1px solid #E7E7E2",
                      borderRadius: "12px"
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#9CA3AF", width: "24px" }}>#{idx + 1}</span>
                    <img src={img} alt="" style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "14px", color: "#14151A", display: "block" }}>{p.name || p.title}</strong>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{catLabel} • {formatPrice(price)} • SKU: {p.id}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id)}
                      title="Remove product"
                      style={{ border: "none", background: "none", color: "#DC2626", cursor: "pointer", padding: "6px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #E7E7E2", paddingTop: "16px" }}>
          <button type="submit" style={{ ...saveBtnStyle, padding: "12px 28px", fontSize: "14px" }}>
            Save Changes
          </button>
        </div>
      </form>

      {/* Product Selector Modal */}
      {isAddModalOpen && (
        <SelectProductsModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProducts}
          existingProductIds={new Set(productIds)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "440px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", color: "#DC2626" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#14151A" }}>Delete Homepage Section?</h3>
            </div>
            <p style={{ fontSize: "14px", color: "#6B6B75", margin: "0 0 20px 0" }}>
              Are you sure you want to delete the <strong>"{name}"</strong> homepage section? This will remove the section from Content tabs, Homepage Layout, and the customer homepage. Products in your catalogue will NOT be deleted.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} style={cancelBtnStyle}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteSection} style={{ ...saveBtnStyle, backgroundColor: "#DC2626" }}>
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
