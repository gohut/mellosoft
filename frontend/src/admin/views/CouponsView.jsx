"use client";

import React, { useState } from "react";
import { MOCK_COUPONS } from "../data/adminMockData";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";

export default function CouponsView() {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    {
      key: "code", label: "Coupon Code", nowrap: true,
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, color: "#1B1F8C", fontFamily: "monospace", fontSize: "14px", letterSpacing: "0.05em" }}>{val}</span>
          <button
            onClick={() => navigator.clipboard?.writeText(val)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}
            title="Copy code"
          >
            <Copy size={14} color="#6B6B75" />
          </button>
        </div>
      ),
    },
    { key: "discount", label: "Discount", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    {
      key: "usageCount", label: "Usage",
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          {row.usageLimit > 0 && <span style={{ color: "#6B6B75" }}> / {row.usageLimit}</span>}
          {row.usageLimit === 0 && <span style={{ color: "#6B6B75" }}> (Unlimited)</span>}
        </div>
      ),
    },
    { key: "expiryDate", label: "Expiry Date", nowrap: true },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    {
      key: "actions", label: "Actions", align: "center",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          <button style={actionBtnStyle} title="Edit"><Pencil size={15} color="#F59E0B" /></button>
          <button onClick={() => setDeleteTarget(row)} style={actionBtnStyle} title="Delete"><Trash2 size={15} color="#DC2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Coupon Management</h3>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{MOCK_COUPONS.length} coupons</p>
        </div>
        <button className="admin-btn-hover" style={addBtnStyle}>
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      <DataTable columns={columns} data={MOCK_COUPONS} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Delete Coupon?"
        message={`Delete coupon "${deleteTarget?.code}"? This action cannot be undone.`}
      />
    </div>
  );
}

const addBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const actionBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
