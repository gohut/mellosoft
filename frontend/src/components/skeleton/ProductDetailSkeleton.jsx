import Skeleton from "./Skeleton";

/**
 * ProductDetailSkeleton — Matches the two-column desktop / single-column mobile
 * layout of ProductDetailView.jsx.
 *
 * Desktop: [Gallery LEFT] | [Info RIGHT]
 * Mobile:  Gallery → Thumbnails → Series → Title → Rating → Variants → Price → Buttons
 */
export default function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product details"
      style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "24px 24px 48px", boxSizing: "border-box" }}
    >
      <style>{`
        .pdsk-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: flex-start;
        }
        .pdsk-gallery { display: flex; flex-direction: column; gap: 12px; }
        .pdsk-thumbs { display: flex; gap: 8px; }
        .pdsk-thumb { width: 64px; height: 64px; flex-shrink: 0; }
        .pdsk-info { display: flex; flex-direction: column; gap: 16px; }
        .pdsk-pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .pdsk-pill { height: 36px; border-radius: 999px !important; }
        @media (max-width: 768px) {
          .pdsk-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .pdsk-thumb { width: 52px !important; height: 52px !important; }
        }
      `}</style>

      <div className="pdsk-layout">
        {/* LEFT — Gallery */}
        <div className="pdsk-gallery">
          {/* Main image */}
          <Skeleton
            style={{ width: "100%", aspectRatio: "1 / 0.9", borderRadius: "16px" }}
          />

          {/* Thumbnails */}
          <div className="pdsk-thumbs" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="pdsk-thumb skeleton-rounded" />
            ))}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="pdsk-info">
          {/* Series / category label */}
          <Skeleton width="28%" height={12} borderRadius={4} />

          {/* Product title */}
          <Skeleton width="70%" height={30} borderRadius={6} />
          <Skeleton width="45%" height={22} borderRadius={6} style={{ marginTop: -8 }} />

          {/* Rating row */}
          <Skeleton width="36%" height={16} borderRadius={4} />

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#E7E7E2", width: "100%" }} />

          {/* Variant label + pills */}
          <div>
            <Skeleton width="20%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
            <div className="pdsk-pill-row">
              {["40%", "36%", "32%"].map((w, i) => (
                <Skeleton key={i} className="pdsk-pill" width={w} />
              ))}
            </div>
          </div>

          {/* Bed size label + pills */}
          <div>
            <Skeleton width="22%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
            <div className="pdsk-pill-row">
              {["26%", "22%", "28%", "24%"].map((w, i) => (
                <Skeleton key={i} className="pdsk-pill" width={w} />
              ))}
            </div>
          </div>

          {/* Dimensions block */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={80} height={52} className="skeleton-rounded" />
            ))}
          </div>

          {/* Calculated price */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width="24%" height={11} borderRadius={4} />
            <Skeleton width="38%" height={32} borderRadius={6} />
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Skeleton className="skeleton-pill" height={48} style={{ flex: 1, minWidth: 120 }} />
            <Skeleton className="skeleton-pill" height={48} style={{ flex: 1, minWidth: 120 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
