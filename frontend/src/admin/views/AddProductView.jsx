"use client";

import React, { useState, useRef } from "react";
import { useAdmin } from "../context/AdminContext";
import { Upload, X, Plus, Save, ChevronLeft, Tag, Percent } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { validateMatrixPricing, getMatrixCellValue, normalizeDimensionKey, normalizeVariantKey } from "../../utils/pricingEngine";
import MatrixPricingManager from "../components/MatrixPricingManager";

import { saveImageBlob, getResolvedImageUrlSync } from "../../utils/imageStorage";
import { getProductCategoryLabel } from "../../utils/productHelpers";

const DEFAULT_BED_SIZES = {
  Single: {
    enabled: true,
    dimensions: ["72 X 30", "72 X 36", "75 X 30", "75 X 36", "78 X 30", "78 X 36", "84 X 36"]
  },
  Double: {
    enabled: true,
    dimensions: ["72 X 42", "72 X 44", "72 X 48", "75 X 44", "75 X 48", "78 X 48", "84 X 48"]
  },
  Queen: {
    enabled: true,
    dimensions: ["72 X 60", "75 X 60", "78 X 60", "84 X 60"]
  },
  King: {
    enabled: true,
    dimensions: ["72 X 72", "75 X 72", "78 X 72", "84 X 72"]
  }
};

