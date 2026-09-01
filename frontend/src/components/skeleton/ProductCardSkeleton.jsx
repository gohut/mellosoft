import Skeleton from "./Skeleton";

/**
 * ProductCardSkeleton — Matches the exact dimensions and layout of <ProductCard />.
 *
 * Structure mirrors ProductCard.jsx:
 *   Image (aspect-ratio 1/0.82, rounded top)
 *   Info wrapper:
 *     Category label
 *     Product title
 *     Material/construction chip
 *     Rating row
 *     Price section (STARTING FROM + price)
 */
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="skeleton-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E7E7E2"
      }}
    >
      {/* Image area — aspect-ratio 1/0.82 matching ProductCard imageWrapperStyle */}
      <Skeleton
        className="skeleton-img-1-082"
        style={{ borderRadius: 0, flexShrink: 0, backgroundColor: "#EBEBEB" }}
      />

      {/* Info wrapper — padding 14px 16px 16px matching infoWrapperStyle */}
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
          minHeight: 0
        }}
      >
        {/* Category label — ~30% width, 10px height */}
        <Skeleton width="32%" height={10} borderRadius={4} />

        {/* Product title — ~55% width, 20px height */}
        <Skeleton width="58%" height={18} borderRadius={5} />

        {/* Construction chip — 35%, 22px, rounded */}
        <Skeleton width="38%" height={22} className="skeleton-rounded" style={{ marginTop: 2 }} />

        {/* Rating row — 42% */}
        <Skeleton width="42%" height={13} borderRadius={4} style={{ marginTop: 2 }} />

        {/* Price section — label + price */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "8px",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <Skeleton width="24%" height={10} borderRadius={3} />
          <Skeleton width="34%" height={16} borderRadius={4} />
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .skeleton-card {
            border-radius: 12px !important;
          }
          .skeleton-card > div:last-child {
            padding: 8px 10px 10px !important;
            gap: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}
