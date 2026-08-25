"use client";

import React, { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import PromoBannerRenderer from "../../components/PromoBannerRenderer";
import {
  Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle2, XCircle,
  Eye, EyeOff, Search, ArrowUpDown, Tag, Sparkles, Sliders, Check, AlertTriangle
} from "lucide-react";

const BANNER_TYPES = ["Offer", "New Arrival", "Promotion", "Collection"];

const DESTINATION_OPTIONS = [
  { label: "Mattresses Collection", value: "mattress" },
  { label: "Pillows Collection", value: "pillows" },
  { label: "Bed Frames Collection", value: "bed frames" },
  { label: "Protectors Collection", value: "protectors" },
  { label: "All Products Catalog", value: "All" },
];

export default function BannersView() {
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus, bannerTypes = [], addBannerType, deleteBannerType, categories = [] } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const dynamicDestinationOptions = React.useMemo(() => {
    const defaultOptions = [
      { label: "All Products Catalog", value: "All" },
    ];
    if (!categories || categories.length === 0) return DESTINATION_OPTIONS;
    const dynamicOpts = [];
    categories.forEach((c) => {
      dynamicOpts.push({ label: `${c.name} Collection`, value: c.slug || c.id });
      (c.subcategories || []).forEach((sub) => {
        dynamicOpts.push({ label: `  • ${sub.name}`, value: sub.slug || sub.id });
      });
    });
    return [...dynamicOpts, ...defaultOptions];
  }, [categories]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteModalBanner, setDeleteModalBanner] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Type modal states
  const [isManageTypesModalOpen, setIsManageTypesModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [typeToDelete, setTypeToDelete] = useState(null);

  const availableTypes = React.useMemo(() => {
    const customNames = (bannerTypes && bannerTypes.length > 0)
      ? bannerTypes.map((t) => (typeof t === "string" ? t : t.name))
      : ["Offer", "New Arrival", "Promotion", "Collection"];
    return Array.from(new Set([...BANNER_TYPES, ...customNames]));
  }, [bannerTypes]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "Offer",
    image: "/asset/img2.jpg",
    subtitle: "",
    description: "",
    ctaText: "Shop Now",
    ctaLink: "mattress",
    displayOrder: 1,
    isActive: true
  });

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      type: "Offer",
      image: "/asset/img2.jpg",
      subtitle: "",
      description: "",
      ctaText: "Shop Now",
      ctaLink: "mattress",
      displayOrder: (banners?.length || 0) + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      type: banner.type || "Offer",
      image: banner.image || "/asset/img2.jpg",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      ctaText: banner.ctaText || "Shop Now",
      ctaLink: banner.ctaLink || "mattress",
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
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

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a banner title.");
      return;
    }
    if (!formData.image) {
      showToast("Please upload or enter a banner image URL.");
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
      showToast("Banner updated successfully!");
    } else {
      addBanner(formData);
      showToast("New promotional banner created!");
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteModalBanner) {
      deleteBanner(deleteModalBanner.id);
      showToast(`Deleted banner "${deleteModalBanner.title}"`);
      setDeleteModalBanner(null);
    }
  };

  // Filtered banners
  const filteredBanners = (banners || []).filter((banner) => {
    const matchesSearch =
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "All" || banner.type === filterType;
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && banner.isActive !== false) ||
      (filterStatus === "Inactive" && banner.isActive === false);
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const activeCount = (banners || []).filter((b) => b.isActive !== false).length;
  const inactiveCount = (banners || []).length - activeCount;

  return (
    <div style={containerStyle} className="admin-fade-in">
      {/* Toast notification */}
      {toastMessage && (
        <div style={toastStyle} role="alert">
          <Check size={16} color="#FFFFFF" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div style={headerRowStyle}>
        <div>
          <div style={badgeRowStyle}>
            <span style={adminBadgeStyle}>
              <ImageIcon size={14} color="#1B1F8C" />
              Storefront Marketing
            </span>
          </div>
          <h1 style={titleStyle}>Promotional Banners</h1>
          <p style={subtitleStyle}>
            Upload and manage homepage promotional banners, set sliding display order, configure CTA destinations, and enable real-time promotions.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreateModal} style={createBtnStyle} className="admin-primary-btn">
          <Plus size={16} />
          Create Banner
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div style={statsRowStyle}>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Total Banners</span>
          <strong style={statValStyle}>{banners?.length || 0}</strong>
          <span style={statSubStyle}>Configured in system</span>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>Active Banners</span>
          <strong style={{ ...statValStyle, color: "#16A34A" }}>{activeCount}</strong>
          <span style={statSubStyle}>Live on Storefront Slider</span>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>Inactive Banners</span>
          <strong style={{ ...statValStyle, color: "#DC2626" }}>{inactiveCount}</strong>
          <span style={statSubStyle}>Hidden from customer view</span>
        </div>

        <div
          style={{ ...statCardStyle, cursor: "pointer" }}
          onClick={() => setIsManageTypesModalOpen(true)}
          title="Click to view and manage banner types"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "4px" }}>
            <span style={statLabelStyle}>Banner Types</span>
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
              title="Manage banner types"
            >
              Manage Types
            </button>
          </div>
          <strong style={{ ...statValStyle, color: "#1B1F8C" }}>{availableTypes.length}</strong>
          <span style={statSubStyle}>
            {availableTypes.slice(0, 4).join(", ")}{availableTypes.length > 4 ? "..." : ""}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={filterBarContainerStyle}>
        <div style={searchWrapStyle}>
          <Search size={16} color="#6B6B75" />
          <input
            type="text"
            placeholder="Search banners by title or subtitle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={filterGroupStyle}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={selectFilterStyle}
          >
            <option value="All">All Types</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={selectFilterStyle}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banners Data Table */}
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={{ ...thStyle, width: "70px" }}>Order</th>
              <th style={{ ...thStyle, width: "120px" }}>Preview</th>
              <th style={thStyle}>Banner Details</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>CTA Action</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.length === 0 ? (
              <tr>
                <td colSpan={7} style={emptyTdStyle}>
                  <ImageIcon size={32} color="#9CA3AF" style={{ marginBottom: "8px" }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "#6B6B75" }}>No promotional banners found.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>Click "Create Banner" above to add your first storefront promotional slider image.</p>
                </td>
              </tr>
            ) : (
              filteredBanners.map((banner) => {
                const isActive = banner.isActive !== false;
                return (
                  <tr key={banner.id} style={tableRowStyle}>
                    <td style={tdStyle}>
                      <span style={orderBadgeStyle}>#{banner.displayOrder || 1}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={thumbContainerStyle}>
                        <img src={banner.image} alt={banner.title} style={thumbImgStyle} />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={bannerTitleBlockStyle}>
                        <strong style={bannerTitleStyle}>{banner.title}</strong>
                        {banner.subtitle && <span style={bannerSubStyle}>{banner.subtitle}</span>}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={getTypeBadgeStyle(banner.type)}>
                        {banner.type || "Offer"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={ctaInfoBlockStyle}>
                        <span style={ctaTextBadgeStyle}>{banner.ctaText || "Shop Now"}</span>
                        <span style={ctaLinkStyle}>&rarr; {banner.ctaLink || "mattress"}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => toggleBannerStatus(banner.id)}
                        style={isActive ? activeStatusBtnStyle : inactiveStatusBtnStyle}
                        title="Click to toggle status"
                      >
                        {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: "20px" }}>
                      <div style={actionsRowStyle}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(banner)}
                          style={iconActionBtnStyle}
                          title="Edit banner"
                        >
                          <Edit2 size={15} color="#1B1F8C" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteModalBanner(banner)}
                          style={iconActionBtnDangerStyle}
                          title="Delete banner"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={modalBackdropStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>
                {editingBanner ? "Edit Promotional Banner" : "Create New Promotional Banner"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={modalCloseBtnStyle}>
                <XCircle size={20} color="#6B6B75" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={formStyle}>
              {/* Image Live Preview */}
              {formData.type === "Promotion" ? (
                <div style={{ width: "100%", marginBottom: "6px" }}>
                  <PromoBannerRenderer banner={formData} preview={true} />
                </div>
              ) : (
                <div style={imagePreviewBoxStyle}>
                  {formData.image ? (
                    <div style={previewWrapperStyle}>
                      <img src={formData.image} alt="Banner Preview" style={previewImgStyle} />
                      <div style={previewOverlayStyle}>
                        <span style={getTypeBadgeStyle(formData.type)}>{formData.type}</span>
                        <h4 style={previewTitleStyle}>{formData.title || "Banner Title"}</h4>
                        <p style={previewSubStyle}>{formData.subtitle || "Offer Subtitle"}</p>
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

              {/* Image Upload controls */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Banner Image Source</label>
                <div style={uploadRowStyle}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={uploadFileBtnStyle}
                  >
                    <ImageIcon size={15} />
                    Upload Image File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
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

              {/* Title & Type */}
              <div style={formGrid2Style}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Banner Title *</label>
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
                  <label style={labelStyle}>Banner Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    style={selectStyle}
                  >
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtitle & Description */}
              <div style={formGrid2Style}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Subtitle / Offer Tag</label>
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

              {/* CTA Configuration */}
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
                  <label style={labelStyle}>CTA Destination Category</label>
                  <select
                    value={formData.ctaLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                    style={selectStyle}
                  >
                    {dynamicDestinationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={toggleRowStyle}>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={checkboxStyle}
                  />
                  <span>Active &amp; Visible on Storefront Slider</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" style={saveBtnStyle}>
                  {editingBanner ? "Update Banner" : "Save & Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalBanner && (
        <div style={modalBackdropStyle} onClick={() => setDeleteModalBanner(null)}>
          <div style={{ ...modalCardStyle, maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={deleteWarningIconWrapStyle}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#14151A", margin: "12px 0 6px" }}>
                Delete Banner?
              </h3>
              <p style={{ fontSize: "13.5px", color: "#6B6B75", margin: "0 0 20px" }}>
                Are you sure you want to remove <strong>"{deleteModalBanner.title}"</strong>? It will no longer slide on the storefront.
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button type="button" onClick={() => setDeleteModalBanner(null)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteConfirm} style={dangerDeleteBtnStyle}>
                  Delete Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Style Definitions
const containerStyle = {
  width: "100%",
  boxSizing: "border-box"
};

const toastStyle = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  padding: "12px 20px",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  zIndex: 4000,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "13.5px",
  fontWeight: "700"
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "24px",
  gap: "16px"
};

const badgeRowStyle = {
  marginBottom: "6px"
};

const adminBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#EEF0FF",
  color: "#1B1F8C",
  fontSize: "12px",
  fontWeight: "800",
  padding: "4px 10px",
  borderRadius: "999px"
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const subtitleStyle = {
  fontSize: "13.5px",
  color: "#6B6B75",
  margin: "4px 0 0",
  maxWidth: "680px"
};

const createBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "11px 20px",
  fontSize: "13.5px",
  fontWeight: "800",
  cursor: "pointer"
};

const statsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
  marginBottom: "24px"
};

const statCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  padding: "18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const statLabelStyle = {
  fontSize: "12.5px",
  fontWeight: "700",
  color: "#6B6B75"
};

const statValStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#14151A"
};

const statSubStyle = {
  fontSize: "11.5px",
  color: "#9CA3AF"
};

const filterBarContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  marginBottom: "20px"
};

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  padding: "0 14px",
  height: "42px",
  flex: 1,
  maxWidth: "420px"
};

const searchInputStyle = {
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "13.5px",
  width: "100%",
  color: "#14151A"
};

const filterGroupStyle = {
  display: "flex",
  gap: "10px"
};

const selectFilterStyle = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #E7E7E2",
  backgroundColor: "#FFFFFF",
  padding: "0 14px",
  fontSize: "13px",
  color: "#14151A",
  fontWeight: "600",
  outline: "none",
  cursor: "pointer"
};

const tableWrapStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  borderRadius: "14px",
  overflow: "hidden"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left"
};

const tableHeaderRowStyle = {
  backgroundColor: "#F7F7F2",
  borderBottom: "1px solid #E7E7E2"
};

const thStyle = {
  padding: "14px 16px",
  fontSize: "12px",
  fontWeight: "800",
  color: "#1B1F8C",
  textTransform: "uppercase",
  letterSpacing: "0.03em"
};

const tableRowStyle = {
  borderBottom: "1px solid #F0EFE9"
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "13.5px",
  color: "#14151A",
  verticalAlign: "middle"
};

const emptyTdStyle = {
  textAlign: "center",
  padding: "48px 24px"
};

const orderBadgeStyle = {
  fontWeight: "800",
  color: "#1B1F8C",
  backgroundColor: "#EEF0FF",
  padding: "3px 8px",
  borderRadius: "6px",
  fontSize: "12px"
};

const thumbContainerStyle = {
  width: "72px",
  height: "44px",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2"
};

const thumbImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const bannerTitleBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const bannerTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1B1F8C"
};

const bannerSubStyle = {
  fontSize: "12px",
  color: "#6B6B75"
};

const getTypeBadgeStyle = (type) => {
  let bg = "#EEF0FF";
  let color = "#1B1F8C";
  if (type === "Offer") {
    bg = "#DCFCE7";
    color = "#16A34A";
  } else if (type === "Promotion") {
    bg = "#FEF3C7";
    color = "#D97706";
  } else if (type === "New Arrival") {
    bg = "#E0E7FF";
    color = "#4338CA";
  } else if (type === "Collection") {
    bg = "#F3E8FF";
    color = "#7E22CE";
  }
  return {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    backgroundColor: bg,
    color,
    padding: "3px 9px",
    borderRadius: "999px"
  };
};

const ctaInfoBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const ctaTextBadgeStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#14151A"
};

const ctaLinkStyle = {
  fontSize: "11.5px",
  color: "#6B6B75"
};

const activeStatusBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  backgroundColor: "#DCFCE7",
  color: "#16A34A",
  border: "none",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const inactiveStatusBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  backgroundColor: "#FEE2E2",
  color: "#DC2626",
  border: "none",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const actionsRowStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px"
};

