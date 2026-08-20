"use client";

import React from "react";

export default function DataTable({ columns, data, emptyMessage = "No data found", onRowClick }) {
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
          minWidth: "700px",
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
                className="admin-row-hover"
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: rowIndex < data.length - 1 ? "1px solid #F0F0EC" : "none",
                  cursor: onRowClick ? "pointer" : "default",
                }}
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
