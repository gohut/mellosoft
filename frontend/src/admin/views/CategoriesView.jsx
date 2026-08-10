"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MOCK_CATEGORIES } from "../data/adminMockData";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAdmin } from "../context/AdminContext";
import { Plus, Pencil, Trash2, Search, X, UploadCloud } from "lucide-react";

function AddCategoryModal({ isOpen, onClose, onAddCategory, existingCategories }) {
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setName("");
    setImagePreview(null);
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Category name is required.");
      return;
    }

    const isDuplicate = existingCategories.some(
      (cat) => cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`A category with this name already exists.`);
      return;
    }

    onAddCategory({
      name: trimmedName,
      image: imagePreview || "/asset/texture.png",
    });

    handleClose();
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: "rgba(20, 21, 26, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(calc(100vw - 32px), 480px)",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E7E7E2",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
          boxSizing: "border-box",
          animation: "adminScaleIn 0.2s ease-out",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>
            Add Category
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              color: "#6B6B75",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Category Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>
              Category Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Enter category name"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                border: errorMessage ? "1px solid #DC2626" : "1px solid #E7E7E2",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#14151A",
                backgroundColor: "#FFFFFF",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.15s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!errorMessage) e.target.style.borderColor = "#1B1F8C";
              }}
              onBlur={(e) => {
                if (!errorMessage) e.target.style.borderColor = "#E7E7E2";
              }}
            />
            {errorMessage && (
              <span style={{ fontSize: "12px", color: "#DC2626", fontWeight: 500 }}>
                {errorMessage}
              </span>
            )}
          </div>

          {/* Category Image */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>
              Category Image
            </label>
            <p style={{ fontSize: "12px", color: "#6B6B75", margin: 0 }}>
              Supported formats: PNG, JPG, WEBP
            </p>

            {imagePreview ? (
              <div style={{ position: "relative", width: "100%", height: "140px", borderRadius: "10px", overflow: "hidden", border: "1px solid #E7E7E2" }}>
                <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "rgba(20, 21, 26, 0.7)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 16px",
                  border: "2px dashed #E7E7E2",
                  borderRadius: "10px",
                  backgroundColor: "#FAFAF7",
                  cursor: "pointer",
                  gap: "8px",
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1B1F8C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E7E7E2"; }}
              >
                <UploadCloud size={24} color="#6B6B75" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B1F8C" }}>
                  Click to upload image
                </span>
                <span style={{ fontSize: "11px", color: "#6B6B75" }}>
                  PNG, JPG or WEBP (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                height: "42px",
                padding: "0 20px",
                border: "1px solid #E7E7E2",
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                color: "#14151A",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                height: "42px",
                padding: "0 20px",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#1B1F8C",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function CategoriesView() {
  const { categories, addCategory, deleteCategory, products, hasPermission } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getProductCountForCategory = (cat) => {
    const slug = (cat.slug || cat.name || "").toLowerCase();
    const name = (cat.name || "").toLowerCase();
    return (products || []).filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      return (
        pCat === slug ||
        pCat === name ||
        pCat + "s" === name ||
        pCat === name.replace(/s$/, "")
      );
    }).length;
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleAddCategory = (newCatData) => {
    addCategory(newCatData);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      const res = deleteCategory(deleteTarget.id);
      if (!res.success) {
        setDeleteError(res.error);
      }
      setDeleteTarget(null);
    }
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="admin-categories-header" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Product Categories</h3>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{categories.length} categories</p>
        </div>

        <div className="admin-categories-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Search Bar */}
          <div className="admin-categories-search" style={{ position: "relative", width: "300px", minWidth: 0 }}>
            <Search
              size={18}
              color="#6B6B75"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              style={{
                width: "100%",
                height: "44px",
                border: "1px solid #E7E7E2",
                borderRadius: "10px",
                padding: "0 38px 0 42px",
                fontSize: "14px",
                color: "#14151A",
                backgroundColor: "#FFFFFF",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1B1F8C";
                e.target.style.boxShadow = "0 0 0 3px rgba(27, 31, 140, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E7E7E2";
                e.target.style.boxShadow = "none";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  color: "#6B6B75",
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {hasPermission("products", "create") && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="admin-btn-hover"
              style={addBtnStyle}
            >
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredCategories.length === 0 ? (
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #E7E7E2",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#F7F7F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Search size={24} color="#6B6B75" />
          </div>
          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>
            No categories found
          </h4>
          <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>
            No categories match &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            style={{
              marginTop: "8px",
              backgroundColor: "#E8E9F8",
              color: "#1B1F8C",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="admin-categories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="admin-card-hover" style={cardStyle}>
              <div style={{
                height: "160px",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "#F7F7F2",
                marginBottom: "16px",
              }}>
                <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>{cat.name}</h4>
                  <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{getProductCountForCategory(cat)} products</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={iconActionBtnStyle} title="Edit">
                    <Pencil size={15} color="#F59E0B" />
                  </button>
                  <button onClick={() => setDeleteTarget(cat)} style={iconActionBtnStyle} title="Delete">
                    <Trash2 size={15} color="#DC2626" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={categories}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category?"
        message={`Delete "${deleteTarget?.name}"?`}
      />

      {deleteError && (
        <ConfirmDialog
          isOpen={!!deleteError}
          onClose={() => setDeleteError(null)}
          onConfirm={() => setDeleteError(null)}
          title="Cannot Delete Category"
          message={deleteError}
          confirmLabel="OK"
          confirmColor="#1B1F8C"
        />
      )}
    </div>
  );
}

const addBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const cardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "16px",
};

const iconActionBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
