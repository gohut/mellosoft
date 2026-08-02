"use client";

import React, { useState } from "react";
import { MOCK_CATEGORIES } from "../data/adminMockData";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";

export default function CategoriesView() {
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div className="admin-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#14151A", margin: 0 }}>Product Categories</h3>
          <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{MOCK_CATEGORIES.length} categories</p>
        </div>
        <button className="admin-btn-hover" style={addBtnStyle}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Grid */}
      <div className="admin-categories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.id} className="admin-card-hover" style={cardStyle}>
            <div style={{
              height: "160px",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#F7F7F2",
              marginBottom: "16px",
            }}>
              <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#14151A", margin: 0 }}>{cat.name}</h4>
                <p style={{ fontSize: "13px", color: "#6B6B75", marginTop: "4px" }}>{cat.productCount} products</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button style={iconActionBtnStyle} title="Edit">
                  <Pencil size={15} color="#F59E0B" />
                </button>
                <button onClick={() => setDeleteTarget(cat)} style={iconActionBtnStyle} title="Delete">
                  <Trash2 size={15} color="#DC2626" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Delete Category?"
        message={`Delete "${deleteTarget?.name}"? Products in this category will become uncategorized.`}
      />


    </div>
  );
}

const addBtnStyle = {
  display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px",
  backgroundColor: "#1B1F8C", color: "#FFFFFF", border: "none", borderRadius: "10px",
  fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const cardStyle = {
  backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E7E2", padding: "16px",
};

const iconActionBtnStyle = {
  width: "32px", height: "32px", border: "1px solid #E7E7E2", borderRadius: "8px",
  backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
};
