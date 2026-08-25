import React, { useState } from "react";
import { Plus, X, Trash2, Check } from "lucide-react";
import { getMatrixCellValue, normalizeDimensionKey, normalizeVariantKey } from "../../utils/pricingEngine";

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

export default function MatrixPricingManager({
  bedSizes = DEFAULT_BED_SIZES,
  onBedSizesChange,
  variants = [],
  onVariantsChange,
  prices = {},
  onPricesChange,
  categoryName = "ORTHO MATTRESS",
  invalidCellKeys = new Set()
}) {
  // Local state for opening "Add Size" input box per category
  const [activeAddSizeCategory, setActiveAddSizeCategory] = useState(null);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");

  // Local state for adding variant name
  const [variantInput, setVariantInput] = useState("");

  // Helper to toggle bed category enabled state
  const toggleBedCategory = (catName) => {
    const current = bedSizes[catName] || { enabled: false, dimensions: [] };
    const updated = {
      ...bedSizes,
      [catName]: {
        ...current,
        enabled: !current.enabled
      }
    };
    onBedSizesChange(updated);
  };

  // Helper to add dimension to a category
  const handleAddDimension = (catName) => {
    const w = widthInput.trim();
    const h = heightInput.trim();
    if (!w || !h) {
      alert("Please enter both width and height");
      return;
    }
    const formattedDim = `${w} X ${h}`;
    const currentDims = bedSizes[catName]?.dimensions || [];

    if (currentDims.includes(formattedDim)) {
      alert(`Size ${formattedDim} already exists in ${catName}`);
      return;
    }

    const updated = {
      ...bedSizes,
      [catName]: {
        ...(bedSizes[catName] || { enabled: true }),
        enabled: true,
        dimensions: [...currentDims, formattedDim]
      }
    };
    onBedSizesChange(updated);

    setWidthInput("");
    setHeightInput("");
    setActiveAddSizeCategory(null);
  };

  // Helper to remove dimension from category
  const handleRemoveDimension = (catName, dimToRemove) => {
    const currentDims = bedSizes[catName]?.dimensions || [];
    const updated = {
      ...bedSizes,
      [catName]: {
        ...bedSizes[catName],
        dimensions: currentDims.filter((d) => d !== dimToRemove)
      }
    };
    onBedSizesChange(updated);
  };

  // Helper to add variant
  const handleAddVariant = () => {
    const name = variantInput.trim();
    if (!name) return;
    if (variants.includes(name)) {
      alert(`Variant "${name}" already exists.`);
      return;
    }
    onVariantsChange([...variants, name]);
    setVariantInput("");
  };

  // Helper to remove variant
  const handleRemoveVariant = (variantName) => {
    onVariantsChange(variants.filter((v) => v !== variantName));

    // Clean up prices for that variant
    const newPrices = { ...prices };
    delete newPrices[variantName];
    onPricesChange(newPrices);
  };

  // Helper to update price in matrix cell
  const handlePriceCellChange = (variantName, dimension, val) => {
    const numVal = val === "" ? "" : Math.max(0, Number(val));
    const normV = normalizeVariantKey(variantName);
    const normD = normalizeDimensionKey(dimension);

    // Find existing variant map if already present under variantName or normV
    let existingKey = variantName;
    if (prices[normV]) {
      existingKey = normV;
    } else {
      for (const k of Object.keys(prices)) {
        if (normalizeVariantKey(k) === normV) {
          existingKey = k;
          break;
        }
      }
    }

    const variantPrices = prices[existingKey] ? { ...prices[existingKey] } : {};
    
    // Find existing dimension key
    let targetDimKey = normD;
    for (const dK of Object.keys(variantPrices)) {
      if (normalizeDimensionKey(dK) === normD) {
        targetDimKey = dK;
        break;
      }
    }

    variantPrices[targetDimKey] = numVal;

    onPricesChange({
      ...prices,
      [existingKey]: variantPrices
    });
  };

  return (
    <div style={containerStyle}>
      {/* ─── SECTION 1: BED SIZES & CUSTOM DIMENSIONS ────────────────────── */}
      <div style={cardSectionStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>1. Bed Sizes & Dimensions</h3>
          <p style={sectionSubtextStyle}>
            Enable bed categories and click "Add Size" to enter width & height dimensions.
          </p>
        </div>

        <div style={categoriesGridStyle}>
          {["Single", "Double", "Queen", "King"].map((catName) => {
            const catData = bedSizes[catName] || { enabled: false, dimensions: [] };
            const isAdding = activeAddSizeCategory === catName;

            return (
              <div
                key={catName}
                style={{
                  ...catCardStyle,
                  borderColor: catData.enabled ? "#1B1F8C" : "#E7E7E2",
                  backgroundColor: catData.enabled ? "#F8F9FF" : "#FFFFFF"
                }}
              >
                <div style={catHeaderStyle}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={catData.enabled}
                      onChange={() => toggleBedCategory(catName)}
                      style={checkboxStyle}
                    />
                    <strong style={{ fontSize: "15px", color: catData.enabled ? "#1B1F8C" : "#14151A" }}>
                      {catName.toUpperCase()} BED
                    </strong>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!catData.enabled) toggleBedCategory(catName);
                      setActiveAddSizeCategory(isAdding ? null : catName);
                    }}
                    style={addSizeBtnStyle}
                  >
                    <Plus size={14} /> Add Size
                  </button>
                </div>

                {/* Inline Add Size Input Box */}
                {isAdding && (
                  <div style={inlineAddFormStyle}>
                    <div style={inputPairGroupStyle}>
                      <input
                        type="number"
                        placeholder="Width (in)"
                        value={widthInput}
                        onChange={(e) => setWidthInput(e.target.value)}
                        style={miniInputStyle}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#6B6B75" }}>X</span>
                      <input
                        type="number"
                        placeholder="Height (in)"
                        value={heightInput}
                        onChange={(e) => setHeightInput(e.target.value)}
                        style={miniInputStyle}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleAddDimension(catName)}
                        style={saveDimensionBtnStyle}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAddSizeCategory(null)}
                        style={cancelDimensionBtnStyle}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Dimensions Chips */}
                {catData.dimensions && catData.dimensions.length > 0 ? (
                  <div style={dimensionsChipsWrapStyle}>
                    {catData.dimensions.map((dim) => (
                      <span key={dim} style={dimChipStyle}>
                        {dim}
                        <button
                          type="button"
                          onClick={() => handleRemoveDimension(catName, dim)}
                          style={removeChipBtnStyle}
                          title="Remove size"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "6px 0 0" }}>
                    No dimensions added yet. Click "Add Size".
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 2: VARIANTS MANAGEMENT ───────────────────────────────── */}
      <div style={cardSectionStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>2. Product Variants</h3>
          <p style={sectionSubtextStyle}>
            Create variant names (e.g. BLOOM 6", BLOOM 8", HAVEN 4", HAVEN 5"). Firmness is replaced by variants.
          </p>
        </div>

        <div style={variantInputRowStyle}>
          <input
            type="text"
            placeholder="Enter variant name (e.g., BLOOM 6')"
            value={variantInput}
            onChange={(e) => setVariantInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddVariant();
              }
            }}
            style={variantTextInputStyle}
          />
          <button type="button" onClick={handleAddVariant} style={addVariantBtnStyle}>
            <Plus size={16} /> Add Variant
          </button>
        </div>

        <div style={variantsListWrapStyle}>
          {variants.length > 0 ? (
            variants.map((vName) => (
              <span key={vName} style={variantBadgeStyle}>
                <strong>{vName}</strong>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(vName)}
                  style={removeVariantBtnStyle}
                  title="Remove variant"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <p style={{ fontSize: "13px", color: "#6B6B75", fontStyle: "italic" }}>
              No variants created yet. Enter a variant name above to build the pricing table.
            </p>
          )}
        </div>
      </div>

      {/* ─── SECTION 3: MATRIX PRICING TABLE (MATCHING REFERENCE IMAGE) ───── */}
      {variants.length > 0 && (
        <div style={cardSectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>3. Matrix Pricing Table</h3>
            <p style={sectionSubtextStyle}>
              Enter prices for each bed size dimension and variant combination.
            </p>
          </div>

          <div style={tableWrapStyle}>
            <table style={matrixTableStyle}>
              <thead>
                <tr>
                  <th style={categoryHeaderThStyle}>{categoryName.toUpperCase()}</th>
                  {variants.map((vName) => (
                    <th key={vName} style={variantHeaderThStyle}>
                      {vName.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Single", "Double", "Queen", "King"].map((catName) => {
                  const catData = bedSizes[catName];
                  if (!catData || !catData.enabled || !catData.dimensions || catData.dimensions.length === 0) {
                    return null;
                  }

                  return (
                    <React.Fragment key={catName}>
                      {/* Bed Category Banner Row */}
                      <tr>
                        <td
                          colSpan={variants.length + 1}
                          style={categoryRowTdStyle}
                        >
                          {catName.toUpperCase()}
                        </td>
                      </tr>

                      {/* Dimension Rows */}
                      {catData.dimensions.map((dim) => (
                        <tr key={`${catName}-${dim}`} style={dimTrStyle}>
                          <td style={dimTdStyle}>{dim}</td>
                          {variants.map((vName) => {
                            const currentPrice = getMatrixCellValue(prices, vName, dim);
                            const cellKey = `${vName}::${dim}`;
                            const isInvalid = invalidCellKeys && (
                              invalidCellKeys instanceof Set
                                ? invalidCellKeys.has(cellKey)
                                : Array.isArray(invalidCellKeys) && invalidCellKeys.includes(cellKey)
                            );
                            const cellId = `matrix-cell-${vName.replace(/[^a-zA-Z0-9]/g, '-')}-${dim.replace(/[^a-zA-Z0-9]/g, '-')}`;

                            return (
                              <td key={vName} style={cellTdStyle}>
                                <input
                                  id={cellId}
                                  type="number"
                                  placeholder="Enter price"
                                  value={currentPrice}
                                  onChange={(e) => handlePriceCellChange(vName, dim, e.target.value)}
                                  style={{
                                    ...cellInputStyle,
                                    borderColor: isInvalid ? "#DC2626" : "#CBD5E1",
                                    backgroundColor: isInvalid ? "#FEF2F2" : "#FFFFFF",
                                    color: isInvalid ? "#991B1B" : "#14151A",
                                    boxShadow: isInvalid ? "0 0 0 1px #DC2626" : "none"
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLING OBJECTS ─────────────────────────────────────────────────────────

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  width: "100%"
};

const cardSectionStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "14px",
  border: "1px solid #E7E7E2",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
};

const sectionHeaderStyle = {
  marginBottom: "18px"
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#14151A"
};

const sectionSubtextStyle = {
  fontSize: "13px",
  color: "#6B6B75",
  marginTop: "4px"
};

const categoriesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px"
};

const catCardStyle = {
  borderRadius: "12px",
  border: "1.5px solid #E7E7E2",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  transition: "all 0.2s ease"
};

const catHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer"
};

const checkboxStyle = {
  width: "18px",
  height: "18px",
  accentColor: "#1B1F8C",
  cursor: "pointer"
};

const addSizeBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "6px 12px",
  borderRadius: "6px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer"
};

const inlineAddFormStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
  padding: "10px",
  border: "1px solid #CBD5E1",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const inputPairGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const miniInputStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  fontSize: "13px",
  outline: "none"
};

const saveDimensionBtnStyle = {
  flex: 1,
  padding: "6px 10px",
  backgroundColor: "#16A34A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const cancelDimensionBtnStyle = {
  padding: "6px 10px",
  backgroundColor: "#F1F5F9",
  color: "#475569",
  border: "1px solid #CBD5E1",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer"
};

const dimensionsChipsWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const dimChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "4px 8px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #CBD5E1",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#334155"
};

const removeChipBtnStyle = {
  border: "none",
  background: "none",
  color: "#94A3B8",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0
};

const variantInputRowStyle = {
  display: "flex",
  gap: "10px",
  maxWidth: "480px"
};

const variantTextInputStyle = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #E7E7E2",
  fontSize: "14px",
  outline: "none"
};

const addVariantBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "10px 18px",
  backgroundColor: "#1B1F8C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer"
};

const variantsListWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "14px"
};

const variantBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 14px",
  backgroundColor: "#4A1525",
  color: "#FFFFFF",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "700"
};

const removeVariantBtnStyle = {
  border: "none",
  background: "none",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0
};

/* ─── MATRIX TABLE STYLES (MATCHING REFERENCE IMAGE) ───────────────── */

const tableWrapStyle = {
  overflowX: "auto",
  borderRadius: "8px",
  border: "1px solid #4A1525"
};

const matrixTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "inherit"
};

const categoryHeaderThStyle = {
  backgroundColor: "#4A1525",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "800",
  padding: "14px 16px",
  textAlign: "left",
  borderRight: "1px solid rgba(255,255,255,0.2)",
  letterSpacing: "0.5px"
};

const variantHeaderThStyle = {
  backgroundColor: "#4A1525",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "800",
  padding: "14px 16px",
  textAlign: "center",
  borderRight: "1px solid rgba(255,255,255,0.2)",
  minWidth: "140px"
};

const categoryRowTdStyle = {
  backgroundColor: "#FCE7F0",
  color: "#4A1525",
  fontSize: "14px",
  fontWeight: "800",
  padding: "10px 16px",
  letterSpacing: "0.5px"
};

const dimTrStyle = {
  borderBottom: "1px solid #F1F5F9"
};

const dimTdStyle = {
  padding: "10px 16px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#334155",
  backgroundColor: "#FAFAFA",
  borderRight: "1px solid #E2E8F0"
};

const cellTdStyle = {
  padding: "6px 10px",
  borderRight: "1px solid #E2E8F0",
  textAlign: "center"
};

const cellInputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "center",
  outline: "none"
};