const iconActionBtnStyle = {
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  width: "32px",
  height: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const iconActionBtnDangerStyle = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FCA5A5",
  borderRadius: "8px",
  width: "32px",
  height: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

// Modal Styles
const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(20, 21, 26, 0.55)",
  backdropFilter: "blur(4px)",
  zIndex: 3500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const modalCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "18px",
  padding: "24px 28px",
  maxWidth: "580px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  boxSizing: "border-box"
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px"
};

const modalTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1B1F8C",
  margin: 0
};

const modalCloseBtnStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  padding: 0
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const imagePreviewBoxStyle = {
  width: "100%",
  height: "150px",
  borderRadius: "14px",
  overflow: "hidden",
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2"
};

const previewWrapperStyle = {
  position: "relative",
  width: "100%",
  height: "100%"
};

const previewImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const previewOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(20,21,26,0.45)",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "4px"
};

const previewTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#FFFFFF",
  margin: 0
};

const previewSubStyle = {
  fontSize: "12.5px",
  color: "#E0E7FF",
  margin: 0
};

const previewCtaBtnStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "5px 14px",
  fontSize: "11px",
  fontWeight: "800",
  marginTop: "4px"
};

const noPreviewBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#9CA3AF",
  fontSize: "13px"
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const labelStyle = {
  fontSize: "12.5px",
  fontWeight: "700",
  color: "#14151A"
};

