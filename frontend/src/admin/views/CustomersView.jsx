"use client";

import React from "react";
import { MOCK_CUSTOMERS } from "../data/adminMockData";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Eye, Pencil } from "lucide-react";
import { formatPrice } from "../../utils/currency";

export default function CustomersView() {
  const columns = [
    {
      key: "avatar", label: "", width: "48px",
      render: (val) => (
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          backgroundColor: "#E8E9F8", color: "#1B1F8C", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700,
        }}>
          {val}
        </div>
      ),
    },
    { key: "name", label: "Name", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "email", label: "Email", render: (val) => <span style={{ color: "#6B6B75", fontSize: "13px" }}>{val}</span> },
    { key: "phone", label: "Phone", nowrap: true },
    { key: "totalOrders", label: "Orders", align: "center", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: "totalSpending", label: "Spending", nowrap: true, render: (val) => <span style={{ fontWeight: 600 }}>{formatPrice(val)}</span> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
    {
      key: "actions", label: "Actions", align: "center",
      render: () => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          <button style={actionBtnStyle} title="View"><Eye size={15} color="#1B1F8C" /></button>
          <button style={actionBtnStyle} title="Edit"><Pencil size={15} color="#F59E0B" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Customer Management</h3>
        <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{MOCK_CUSTOMERS.length} registered customers</p>
      </div>
      <DataTable columns={columns} data={MOCK_CUSTOMERS} />
    </div>
  );
}

const actionBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
