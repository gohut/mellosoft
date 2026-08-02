"use client";

import React, { useState, useMemo } from "react";
import { MOCK_ORDERS } from "../data/adminMockData";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Eye } from "lucide-react";
import { formatPrice } from "../../utils/currency";

const filterTabs = ["All", "Pending", "Processing", "Delivered", "Cancelled"];

export default function OrdersView() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    if (activeFilter === "All") return MOCK_ORDERS;
    return MOCK_ORDERS.filter((o) => o.orderStatus === activeFilter);
  }, [activeFilter]);

  const columns = [
    { key: "id", label: "Order ID", nowrap: true, render: (val) => <span style={{ fontWeight: 600, color: "#1B1F8C" }}>{val}</span> },
    { key: "customer", label: "Customer", render: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
    {
      key: "products", label: "Products",
      render: (val) => (
        <span style={{ fontSize: "13px", color: "#6B6B75" }}>
          {val.length > 1 ? `${val[0]} +${val.length - 1} more` : val[0]}
        </span>
      ),
    },
    { key: "amount", label: "Amount", nowrap: true, render: (val) => <span style={{ fontWeight: 600 }}>{formatPrice(val)}</span> },
    { key: "paymentStatus", label: "Payment", render: (val) => <StatusBadge status={val} /> },
    { key: "orderStatus", label: "Status", render: (val) => <StatusBadge status={val} /> },
    { key: "date", label: "Date", nowrap: true },
    {
      key: "actions", label: "Action", align: "center",
      render: () => (
        <button style={viewBtnStyle} title="View Order">
          <Eye size={15} color="#1B1F8C" />
        </button>
      ),
    },
  ];

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "4px", border: "1px solid #E7E7E2", flexWrap: "wrap" }}>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              height: "38px",
              padding: "0 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: activeFilter === tab ? 600 : 500,
              color: activeFilter === tab ? "#FFFFFF" : "#6B6B75",
              backgroundColor: activeFilter === tab ? "#1B1F8C" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage={`No ${activeFilter.toLowerCase()} orders found.`} />
    </div>
  );
}

const viewBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
