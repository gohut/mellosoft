"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAdmin } from "../context/AdminContext";
import { Plus, Pencil, Trash2, Search, X, UploadCloud, ChevronDown, ChevronRight, Layers, FolderPlus } from "lucide-react";
import { getMainCategoryProductCount, getSubcategoryProductCount } from "../../utils/productHelpers";

/**
 * Add / Edit Main Category Modal
 */
function MainCategoryModal({ isOpen, onClose, onSave, editingCategory, existingCategories }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (editingCategory) {
        setName(editingCategory.name || "");
        setSlug(editingCategory.slug || "");
        setDescription(editingCategory.description || "");
        setStatus(editingCategory.active === false || editingCategory.status === "Inactive" ? "Inactive" : "Active");
        setImagePreview(editingCategory.image || null);
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setStatus("Active");
        setImagePreview(null);
      }
      setErrorMessage("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, editingCategory]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Category Name is required.");
      return;
    }

    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.id !== editingCategory?.id &&
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage("A category with this name already exists.");
      return;
    }

    onSave({
      name: trimmedName,
      slug: slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      status,
      active: status === "Active",
      image: imagePreview || "/assets/categories/memory-foam.jpg"
    });

    onClose();
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
        boxSizing: "border-box"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(calc(100vw - 32px), 520px)",
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
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>
            {editingCategory ? "Edit Main Category" : "Add Main Category"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              color: "#6B6B75"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>
              Category Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Mattresses, Accessories, Furniture"
              style={modalInputStyle(!!errorMessage)}
            />
            {errorMessage && <span style={{ fontSize: "12px", color: "#DC2626" }}>{errorMessage}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. mattresses, accessories"
              style={modalInputStyle(false)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of products in this category..."
              style={{ ...modalInputStyle(false), height: "auto", padding: "10px 14px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={modalInputStyle(false)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Category Banner Image</label>
            {imagePreview ? (
              <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "10px", overflow: "hidden", border: "1px solid #E7E7E2" }}>
                <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  style={{
                    position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(20,21,26,0.7)", color: "#FFFFFF",
                    border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={uploadBoxStyle}>
                <UploadCloud size={24} color="#6B6B75" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B1F8C" }}>Upload Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={modalCancelBtnStyle}>Cancel</button>
            <button type="submit" style={modalSubmitBtnStyle}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/**
 * Add / Edit Subcategory Modal
 */
function SubcategoryModal({ isOpen, onClose, onSave, parentCategory, editingSubcategory, allCategories }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [status, setStatus] = useState("Active");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setParentId(parentCategory?.id || allCategories[0]?.id || "");
      if (editingSubcategory) {
        setName(editingSubcategory.name || "");
        setSlug(editingSubcategory.slug || "");
        setStatus(editingSubcategory.active === false || editingSubcategory.status === "Inactive" ? "Inactive" : "Active");
      } else {
        setName("");
        setSlug("");
        setStatus("Active");
      }
      setErrorMessage("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, parentCategory, editingSubcategory, allCategories]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!editingSubcategory) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Subcategory Name is required.");
      return;
    }

    const selectedMainCat = allCategories.find((c) => c.id === parentId);
    const siblings = selectedMainCat?.subcategories || [];

    const isDuplicate = siblings.some(
      (sub) => sub.id !== editingSubcategory?.id && sub.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(`Subcategory "${trimmedName}" already exists under ${selectedMainCat?.name}.`);
      return;
    }

    onSave(parentId, {
      name: trimmedName,
      slug: slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      status,
      active: status === "Active"
    });

    onClose();
  };

  return createPortal(
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
        backgroundColor: "rgba(20, 21, 26, 0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(calc(100vw - 32px), 480px)", maxHeight: "90vh", backgroundColor: "#FFFFFF", borderRadius: "16px",
          border: "1px solid #E7E7E2", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", padding: "24px",
          display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>
            {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B75" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Parent Category *</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              style={modalInputStyle(false)}
              disabled={!!editingSubcategory}
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>
              Subcategory Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Gel Mattress, Fiber Pillow"
              style={modalInputStyle(!!errorMessage)}
            />
            {errorMessage && <span style={{ fontSize: "12px", color: "#DC2626" }}>{errorMessage}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. gel-mattress, fiber-pillow"
              style={modalInputStyle(false)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#14151A" }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={modalInputStyle(false)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} style={modalCancelBtnStyle}>Cancel</button>
            <button type="submit" style={modalSubmitBtnStyle}>
              {editingSubcategory ? "Save Subcategory" : "Add Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function CategoriesView() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    products,
    hasPermission
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainCat, setEditingMainCat] = useState(null);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subModalParent, setSubModalParent] = useState(null);
  const [editingSubCat, setEditingSubCat] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const q = searchQuery.trim().toLowerCase();

  const filteredCategories = categories.filter((mainCat) => {
    if (!q) return true;
    const mainMatches = mainCat.name.toLowerCase().includes(q) || (mainCat.description && mainCat.description.toLowerCase().includes(q));
    const subMatches = (mainCat.subcategories || []).some((sub) => sub.name.toLowerCase().includes(q));
    return mainMatches || subMatches;
  });

  const handleSaveMainCategory = (catData) => {
    if (editingMainCat) {
      updateCategory(editingMainCat.id, catData);
    } else {
      addCategory(catData);
    }
  };

  const handleSaveSubcategory = (parentId, subData) => {
    if (editingSubCat) {
      updateSubcategory(parentId, editingSubCat.id, subData);
    } else {
      addSubcategory(parentId, subData);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "main") {
      const res = deleteCategory(deleteTarget.data.id);
      if (!res.success) {
        setDeleteError(res.error);
      }
    } else if (deleteTarget.type === "sub") {
      const res = deleteSubcategory(deleteTarget.parentId, deleteTarget.data.id);
      if (!res.success) {
        setDeleteError(res.error);
      }
    }
    setDeleteTarget(null);
  };

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#14151A", margin: 0 }}>Category & Subcategory Management</h3>
            <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>
              {categories.length} Main Categories • {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} Subcategories
            </p>
          </div>

          {hasPermission("products", "create") && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setSubModalParent(categories[0] || null);
                  setEditingSubCat(null);
                  setIsSubModalOpen(true);
                }}
                style={secondaryBtnStyle}
              >
                <Plus size={16} /> Add Subcategory
              </button>
              <button
                onClick={() => {
                  setEditingMainCat(null);
                  setIsMainModalOpen(true);
                }}
                style={primaryBtnStyle}
              >
                <Plus size={18} /> Add Main Category
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", width: "340px", maxWidth: "100%" }}>
          <Search size={18} color="#6B6B75" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search main categories & subcategories..."
            style={{
              width: "100%", height: "42px", border: "1px solid #E7E7E2", borderRadius: "10px",
              padding: "0 38px 0 42px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF",
              fontFamily: "inherit", outline: "none", boxSizing: "border-box"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B6B75" }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Category Cards Stack */}
      {filteredCategories.length === 0 ? (
        <div style={emptyBoxStyle}>
          <Search size={28} color="#6B6B75" />
          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>No categories found</h4>
          <p style={{ fontSize: "13px", color: "#6B6B75", margin: 0 }}>No categories match &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredCategories.map((mainCat) => {
            const mainCount = getMainCategoryProductCount(mainCat, products, categories);
            const subs = mainCat.subcategories || [];

            return (
              <div key={mainCat.id} style={mainCardStyle}>
                {/* Main Category Banner Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", paddingBottom: "16px", borderBottom: "1px solid #F0F0EC" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#F7F7F2", border: "1px solid #E7E7E2" }}>
                      <img src={mainCat.image || "/assets/categories/memory-foam.jpg"} alt={mainCat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#14151A", margin: 0 }}>{mainCat.name}</h4>
                        <span style={mainCat.active !== false ? activeBadgeStyle : inactiveBadgeStyle}>
                          {mainCat.active !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#6B6B75", margin: "4px 0 0 0" }}>
                        {mainCat.description || `Products under ${mainCat.name}`} • <strong>{mainCount} total products</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {hasPermission("products", "create") && (
                      <button
                        onClick={() => {
                          setSubModalParent(mainCat);
                          setEditingSubCat(null);
                          setIsSubModalOpen(true);
                        }}
                        style={addSubBtnInlineStyle}
                      >
                        <Plus size={14} /> Add Subcategory
                      </button>
                    )}

                    {hasPermission("products", "edit") && (
                      <button
                        onClick={() => {
                          setEditingMainCat(mainCat);
                          setIsMainModalOpen(true);
                        }}
                        style={iconActionBtnStyle}
                        title="Edit Main Category"
                      >
                        <Pencil size={15} color="#F59E0B" />
                      </button>
                    )}

                    {hasPermission("products", "delete") && (
                      <button
                        onClick={() => setDeleteTarget({ type: "main", data: mainCat })}
                        style={iconActionBtnStyle}
                        title="Delete Main Category"
                      >
                        <Trash2 size={15} color="#DC2626" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories Table / Grid */}
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B75", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Subcategories ({subs.length})
                    </span>
                  </div>

                  {subs.length === 0 ? (
                    <div style={{ padding: "16px", backgroundColor: "#FAFAF7", borderRadius: "8px", border: "1px dashed #E7E7E2", textAlign: "center" }}>
                      <span style={{ fontSize: "13px", color: "#6B6B75" }}>No subcategories added yet.</span>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
                      {subs.map((sub) => {
                        const subCount = getSubcategoryProductCount(sub, products, categories);
                        return (
                          <div key={sub.id} style={subCardStyle}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#14151A" }}>{sub.name}</span>
                                {sub.active === false && <span style={miniInactiveBadgeStyle}>Inactive</span>}
                              </div>
                              <span style={{ fontSize: "12px", color: "#6B6B75" }}>{subCount} products</span>
                            </div>

                            <div style={{ display: "flex", gap: "4px" }}>
                              {hasPermission("products", "edit") && (
                                <button
                                  onClick={() => {
                                    setSubModalParent(mainCat);
                                    setEditingSubCat(sub);
                                    setIsSubModalOpen(true);
                                  }}
                                  style={miniIconBtnStyle}
                                  title="Edit Subcategory"
                                >
                                  <Pencil size={13} color="#F59E0B" />
                                </button>
                              )}
                              {hasPermission("products", "delete") && (
                                <button
                                  onClick={() => setDeleteTarget({ type: "sub", parentId: mainCat.id, data: sub })}
                                  style={miniIconBtnStyle}
                                  title="Delete Subcategory"
                                >
                                  <Trash2 size={13} color="#DC2626" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Category Modal */}
      <MainCategoryModal
        isOpen={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        onSave={handleSaveMainCategory}
        editingCategory={editingMainCat}
        existingCategories={categories}
      />

      {/* Subcategory Modal */}
      <SubcategoryModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleSaveSubcategory}
        parentCategory={subModalParent}
        editingSubcategory={editingSubCat}
        allCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === "main" ? "Delete Main Category?" : "Delete Subcategory?"}
        message={`Are you sure you want to delete "${deleteTarget?.data?.name}"?`}
      />

      {/* Safety Warning Error Dialog */}
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

const primaryBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
};

const secondaryBtnStyle = {
  display: "flex", alignItems: "center", gap: "6px", height: "42px", padding: "0 16px",
  backgroundColor: "#E8E9F8", color: "#1B1F8C", border: "none", borderRadius: "10px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
};

const addSubBtnInlineStyle = {
  display: "flex", alignItems: "center", gap: "6px", height: "34px", padding: "0 12px",
  backgroundColor: "#FAFAF7", color: "#1B1F8C", border: "1px solid #E7E7E2", borderRadius: "8px",
  fontSize: "13px", fontWeight: 600, cursor: "pointer"
};

const mainCardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E7E2", padding: "20px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
};

const subCardStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 14px", backgroundColor: "#FAFAF7", border: "1px solid #E7E7E2", borderRadius: "10px"
};

const iconActionBtnStyle = {
  width: "34px", height: "34px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
};

const miniIconBtnStyle = {
  width: "28px", height: "28px", border: "1px solid #E7E7E2", borderRadius: "6px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
};

const activeBadgeStyle = {
  fontSize: "11px", fontWeight: 600, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "999px"
};

const inactiveBadgeStyle = {
  fontSize: "11px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", padding: "2px 8px", borderRadius: "999px"
};

const miniInactiveBadgeStyle = {
  fontSize: "10px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", padding: "1px 6px", borderRadius: "4px"
};

const emptyBoxStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "48px 24px",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "12px"
};

const modalInputStyle = (hasError) => ({
  width: "100%", height: "42px", padding: "0 14px", border: hasError ? "1px solid #DC2626" : "1px solid #E7E7E2",
  borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", fontFamily: "inherit", outline: "none", boxSizing: "border-box"
});

const uploadBoxStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  padding: "20px", border: "2px dashed #E7E7E2", borderRadius: "10px", backgroundColor: "#FAFAF7", cursor: "pointer", gap: "6px"
};

const modalCancelBtnStyle = {
  height: "42px", padding: "0 18px", border: "1px solid #E7E7E2", borderRadius: "10px",
  backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer"
};

const modalSubmitBtnStyle = {
  height: "42px", padding: "0 18px", border: "none", borderRadius: "10px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer"
};
