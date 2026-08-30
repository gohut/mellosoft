import Skeleton from "./Skeleton";

/**
 * OrderSkeleton — Skeleton for order list cards in OrdersView.
 *
 * Each row represents:
 *   Order ID | Date | Products summary | Amount | Status
 */
function OrderCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E7E7E2",
        borderRadius: "16px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box"
      }}
    >
      {/* Header row: Order ID + Status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="30%" height={15} borderRadius={4} />
        <Skeleton width="18%" height={24} className="skeleton-pill" />
      </div>
      {/* Date + payment */}
      <div style={{ display: "flex", gap: 16 }}>
        <Skeleton width="22%" height={12} borderRadius={4} />
        <Skeleton width="18%" height={12} borderRadius={4} />
      </div>
      {/* Product images + name */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <Skeleton width="50%" height={14} borderRadius={4} />
          <Skeleton width="35%" height={11} borderRadius={4} />
        </div>
        <Skeleton width="15%" height={18} borderRadius={4} />
      </div>
      {/* Action buttons row */}
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton height={34} className="skeleton-pill" style={{ flex: 1 }} />
        <Skeleton height={34} className="skeleton-pill" style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function OrderSkeleton({ count = 4 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading orders"
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}
