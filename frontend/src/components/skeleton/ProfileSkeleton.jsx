import Skeleton from "./Skeleton";

/**
 * ProfileSkeleton — Skeleton for ProfileView during auth loading.
 * Matches: avatar, name/email, personal details, saved addresses, orders summary.
 */
export default function ProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", boxSizing: "border-box" }}
    >
      {/* Profile header card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E7E7E2",
          borderRadius: 20,
          padding: "28px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24
        }}
      >
        {/* Avatar */}
        <Skeleton
          className="skeleton-circle"
          style={{ width: 72, height: 72, flexShrink: 0 }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="35%" height={20} borderRadius={6} />
          <Skeleton width="48%" height={14} borderRadius={4} />
          <Skeleton width="28%" height={12} borderRadius={4} />
        </div>
        <Skeleton width={88} height={36} className="skeleton-pill" />
      </div>

      {/* Personal details section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E7E7E2",
          borderRadius: 20,
          padding: "24px",
          marginBottom: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <Skeleton width="28%" height={18} borderRadius={5} />
          <Skeleton width={64} height={30} className="skeleton-pill" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="30%" height={11} borderRadius={3} />
              <Skeleton width="70%" height={16} borderRadius={4} />
            </div>
          ))}
        </div>
      </div>

      {/* Saved addresses section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E7E7E2",
          borderRadius: 20,
          padding: "24px",
          marginBottom: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Skeleton width="28%" height={18} borderRadius={5} />
          <Skeleton width={90} height={30} className="skeleton-pill" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#FAFAF7",
                border: "1px solid #E7E7E2",
                borderRadius: 12,
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Skeleton width="20%" height={13} borderRadius={4} />
                <Skeleton width={60} height={22} className="skeleton-pill" />
              </div>
              <Skeleton width="55%" height={13} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="40%" height={12} borderRadius={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
