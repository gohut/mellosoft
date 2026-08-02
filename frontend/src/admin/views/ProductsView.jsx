"use client";

import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import { MOCK_PRODUCTS } from "../data/adminMockData";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/currency";

export default function ProductsView() {
  const { navigateTo } = useAdmin();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getStockStatus = (product) => {
    const stockVal = Math.floor(Math.random() * 60) + 1;
    if (stockVal === 0) return "Out of Stock";
    if (stockVal < 10) return "Low Stock";
    return "In Stock";
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      width: "60px",
      render: (_, row) => (
        <img src={row.images[0]} alt="" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", backgroundColor: "#F7F7F2" }} />
      ),
    },
    {
      key: "name",
      label: "Product Name",
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: "category",
      label: "Category",
      nowrap: true,
      render: (val) => <span style={{ textTransform: "capitalize" }}>{val}</span>,
    },
    {
      key: "price",
      label: "Price",
      nowrap: true,
      render: (val) => <span style={{ fontWeight: 600 }}>{formatPrice(val)}</span>,
    },
    {
      key: "reviewCount",
      label: "Stock",
      align: "center",
      render: (val) => <span>{val}</span>,
    },
    {
      key: "badge",
      label: "Status",
      render: (_, row) => <StatusBadge status={row.badge === "Bestseller" || row.badge === "Premium" || row.badge === "Essential" ? "Active" : "Active"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          <button onClick={() => navigateTo("products")} style={actionBtnStyle} title="View">
            <Eye size={15} color="#1B1F8C" />
          </button>
          <button onClick={() => navigateTo("add-product")} style={actionBtnStyle} title="Edit">
            <Pencil size={15} color="#F59E0B" />
          </button>
          <button onClick={() => setDeleteTarget(row)} style={actionBtnStyle} title="Delete">
            <Trash2 size={15} color="#DC2626" />
          </button>
        </div>
      ),
    },
  ];

  const categories = ["All", ...new Set(MOCK_PRODUCTS.map((p) => p.category))];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top bar */}
      <div className="admin-products-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." style={{ width: "260px", minWidth: "180px" }} />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
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
      </div>

      {/* Table */}
      <DataTable columns={columns} data={paginated} emptyMessage="No products match your search." />

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />


    </div>
  );
}

const actionBtnStyle = {
  width: "32px",
  height: "32px",
  border: "1px solid #E7E7E2",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

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
