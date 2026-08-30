"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../context/AdminContext";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { RefreshCw, Boxes, AlertTriangle, CheckCircle2, XCircle, Package, Search, Check, Plus, Minus } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../utils/dashboardHelpers";

function getBedCategoryForDimension(dim) {
  if (!dim || typeof dim !== "string") return "Standard";
  const d = dim.toLowerCase().replace(/\s+/g, "");
  if (d.includes("single") || d.includes("x30") || d.includes("x36")) return "Single";
  if (d.includes("double") || d.includes("x42") || d.includes("x44") || d.includes("x48")) return "Double";
  if (d.includes("queen") || d.includes("x60")) return "Queen";
  if (d.includes("king") || d.includes("x72")) return "King";
  return "Standard";
}

const BED_CATEGORY_BADGE_COLORS = {
  Single: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Double: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  Queen: { bg: "#FDF2F8", color: "#BE185D", border: "#FBCFE8" },
  King: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  Standard: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

export default function InventoryView() {
  const { products = [], updateProduct, navigateTo, setSelectedProductId, hasPermission } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  // Stock Management Modal State
  const [manageModalProduct, setManageModalProduct] = useState(null);
  const [modalStockMap, setModalStockMap] = useState({});
  const [modalBulkStock, setModalBulkStock] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (manageModalProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [manageModalProduct]);

  const inventoryData = useMemo(() => {
    const rows = [];
    products.forEach((prod) => {
      if (!prod || prod.status === "Inactive" || prod.status === "Deleted") return;

      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        prod.variants.forEach((v, vIdx) => {
          const stock = Number(v.Stock ?? v.stock ?? 0);
          const minStock = Number(v.Threshold ?? v.threshold ?? prod.threshold ?? LOW_STOCK_THRESHOLD);
          const size = v.Size || v.size || "";
          const firmness = v.Firmness || v.firmness || "";
          const variantLabel = [size, firmness].filter(Boolean).join(" / ") || `Variant ${vIdx + 1}`;
          const sku = v.SKU || v.sku || `${(prod.Product_Id || prod.id || "PROD").toUpperCase()}-${size.toUpperCase().slice(0, 3) || "STD"}`;
          const status = stock <= 0 ? "Out of Stock" : stock <= minStock ? "Low Stock" : "In Stock";

          rows.push({
            id: `${prod.id}-${vIdx}`,
            productId: prod.id,
            product: prod.Product_Name || prod.name,
            sku,
            variant: variantLabel,
            size,
            firmness,
            stock,
            minStock,
            available: stock,
            status,
            rawProduct: prod,
            rawVariant: v,
            variantIndex: vIdx,
          });
        });
      } else {
        const stock = Number(prod.stock ?? prod.Stock ?? 0);
        const minStock = Number(prod.threshold ?? prod.Threshold ?? LOW_STOCK_THRESHOLD);
        const sku = prod.Product_Id || prod.sku || prod.SKU || `PROD-${prod.id}`;
        const status = stock <= 0 ? "Out of Stock" : stock <= minStock ? "Low Stock" : "In Stock";

        rows.push({
          id: prod.id,
          productId: prod.id,
          product: prod.Product_Name || prod.name,
          sku,
          variant: "Standard",
          size: "Standard",
          firmness: "Standard",
          stock,
          minStock,
          available: stock,
          status,
          rawProduct: prod,
          rawVariant: null,
          variantIndex: 0,
        });
      }
    });
    return rows;
  }, [products]);

  const summary = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    inventoryData.forEach((row) => {
      if (row.status === "In Stock") inStock++;
      else if (row.status === "Low Stock") lowStock++;
      else outOfStock++;
    });

    return {
      total: inventoryData.length,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [inventoryData]);

  const filtered = useMemo(() => {
    return inventoryData.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        row.product.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.variant.toLowerCase().includes(q);

      const matchStatus = statusFilter === "All" || row.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [inventoryData, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  // Open Stock Management Modal for the row's product
  const handleOpenManageModal = (rawProduct, initialSearch = "") => {
    if (!rawProduct) return;
    const initialMap = {};
    const variants = rawProduct.variants || [];
    if (variants.length > 0) {
      variants.forEach((v) => {
        const key = `${v.Size || v.size}__${v.Firmness || v.firmness}`;
        initialMap[key] = {
          stock: v.Stock ?? v.stock ?? 15,
          threshold: v.Threshold ?? v.threshold ?? 2,
          size: v.Size || v.size,
          firmness: v.Firmness || v.firmness,
          sku: v.SKU || v.sku || "",
        };
      });
    } else {
      const key = "Standard__Standard";
      initialMap[key] = {
        stock: rawProduct.stock ?? rawProduct.Stock ?? 15,
        threshold: rawProduct.threshold ?? rawProduct.Threshold ?? 2,
        size: "Standard",
        firmness: "Standard",
        sku: rawProduct.Product_Id || rawProduct.id,
      };
    }
    setModalStockMap(initialMap);
    setModalBulkStock("");
    setModalSearch(initialSearch);
    setManageModalProduct(rawProduct);
  };

  const handleStepModalStock = (key, delta) => {
    const current = Number(modalStockMap[key]?.stock ?? 15);
    const nextVal = Math.max(0, current + delta);
    setModalStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], stock: nextVal },
    }));
  };

  const handleModalStockChange = (key, val) => {
    const num = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
    setModalStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], stock: num },
    }));
  };

  const handleModalThresholdChange = (key, val) => {
    const num = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
    setModalStockMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], threshold: num },
    }));
  };

  const handleApplyModalBulkStock = (presetVal) => {
    const targetVal = presetVal !== undefined ? presetVal : modalBulkStock;
    if (targetVal === "" || targetVal === undefined) return;
    const val = Math.max(0, parseInt(targetVal, 10) || 0);
    const updated = { ...modalStockMap };
    Object.keys(updated).forEach((k) => {
      updated[k] = { ...updated[k], stock: val };
    });
    setModalStockMap(updated);
    if (presetVal !== undefined) setModalBulkStock(String(presetVal));
  };

  const handleSaveModalStock = () => {
    if (!manageModalProduct) return;
    setIsSaving(true);

    const variants = manageModalProduct.variants || [];
    let updatedProduct;

    if (variants.length > 0) {
      const updatedVariants = variants.map((v) => {
        const key = `${v.Size || v.size}__${v.Firmness || v.firmness}`;
        const override = modalStockMap[key];
        if (override) {
          const s = typeof override.stock === "number" ? override.stock : (parseInt(override.stock, 10) || 0);
          const th = typeof override.threshold === "number" ? override.threshold : (parseInt(override.threshold, 10) || 2);
          const status = s === 0 ? "Out of Stock" : (s <= th ? "Low Stock" : "Active");
          return {
            ...v,
            Stock: s,
            stock: s,
            Threshold: th,
            threshold: th,
            Status: status,
            status: status,
          };
        }
        return v;
      });

      updatedProduct = {
        ...manageModalProduct,
        variants: updatedVariants,
      };
    } else {
      const override = modalStockMap["Standard__Standard"] || {};
      const s = typeof override.stock === "number" ? override.stock : (parseInt(override.stock, 10) || 0);
      const th = typeof override.threshold === "number" ? override.threshold : (parseInt(override.threshold, 10) || 2);
      const status = s === 0 ? "Out of Stock" : (s <= th ? "Low Stock" : "Active");

      updatedProduct = {
        ...manageModalProduct,
        Stock: s,
        stock: s,
        Threshold: th,
        threshold: th,
        Status: status,
        status: status,
      };
    }

    if (updateProduct) {
      updateProduct(updatedProduct);
    }
    setIsSaving(false);
    setManageModalProduct(null);
    setToast({ msg: `✓ Inventory for "${manageModalProduct.Product_Name || manageModalProduct.name}" updated successfully!` });
    setTimeout(() => setToast(null), 3000);
  };

  const columns = [
    {
      key: "product",
      label: "PRODUCT",
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: "#14151A" }}>{val}</span>
          <div style={{ fontSize: "11px", color: "#6B6B75", marginTop: "2px" }}>ID: {row.productId}</div>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      nowrap: true,
      render: (val) => <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#6B6B75" }}>{val}</span>,
    },
    {
      key: "variant",
      label: "VARIANT",
      nowrap: true,
      render: (val) => <span style={{ fontSize: "13px", color: "#4B5563" }}>{val}</span>,
    },
    {
      key: "stock",
      label: "CURRENT STOCK",
      align: "center",
      render: (val, row) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "14px",
              color: val === 0 ? "#DC2626" : val <= row.minStock ? "#D97706" : "#14151A",
              minWidth: "24px",
              textAlign: "center"
            }}
          >
            {val}
          </span>
        </div>
      ),
    },
    {
      key: "minStock",
      label: "MIN STOCK",
      align: "center",
      render: (val) => <span style={{ fontSize: "13px", color: "#6B6B75" }}>{val}</span>,
    },
    {
      key: "status",
      label: "STATUS",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "ACTION",
      align: "center",
      render: (_, row) => (
        <button
          onClick={() => handleOpenManageModal(row.rawProduct, row.size)}
          style={updateBtnStyle}
          title={`Manage stock for ${row.product}`}
        >
          <RefreshCw size={13} />
          <span>Manage</span>
        </button>
      ),
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 9999999,
          backgroundColor: "#16A34A", color: "#FFF", padding: "12px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "adminFadeIn 0.25s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Boxes size={22} color="#1B1F8C" />
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#14151A", margin: 0 }}>
              Inventory Management
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>
            Live stock tracking and instant stock management across all product variants and SKUs.
          </p>
        </div>

        {/* Quick summary mini-cards */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={miniStatStyle}>
            <span style={{ fontSize: "11px", color: "#6B6B75" }}>Total SKUs</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#14151A" }}>{summary.total}</span>
          </div>
          <div style={{ ...miniStatStyle, borderColor: "#DCFCE7", backgroundColor: "#F0FDF4" }}>
            <span style={{ fontSize: "11px", color: "#16A34A" }}>In Stock</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#16A34A" }}>{summary.inStock}</span>
          </div>
          <div style={{ ...miniStatStyle, borderColor: "#FEF3C7", backgroundColor: "#FFFBEB" }}>
            <span style={{ fontSize: "11px", color: "#D97706" }}>Low Stock</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#D97706" }}>{summary.lowStock}</span>
          </div>
          <div style={{ ...miniStatStyle, borderColor: "#FEE2E2", backgroundColor: "#FEF2F2" }}>
            <span style={{ fontSize: "11px", color: "#DC2626" }}>Out of Stock</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626" }}>{summary.outOfStock}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          backgroundColor: "#FFFFFF",
          padding: "14px 18px",
          borderRadius: "10px",
          border: "1px solid #E7E7E2",
          flexWrap: "wrap",
        }}
      >
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by product name, SKU, variant..."
          style={{ flex: "1 1 300px", maxWidth: "420px" }}
        />

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["All", "In Stock", "Low Stock", "Out of Stock"].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  border: isActive ? "none" : "1px solid #E7E7E2",
                  backgroundColor: isActive ? "#1B1F8C" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#6B6B75",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        emptyMessage="No inventory items found matching your filters."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Quick Stock Management Modal (Centered via Portal directly onto document.body) */}
      {manageModalProduct && mounted && typeof document !== "undefined" && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setManageModalProduct(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "880px",
            maxHeight: "86vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #CBD5E1",
            boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            position: "relative",
            animation: "adminFadeIn 0.15s ease",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E7E7E2", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAF7" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={20} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#14151A" }}>Manage Product Stock</h3>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B6B75" }}>
                  {manageModalProduct.Product_Name || manageModalProduct.name} — <code style={{ fontFamily: "monospace" }}>{manageModalProduct.Product_Id || manageModalProduct.id}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageModalProduct(null)}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#9CA3AF", cursor: "pointer", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Bulk Update Bar */}
            <div style={{ padding: "16px 24px", backgroundColor: "#F0FDF4", borderBottom: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>⚡ Bulk Set All:</span>
                <input
                  type="number"
                  min="0"
                  placeholder="25"
                  value={modalBulkStock}
                  onChange={(e) => setModalBulkStock(e.target.value)}
                  style={{ width: "65px", height: "32px", padding: "0 8px", borderRadius: "6px", border: "1px solid #86EFAC", fontSize: "13px", fontWeight: 700, textAlign: "center", backgroundColor: "#FFFFFF" }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyModalBulkStock()}
                  style={{ backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
                >
                  Apply to All
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#15803D", fontWeight: 600 }}>Presets:</span>
                {[
                  { label: "0 (Out)", val: 0 },
                  { label: "10 (Low)", val: 10 },
                  { label: "25 (Default)", val: 25 },
                  { label: "50 (High)", val: 50 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyModalBulkStock(p.val)}
                    style={{ backgroundColor: "#FFFFFF", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Search */}
            <div style={{ padding: "12px 24px 0", display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Filter by dimension, size or variant..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{ width: "100%", height: "36px", padding: "0 12px 0 34px", borderRadius: "8px", border: "1px solid #E7E7E2", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Scrollable Variants Stock Table */}
            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F7F7F2", borderBottom: "2px solid #E7E7E2" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Category</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Dimension / Size</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase" }}>Variant</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "220px" }}>Stock Quantity</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "110px" }}>Status</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11.5px", color: "#6B6B75", textTransform: "uppercase", width: "100px" }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(modalStockMap)
                    .filter((key) => {
                      if (!modalSearch) return true;
                      const item = modalStockMap[key];
                      const q = modalSearch.toLowerCase();
                      return (
                        (item.size || "").toLowerCase().includes(q) ||
                        (item.firmness || "").toLowerCase().includes(q) ||
                        getBedCategoryForDimension(item.size).toLowerCase().includes(q)
                      );
                    })
                    .map((key, i) => {
                      const item = modalStockMap[key];
                      const s = Number(item.stock) || 0;
                      const th = Number(item.threshold) || 2;
                      const bedCat = getBedCategoryForDimension(item.size);
                      const badgeColor = BED_CATEGORY_BADGE_COLORS[bedCat] || BED_CATEGORY_BADGE_COLORS.Standard;

                      return (
                        <tr key={key} style={{ borderBottom: "1px solid #F0F0EC", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF7" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: 800, textTransform: "uppercase", backgroundColor: badgeColor.bg, color: badgeColor.color, border: `1px solid ${badgeColor.border}`, padding: "2px 6px", borderRadius: "4px" }}>
                              {bedCat}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: "#14151A" }}>
                            {item.size}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1B1F8C" }}>
                            {item.firmness}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <button
                                type="button"
                                onClick={() => handleStepModalStock(key, -5)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "11px", fontWeight: 700, color: "#64748B", cursor: "pointer" }}
                                title="Subtract 5"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStepModalStock(key, -1)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                                title="Subtract 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={item.stock}
                                onChange={(e) => handleModalStockChange(key, e.target.value)}
                                style={{ width: "55px", height: "28px", textAlign: "center", borderRadius: "4px", border: s === 0 ? "1px solid #FCA5A5" : (s <= th ? "1px solid #FCD34D" : "1px solid #CBD5E1"), fontSize: "13px", fontWeight: 700, color: "#14151A" }}
                              />
                              <button
                                type="button"
                                onClick={() => handleStepModalStock(key, 1)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                                title="Add 1"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStepModalStock(key, 5)}
                                style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "11px", fontWeight: 700, color: "#64748B", cursor: "pointer" }}
                                title="Add 5"
                              >
                                +5
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <StatusBadge status={s === 0 ? "Out of Stock" : (s <= th ? "Low Stock" : "Active")} />
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <input
                              type="number"
                              min="0"
                              value={item.threshold}
                              onChange={(e) => handleModalThresholdChange(key, e.target.value)}
                              style={{ width: "45px", height: "28px", textAlign: "center", borderRadius: "4px", border: "1px solid #E2E8F0", fontSize: "12px", color: "#6B6B75" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E7E7E2", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "#FAFAF7" }}>
              <button
                type="button"
                onClick={() => setManageModalProduct(null)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalStock}
                disabled={isSaving}
                style={{ padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#059669", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Check size={16} /> {isSaving ? "Saving..." : "Save Stock Changes"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const miniStatStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 14px",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E7E7E2",
  minWidth: "72px",
};

const updateBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  height: "30px",
  padding: "0 12px",
  border: "1px solid #E7E7E2",
  borderRadius: "6px",
  backgroundColor: "#FFFFFF",
  color: "#1B1F8C",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

