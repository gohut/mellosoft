"use client";

import React, { useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw } from "lucide-react";

export default function InventoryView() {
  const { products = [], navigateTo } = useAdmin();

  const inventoryData = useMemo(() => {
    const rows = [];
    products.forEach((prod) => {
      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        prod.variants.forEach((v, vIdx) => {
          const stock = Number(v.Stock ?? v.stock ?? 0);
          const size = v.Size || v.size || "";
          const firmness = v.Firmness || v.firmness || "";
          const variantLabel = [size, firmness].filter(Boolean).join(" / ") || `Variant ${vIdx + 1}`;
          const status = stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "In Stock";

          rows.push({
            id: `${prod.id}-${vIdx}`,
            productId: prod.id,
            product: prod.name,
            variant: variantLabel,
            stock: stock,
            reserved: 0,
            available: stock,
            status: status
          });
        });
      } else {
        const stock = Number(prod.stock ?? prod.Stock ?? 0);
        const status = stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "In Stock";
        rows.push({
          id: prod.id,
          productId: prod.id,
          product: prod.name,
          variant: "Standard",
          stock: stock,
          reserved: 0,
          available: stock,
          status: status
        });
      }
    });
    return rows;
  }, [products]);

  const columns = [
    { key: "product", label: "Product", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "variant", label: "Variant", nowrap: true },
    { key: "stock", label: "Stock", align: "center", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "reserved", label: "Reserved", align: "center" },
    {
      key: "available", label: "Available", align: "center",
      render: (val) => <span style={{ fontWeight: 700, color: val === 0 ? "#DC2626" : val <= 10 ? "#F59E0B" : "#14151A" }}>{val}</span>,
    },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    {
      key: "actions", label: "Update", align: "center",
      render: (val, row) => (
        <button
          onClick={() => navigateTo && navigateTo("products")}
          style={updateBtnStyle}
          title="Update Stock"
        >
          <RefreshCw size={14} />
          Update
        </button>
      ),
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Inventory Management</h3>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{inventoryData.length} product variants</p>
        </div>
      </div>
      <DataTable columns={columns} data={inventoryData} />
    </div>
  );
}

const updateBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 14px",
  border: "1px solid #E7E7E2", borderRadius: "8px", backgroundColor: "#FFFFFF", color: "#1B1F8C",
  fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit",
  whiteSpace: "nowrap",
};