function buildInitialForm() {
  const generatedId = `PROD-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: "",
    Product_Id: generatedId,
    Product_Name: "",
    name: "",
    description: "",
    category: "ortho",
    subCategory: "ortho",
    brand: "Mellosoft",
    material: "",
    specs: "",
    tagline: "",
    status: "Active",
    rating: "5.0",
    discountPercent: "0",
    basePrice: "",
    images: [],
    features: [],
    bedSizes: JSON.parse(JSON.stringify(DEFAULT_BED_SIZES)),
    variantsList: ["6 INCH", "8 INCH"],
    matrixPrices: {}
  };
}

export default function AddProductView() {
  const {
    navigateTo,
    addProduct,
    products,
    categories,
    returnToNewArrivals,
    setReturnToNewArrivals,
    addProductsToNewArrivals,
    returnToBestSellers,
    setReturnToBestSellers,
    addProductsToBestSellers,
    setContentActiveTab,
  } = useAdmin();

  const [form, setForm] = useState(() => {
    const nextNum = (products?.length || 8) + 1;
    const generatedId = `PROD-${String(nextNum).padStart(3, "0")}`;
    const initial = buildInitialForm();
    initial.Product_Id = generatedId;
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [invalidCellKeys, setInvalidCellKeys] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addImages = async (files) => {
    const fileList = Array.from(files);
    for (const file of fileList) {
      if (typeof file === "string") {
        setForm((prev) => ({ ...prev, images: [...prev.images, file] }));
      } else if (file instanceof File || file instanceof Blob) {
        const idbKey = `idb:img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await saveImageBlob(idbKey, file);
        setForm((prev) => ({ ...prev, images: [...prev.images, idbKey] }));
      }
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const updateFeature = (idx, val) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[idx] = val;
      return { ...prev, features: next };
    });
  };
  const removeFeature = (idx) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product Name is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.variantsList || form.variantsList.length === 0) {
      errs.variants = "At least one Variant must be created.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    // Validate Matrix Pricing for active product
    const matrixValidation = validateMatrixPricing(form.bedSizes, form.variantsList, form.matrixPrices);
    if (!matrixValidation.isValid) {
      setInvalidCellKeys(matrixValidation.invalidCellKeys);
      setToast({
        type: "error",
        msg: `❌ Pricing Incomplete — ${matrixValidation.errorMsg}`
      });

      // Scroll to first missing cell
      if (matrixValidation.firstMissing) {
        const cellId = `matrix-cell-${matrixValidation.firstMissing.variant.replace(/[^a-zA-Z0-9]/g, '-')}-${matrixValidation.firstMissing.dimension.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const el = document.getElementById(cellId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.focus(), 300);
        }
      }
      return;
    }

    setInvalidCellKeys(new Set());
    setIsSubmitting(true);

    const activeBedCategories = Object.keys(form.bedSizes).filter(
      (k) => form.bedSizes[k].enabled && form.bedSizes[k].dimensions.length > 0
    );

    const pricesList = [];
    Object.values(form.matrixPrices || {}).forEach((dimMap) => {
      Object.values(dimMap || {}).forEach((val) => {
        const num = Number(val);
        if (!isNaN(num) && num > 0) {
          pricesList.push(num);
        }
      });
    });
    const lowestPrice = pricesList.length > 0 ? Math.min(...pricesList) : 999;

    const formattedVariants = [];
    (form.variantsList || []).forEach((vName) => {
      activeBedCategories.forEach((catName) => {
        const dims = form.bedSizes[catName]?.dimensions || [];
        dims.forEach((dim) => {
          const priceVal = form.matrixPrices[vName]?.[dim] ?? lowestPrice;
          formattedVariants.push({
            Variant_Id: `VAR-${vName.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${dim.replace(/[^A-Z0-9]/g, "")}`,
            SKU: `MEL-${vName.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${dim.replace(/[^A-Z0-9]/g, "")}`,
            Size: dim,
            SizeCategory: catName,
            Firmness: vName,
            VariantName: vName,
            Actual_Price: Number(priceVal) || lowestPrice,
            Stock: 15,
            Threshold: 2,
            Status: "Active"
          });
        });
      });
    });

    const isAcc = form.category === "accessories" || ["memory-foam-pillow", "latex-pillow", "fiber-pillow", "mattress-protector", "fitted-bedspread", "blanket-duvet", "travel-bed"].includes(form.subCategory);
    const parentCat = isAcc ? "accessories" : "mattresses";
    const subCat = form.subCategory || (isAcc ? "memory-foam-pillow" : (form.category && form.category !== "accessories" ? form.category : "ortho"));

    const catLabel = getProductCategoryLabel({ parentCategory: parentCat, subCategory: subCat, category: subCat });

    const newProduct = {
      id: form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      Product_Id: form.Product_Id,
      Product_Name: form.name,
      name: form.name,
      description: form.description,
      parentCategory: parentCat,
      parentCategoryId: parentCat,
      subCategory: subCat,
      subcategory: subCat,
      subcategoryId: subCat,
      category: isAcc ? "accessories" : subCat,
      categoryName: catLabel,
      categoryLabel: catLabel,
      brand: form.brand || "Mellosoft",
      material: form.material,
      specs: form.specs || `${catLabel.toUpperCase()} • ${form.variantsList.join(" / ")} Variants`,
      tagline: form.tagline,
      status: form.status,
      rating: Number(form.rating) || 5.0,
      discountPercent: Number(form.discountPercent) || 0,
      price: lowestPrice,
      Actual_Price: lowestPrice,
      startingPrice: lowestPrice,
      thicknessOptions: form.variantsList,
      firmnessOptions: form.variantsList,
      sizeOptions: activeBedCategories,
      bedSizes: form.bedSizes,
      variantsList: form.variantsList,
      prices: form.matrixPrices,
      variants: formattedVariants,
      image: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      images: form.images.length > 0 ? form.images : ["/images/mattresses/foam/haven.jpg"],
      imageUrl: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      thumbnail: form.images.length > 0 ? form.images[0] : "/images/mattresses/foam/haven.jpg",
      features: form.features.filter((f) => f.trim() !== "")
    };

    addProduct(newProduct);

    if (returnToNewArrivals) {
      if (addProductsToNewArrivals) addProductsToNewArrivals([newProduct.id]);
      if (setReturnToNewArrivals) setReturnToNewArrivals(false);
      if (setContentActiveTab) setContentActiveTab("new-arrivals");
      setToast({ msg: `Product "${newProduct.name}" created and added to New Arrivals!` });
      setTimeout(() => {
        setToast(null);
        navigateTo("content", "new-arrivals");
      }, 1200);
    } else if (returnToBestSellers) {
      if (addProductsToBestSellers) addProductsToBestSellers([newProduct.id]);
      if (setReturnToBestSellers) setReturnToBestSellers(false);
      if (setContentActiveTab) setContentActiveTab("best-sellers");
      setToast({ msg: `Product "${newProduct.name}" created and added to Best Sellers!` });
      setTimeout(() => {
        setToast(null);
        navigateTo("content", "best-sellers");
      }, 1200);
    } else {
      setToast({ msg: `Product "${newProduct.name}" created successfully!` });
      setTimeout(() => {
        setToast(null);
        navigateTo("products");
      }, 1200);
    }
  };

  return (
    <div className="admin-fade-in">
      {toast && (
        <div style={toastStyle}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* BASIC INFORMATION & DETAILS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="admin-add-product-grid">
            <div style={cardStyle}>
              <h4 style={cardTitleStyle}>Basic Information</h4>

              <div style={fieldGroup}>
                <label style={labelStyle}>Product ID <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(auto-generated)</span></label>
                <input
                  value={form.Product_Id}
                  onChange={(e) => update("Product_Id", e.target.value)}
                  style={{ ...inputStyle, backgroundColor: "#F7F7F2", color: "#6B6B75" }}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} placeholder="Enter product name (e.g. Bloom Ortho Mattress)" required />
                {errors.name && <span style={errStyle}>{errors.name}</span>}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Tagline / Subtitle</label>
                <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} style={inputStyle} placeholder="e.g. Fresh and rejuvenating" />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                  placeholder="Describe the product features and benefits..."
                  required
                />
                {errors.description && <span style={errStyle}>{errors.description}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Main Category *</label>
                  <select
                    value={form.category === "accessories" ? "accessories" : "mattresses"}
                    onChange={(e) => {
                      const mainCat = e.target.value;
                      if (mainCat === "accessories") {
                        setForm((prev) => ({
                          ...prev,
                          category: "accessories",
                          subCategory: prev.subCategory || "memory-foam-pillow"
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          category: prev.subCategory && prev.subCategory !== "accessories" ? prev.subCategory : "ortho",
                          subCategory: prev.subCategory && prev.subCategory !== "accessories" ? prev.subCategory : "ortho"
                        }));
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="mattresses">Mattresses</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={labelStyle}>Subcategory *</label>
                  <select
                    value={form.category === "accessories" ? (form.subCategory || "memory-foam-pillow") : (form.category || "ortho")}
                    onChange={(e) => {
                      const subVal = e.target.value;
                      if (form.category === "accessories" || ["memory-foam-pillow", "latex-pillow", "fiber-pillow", "mattress-protector", "fitted-bedspread", "blanket-duvet", "travel-bed"].includes(subVal)) {
                        setForm((prev) => ({ ...prev, category: "accessories", subCategory: subVal }));
                      } else {
                        setForm((prev) => ({ ...prev, category: subVal, subCategory: subVal }));
                      }
                    }}
                    style={inputStyle}
                  >
                    {form.category === "accessories" ? (
                      <>
                        <option value="memory-foam-pillow">Memory Foam Pillow</option>
                        <option value="latex-pillow">Latex Pillow</option>
                        <option value="fiber-pillow">Fiber Pillow</option>
                        <option value="mattress-protector">Mattress Protector</option>
                        <option value="fitted-bedspread">Fitted Bedspread</option>
                        <option value="blanket-duvet">Blanket / Duvet</option>
                        <option value="travel-bed">Travel Bed</option>
                      </>
                    ) : (
                      <>
                        <option value="foam">Foam Mattress</option>
                        <option value="ortho">Ortho Mattress</option>
                        <option value="spring">Spring Mattress</option>
                        <option value="latex">Latex Mattress</option>
                        <option value="memory-foam">Memory Foam Mattress</option>
                      </>
                    )}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={labelStyle}>Status *</label>
                  <select value={form.status} onChange={(e) => update("status", e.target.value)} style={inputStyle}>
                    {["Active", "Inactive", "Low Stock", "Out of Stock"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={cardStyle}>
                <h4 style={cardTitleStyle}>Product Details & Specifications</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Brand</label>
                    <input value={form.brand} onChange={(e) => update("brand", e.target.value)} style={inputStyle} placeholder="Mellosoft" />
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Material</label>
                    <input value={form.material} onChange={(e) => update("material", e.target.value)} style={inputStyle} placeholder="SS + ORTHO" />
                  </div>
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Specifications</label>
                  <textarea
                    value={form.specs}
                    onChange={(e) => update("specs", e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                    placeholder="Enter specifications..."
                  />
                </div>
              </div>

              {/* Product Images */}
              <div style={cardStyle}>
                <h4 style={cardTitleStyle}>Product Images</h4>
                <div
                  style={{
                    border: dragOver ? "2px dashed #1B1F8C" : "2px dashed #E7E7E2",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: dragOver ? "#F7F8FF" : "#FAFAF7",
                    cursor: "pointer"
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && addImages(e.target.files)}
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Upload size={24} color="#9CA3AF" style={{ marginBottom: "6px" }} />
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#14151A", margin: 0 }}>
                    Click or drag images to upload
                  </p>
                </div>

                {form.images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: "8px", marginTop: "10px" }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid #E7E7E2" }}>
                        <img src={getResolvedImageUrlSync(img)} alt={`Img ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={removeImgBtnStyle}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MATRIX PRICING & SIZES & VARIANTS MANAGER ────────────────────── */}
          {errors.variants && (
            <div style={errorBannerStyle}>
              {errors.variants}
            </div>
          )}

          <MatrixPricingManager
            bedSizes={form.bedSizes}
            onBedSizesChange={(updatedSizes) => update("bedSizes", updatedSizes)}
            variants={form.variantsList}
            onVariantsChange={(updatedVariants) => update("variantsList", updatedVariants)}
            prices={form.matrixPrices}
            onPricesChange={(updatedPrices) => {
              update("matrixPrices", updatedPrices);
              if (invalidCellKeys && invalidCellKeys.size > 0) {
                const nextInvalid = new Set(invalidCellKeys);
                let changed = false;
                invalidCellKeys.forEach((key) => {
                  const [v, d] = key.split("::");
                  if (v && d) {
                    const val = getMatrixCellValue(updatedPrices, v, d);
                    const num = Number(val);
                    if (val !== "" && val !== null && val !== undefined && !isNaN(num) && num > 0 && isFinite(num)) {
                      nextInvalid.delete(key);
                      changed = true;
                    }
                  }
                });
                if (changed) {
                  setInvalidCellKeys(nextInvalid);
                }
              }
            }}
            categoryName={form.name || form.category || "ORTHO MATTRESS"}
            invalidCellKeys={invalidCellKeys}
          />

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => navigateTo("products")}
              style={cancelBtnStyle}
              disabled={isSubmitting}
            >
              <ChevronLeft size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...saveBtnStyle,
                opacity: isSubmitting ? 0.65 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              <Save size={16} /> {isSubmitting ? "Creating Product..." : "Save & Create Product"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

const cardStyle = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" };
const cardTitleStyle = { fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 };
const fieldGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#6B6B75" };
const inputStyle = { height: "42px", padding: "0 14px", border: "1px solid #E7E7E2", borderRadius: "10px", fontSize: "14px", color: "#14151A", backgroundColor: "#FFFFFF", outline: "none", width: "100%", boxSizing: "border-box" };
const errStyle = { fontSize: "12px", color: "#DC2626", fontWeight: 500 };
const cancelBtnStyle = { height: "44px", padding: "0 24px", border: "1px solid #E7E7E2", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#14151A", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" };
const saveBtnStyle = { height: "44px", padding: "0 28px", border: "none", borderRadius: "10px", backgroundColor: "#1B1F8C", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const removeImgBtnStyle = { position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.9)", color: "#FFF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const toastStyle = { position: "fixed", top: "80px", right: "24px", zIndex: 2000, backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" };
const errorBannerStyle = { backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 };
