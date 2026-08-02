"use client";

import React from "react";
import { MOCK_INVENTORY } from "../data/adminMockData";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw } from "lucide-react";

export default function InventoryView() {
  const columns = [
    { key: "product", label: "Product", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "variant", label: "Variant", nowrap: true },
    { key: "stock", label: "Stock", align: "center", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "reserved", label: "Reserved", align: "center" },
    {
      key: "available", label: "Available", align: "center",
      render: (val) => <span style={{ fontWeight: 700, color: val === 0 ? "#DC2626" : val < 5 ? "#F59E0B" : "#14151A" }}>{val}</span>,
    },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    {
      key: "actions", label: "Update", align: "center",
      render: () => (
        <button style={updateBtnStyle} title="Update Stock">
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
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{MOCK_INVENTORY.length} product variants</p>
        </div>
      </div>
      <DataTable columns={columns} data={MOCK_INVENTORY} />
    </div>
  );
}

const updateBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 14px",
  border: "1px solid #E7E7E2", borderRadius: "8px", backgroundColor: "#FFFFFF", color: "#1B1F8C",
  fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit",
  whiteSpace: "nowrap",
};
