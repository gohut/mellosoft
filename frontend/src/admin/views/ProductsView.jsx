"use client";

import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { Plus } from "lucide-react";
import { formatPrice, calculateDiscountedPrice } from "../../utils/currency";
import { getProductPrimaryImage, isProductInCategory, isAccessoryProduct, isBedFrameProduct, getProductCategoryLabel, getCatalogCategoryTree } from "../../utils/productHelpers";

function getProductStatus(p) {
  if (p.status) return p.status;
  const stock = typeof p.stock === "number" ? p.stock : p.reviewCount ?? 50;
  if (stock === 0) return "Out of Stock";
  if (stock < (p.threshold ?? 10)) return "Low Stock";
  return "Active";
}

export default function ProductsView() {
  const { navigateTo, products = [], categories = [], hasPermission } = useAdmin();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const { totalCount, tree: categoryTree } = useMemo(() => {
    return getCatalogCategoryTree(products, categories);
  }, [products, categories]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const pName = (p.Product_Name || p.name || "").toLowerCase();
      const pId = (p.Product_Id || p.id || "").toLowerCase();
      const query = search.toLowerCase();
      if (search && !pName.includes(query) && !pId.includes(query)) return false;

      if (categoryFilter !== "All" && categoryFilter !== "all") {
        if (!isProductInCategory(p, categoryFilter)) return false;
      }

      if (statusFilter !== "All" && getProductStatus(p) !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const columns = [
    {
      key: "image",
      label: "IMAGE",
      width: "60px",
      render: (_, row) => (
        <img
          src={getProductPrimaryImage(row)}
          alt={row.Product_Name || row.name}
          style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", backgroundColor: "#F7F7F2" }}
        />
      ),
    },
    {
      key: "Product_Id",
      label: "PRODUCT ID",
      nowrap: true,
      render: (_, row) => {
        const prodId = row.Product_Id || row.id;
        return (
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#6B6B75", fontSize: "13px" }}>
            {prodId}
          </span>
        );
      },
    },
    {
      key: "name",
      label: "PRODUCT NAME",
      render: (val, row) => <span style={{ fontWeight: 600 }}>{row.Product_Name || val}</span>,
    },
    {
      key: "category",
      label: "CATEGORY",
      nowrap: true,
      render: (_, row) => <span>{getProductCategoryLabel(row)}</span>,
    },
    {
      key: "price",
      label: "PRICE",
      nowrap: true,
      render: (val, row) => {
        const displayPrice = row.variants?.length > 0
          ? Math.min(...row.variants.map((v) => Number(v.Actual_Price || row.Actual_Price || row.price)))
          : Number(row.Actual_Price ?? row.price ?? val);
        return (
          <span style={{ fontWeight: 600, color: "#14151A" }}>
            {formatPrice(displayPrice)}
          </span>
        );
      },
    },
    {
      key: "discountPrice",
      label: "DISCOUNT PRICE",
      nowrap: true,
      render: (val, row) => {
        const displayPrice = row.variants?.length > 0
          ? Math.min(...row.variants.map((v) => Number(v.Actual_Price || row.Actual_Price || row.price)))
          : Number(row.Actual_Price ?? row.price ?? val);
        const discountPct = row.discountPercent ?? row.Discount_Percentage ?? 10;
        const discPrice = calculateDiscountedPrice(displayPrice, discountPct);
        return (
          <span style={{ fontWeight: 600, color: "#16A34A" }}>
            {formatPrice(discPrice)}
          </span>
        );
      },
    },
    {
      key: "stock",
      label: "STOCK",
      align: "center",
      render: (val, row) => {
        const stockVal = typeof val === "number" ? val : (row.reviewCount ?? "—");
        return <span>{stockVal}</span>;
      },
    },
    {
      key: "status",
      label: "STATUS",
      nowrap: true,
      render: (_, row) => <StatusBadge status={getProductStatus(row)} />,
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." style={{ width: "260px", minWidth: "180px" }} />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            <option value="All">All Categories ({totalCount})</option>
            {categoryTree.map((mainCat) => (
              <optgroup key={mainCat.id} label={`${mainCat.name} (${mainCat.count})`}>
                <option value={mainCat.slug || mainCat.id}>All {mainCat.name} ({mainCat.count})</option>
                {(mainCat.subcategories || []).map((sub) => (
                  <option key={sub.id} value={sub.slug || sub.id}>
                    {sub.name} ({sub.count})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        {hasPermission("products", "create") && (
          <button
            onClick={() => navigateTo("add-product")}
            className="admin-btn-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "42px",
              padding: "0 20px",
              backgroundColor: "#1B1F8C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Clickable table */}
      <ClickableDataTable
        columns={columns}
        data={paginated}
        emptyMessage="No products match your search."
        onRowClick={(row) => navigateTo("product-details", row.id)}
      />

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

/** A local wrapper that adds onClick on each tr row */
function ClickableDataTable({ columns, data, emptyMessage, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E7E7E2",
        padding: "48px 24px",
        textAlign: "center",
        color: "#6B6B75",
        fontSize: "14px",
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      border: "1px solid #E7E7E2",
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
          minWidth: "750px",
        }}>
          <thead>
            <tr style={{ backgroundColor: "#FAFAF7", borderBottom: "1px solid #E7E7E2" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: col.align || "left",
                    padding: "14px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#6B6B75",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    width: col.width || "auto",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick(row)}
                style={{
                  borderBottom: rowIndex < data.length - 1 ? "1px solid #F0F0EC" : "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F8FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "14px 16px",
                      color: "#14151A",
                      verticalAlign: "middle",
                      textAlign: col.align || "left",
                      whiteSpace: col.nowrap ? "nowrap" : "normal",
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selectStyle = {
  height: "42px",
  padding: "0 14px",
  border: "1px solid #E7E7E2",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#14151A",
  backgroundColor: "#FFFFFF",
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
  minWidth: "140px",
};
