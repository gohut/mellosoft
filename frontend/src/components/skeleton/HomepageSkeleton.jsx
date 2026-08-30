import Skeleton from "./Skeleton";
import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * HomepageSkeleton — Skeleton for the homepage sections while hydrating.
 * Shows hero, categories, new arrivals, and best sellers in skeleton form.
 * Does NOT replace the entire page — only used during the brief mount window.
 */
export default function HomepageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading homepage" style={{ width: "100%", overflow: "hidden" }}>

      {/* ── HERO SLIDER SKELETON ── */}
      <div style={{ width: "100%", padding: "0 0 8px 0" }}>
        <Skeleton
          style={{
            width: "100%",
            height: "clamp(220px, 40vw, 540px)",
            borderRadius: "0 0 20px 20px",
            backgroundColor: "#E8EAF6"
          }}
        />
      </div>

      {/* ── SECTION SPACING ── */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 24px", boxSizing: "border-box" }}>

        {/* Shop by Category */}
        <div style={{ marginBottom: 40 }}>
          <Skeleton width="22%" height={28} borderRadius={6} style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 14, overflowX: "hidden" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ flexShrink: 0, width: 130, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <Skeleton style={{ width: 100, height: 100, borderRadius: "50%" }} />
                <Skeleton width={70} height={12} borderRadius={4} />
              </div>
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <Skeleton
          style={{ width: "100%", height: 180, borderRadius: 20, marginBottom: 40, backgroundColor: "#E8EAF6" }}
        />

        {/* New Arrivals heading + grid */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Skeleton width="22%" height={28} borderRadius={6} />
            <Skeleton width="12%" height={16} borderRadius={4} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 18
          }}>
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>

        {/* Best Sellers heading + grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Skeleton width="26%" height={28} borderRadius={6} />
            <Skeleton width="12%" height={16} borderRadius={4} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 18
          }}>
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