const uploadRowStyle = {
  display: "flex",
  gap: "8px"
};

const uploadFileBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  padding: "0 14px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap"
};

const inputStyle = {
  width: "100%",
  height: "38px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  padding: "0 12px",
  fontSize: "13px",
  color: "#14151A",
  outline: "none",
  boxSizing: "border-box"
};

const selectStyle = {
  width: "100%",
  height: "38px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  padding: "0 12px",
  fontSize: "13px",
  color: "#14151A",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF"
};

const formGrid2Style = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
};

const toggleRowStyle = {
  marginTop: "4px"
};

const checkboxLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#14151A",
  cursor: "pointer"
};

const checkboxStyle = {
  width: "16px",
  height: "16px",
  accentColor: "#1B1F8C",
  cursor: "pointer"
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #E7E7E2"
};

const cancelBtnStyle = {
  backgroundColor: "#F7F7F2",
  border: "1px solid #E7E7E2",
  color: "#6B6B75",
  borderRadius: "8px",
  padding: "8px 18px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const saveBtnStyle = {
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  padding: "8px 20px",
  fontSize: "13px",
  fontWeight: "800",
  cursor: "pointer"
};

const deleteWarningIconWrapStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "#FEF2F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto"
};

const dangerDeleteBtnStyle = {
  backgroundColor: "#DC2626",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  padding: "8px 18px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};
