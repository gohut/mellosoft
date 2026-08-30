import Skeleton from "./Skeleton";

/**
 * TableSkeleton — Skeleton for admin data tables.
 *
 * Props:
 *   rows    {number} — number of skeleton rows (default 6)
 *   columns {number} — number of columns (default 6)
 *   showHeader {boolean} — whether to show column header skeletons (default true)
 */
export default function TableSkeleton({ rows = 6, columns = 6, showHeader = true }) {
  // Width distribution per column
  const colWidths = ["12%", "22%", "18%", "14%", "14%", "12%"];

  return (
    <div
      aria-busy="true"
      aria-label="Loading table data"
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid #E7E7E2",
        overflow: "hidden"
      }}
    >
      {/* Header row */}
      {showHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 20px",
            borderBottom: "1px solid #E7E7E2",
            backgroundColor: "#FAFAF7"
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              height={11}
              borderRadius={4}
              style={{ flex: colWidths[i] ? `0 0 ${colWidths[i]}` : "1" }}
            />
          ))}
        </div>
      )}

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 20px",
            borderBottom: rowIdx < rows - 1 ? "1px solid #F1F5F9" : "none"
          }}
        >
          {/* Image cell for first column */}
          <Skeleton
            className="skeleton-rounded"
            style={{ width: 36, height: 36, flexShrink: 0 }}
          />
          {Array.from({ length: columns - 1 }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={13}
              borderRadius={4}
              style={{ flex: colWidths[colIdx + 1] ? `0 0 ${colWidths[colIdx + 1]}` : "1" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
