import Skeleton from "./Skeleton";

/**
 * DashboardSkeleton — Skeleton for Admin Dashboard.
 * Matches:
 *   - 4 KPI cards (Revenue, Orders, Customers, Products)
 *   - Chart area placeholder (Recharts not mounted until data ready)
 *   - Recent Orders table
 *   - Low Stock Products
 */
export default function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Page title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="28%" height={26} borderRadius={6} />
        <Skeleton width="14%" height={36} className="skeleton-pill" />
      </div>

      {/* KPI Cards Row: 4 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E7E7E2",
              borderRadius: 16,
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            {/* Icon + label row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton width="40%" height={12} borderRadius={4} />
              <Skeleton className="skeleton-rounded" style={{ width: 36, height: 36 }} />
            </div>
            {/* Large number */}
            <Skeleton width="55%" height={28} borderRadius={6} />
            {/* % change label */}
            <Skeleton width="42%" height={12} borderRadius={4} />
          </div>
        ))}
      </div>

      {/* Chart Area — DO NOT render Recharts until data is ready */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E7E7E2",
          borderRadius: 16,
          padding: "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Skeleton width="28%" height={16} borderRadius={5} />
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} width={56} height={28} className="skeleton-pill" />)}
          </div>
        </div>
        {/* Chart body placeholder */}
        <Skeleton
          style={{
            width: "100%",
            height: 240,
            borderRadius: 12,
            backgroundColor: "#F5F5F0"
          }}
        />
      </div>

      {/* Bottom two panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* Recent Orders mini-table */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 16,
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <Skeleton width="36%" height={16} borderRadius={5} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
              <Skeleton width="18%" height={13} borderRadius={4} />
              <Skeleton width="24%" height={13} borderRadius={4} />
              <Skeleton width="14%" height={13} borderRadius={4} style={{ marginLeft: "auto" }} />
              <Skeleton width="16%" height={22} className="skeleton-pill" />
            </div>
          ))}
        </div>

        {/* Low Stock Products */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 16,
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <Skeleton width="48%" height={16} borderRadius={5} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
              <Skeleton className="skeleton-rounded" style={{ width: 36, height: 36, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <Skeleton width="70%" height={13} borderRadius={4} />
                <Skeleton width="40%" height={11} borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
