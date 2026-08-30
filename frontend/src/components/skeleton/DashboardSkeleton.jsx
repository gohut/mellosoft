import Skeleton from "./Skeleton";

/**
 * DashboardSkeleton — Skeleton for Admin Dashboard.
 * Matches:
 *   - Header + period filter
 *   - 5 compact KPI cards (Revenue, Orders, Products, Low Stock, Customers)
 *   - Sales Overview chart (65%) + Order Overview breakdown (35%)
 *   - Recent Orders (65%) + Top Selling (35%)
 *   - Inventory Overview (30%) + Low Stock Alerts (70%)
 */
export default function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Page title + time filter pills */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Skeleton width={140} height={24} borderRadius={6} />
          <Skeleton width={180} height={14} borderRadius={4} style={{ marginTop: 6 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={64} height={28} borderRadius={6} />
          ))}
        </div>
      </div>

      {/* KPI Cards Row: 5 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E7E7E2",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton width="50%" height={11} borderRadius={4} />
              <Skeleton style={{ width: 28, height: 28, borderRadius: 7 }} />
            </div>
            <Skeleton width="60%" height={24} borderRadius={6} />
            <Skeleton width="45%" height={11} borderRadius={4} />
          </div>
        ))}
      </div>

      {/* Row 2: Sales Overview Chart + Order Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "16px" }}>
        {/* Chart body */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton width={120} height={16} borderRadius={5} />
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width={36} height={22} borderRadius={4} />
              ))}
            </div>
          </div>
          <Skeleton
            style={{
              width: "100%",
              height: 220,
              borderRadius: 8,
              backgroundColor: "#F7F7F2",
            }}
          />
        </div>

        {/* Order Overview panel */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={110} height={16} borderRadius={5} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Skeleton style={{ width: 8, height: 8, borderRadius: "50%" }} />
              <Skeleton width={70} height={12} borderRadius={4} />
              <Skeleton style={{ flex: 1, height: 4, borderRadius: 2 }} />
              <Skeleton width={20} height={12} borderRadius={4} />
            </div>
          ))}
          <Skeleton width="100%" height={34} borderRadius={8} style={{ marginTop: "auto" }} />
        </div>
      </div>

      {/* Row 3: Recent Orders + Top Selling */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "16px" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={120} height={16} borderRadius={5} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "1px solid #F4F4F0" }}>
              <Skeleton width="20%" height={13} borderRadius={4} />
              <Skeleton width="25%" height={13} borderRadius={4} />
              <Skeleton width="18%" height={13} borderRadius={4} />
              <Skeleton width="15%" height={18} borderRadius={6} />
              <Skeleton width="15%" height={13} borderRadius={4} />
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={100} height={16} borderRadius={5} />
            <Skeleton width={40} height={12} borderRadius={4} />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Skeleton width={12} height={12} borderRadius={2} />
              <Skeleton style={{ width: 38, height: 38, borderRadius: 8 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <Skeleton width="70%" height={13} borderRadius={4} />
                <Skeleton width="45%" height={10} borderRadius={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Inventory Overview + Low Stock Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.1fr", gap: "16px" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Skeleton width={130} height={16} borderRadius={5} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={80} height={13} borderRadius={4} />
            <Skeleton width={30} height={14} borderRadius={4} />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton width={60} height={12} borderRadius={3} />
                <Skeleton width={24} height={12} borderRadius={3} />
              </div>
              <Skeleton width="100%" height={5} borderRadius={3} />
            </div>
          ))}
          <Skeleton width="100%" height={34} borderRadius={8} style={{ marginTop: "auto" }} />
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7E7E2",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={140} height={16} borderRadius={5} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "1px solid #F4F4F0" }}>
              <Skeleton width="30%" height={13} borderRadius={4} />
              <Skeleton width="18%" height={13} borderRadius={4} />
              <Skeleton width="18%" height={13} borderRadius={4} />
              <Skeleton width="12%" height={13} borderRadius={4} />
              <Skeleton width="16%" height={18} borderRadius={6} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
