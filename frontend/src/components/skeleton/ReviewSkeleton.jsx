import Skeleton from "./Skeleton";

/**
 * ReviewSkeleton — Skeleton for review cards in CustomerReviewsSection.
 * Matches the current equal-height flex card structure:
 *   Customer name | Date
 *   Stars
 *   Review text
 *   Review images (optional)
 *   Product reference (bottom, margin-top: auto)
 */
function ReviewCardSkeleton({ maxWidth = 520 }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E7E7E2",
        borderRadius: 16,
        padding: "24px",
        width: "100%",
        maxWidth,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        height: "100%"
      }}
    >
      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Header: name + date */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Skeleton width="36%" height={15} borderRadius={4} />
          <Skeleton width="20%" height={11} borderRadius={4} />
        </div>

        {/* Stars */}
        <Skeleton width="34%" height={13} borderRadius={4} style={{ marginBottom: 12 }} />

        {/* Review text lines */}
        <Skeleton width="95%" height={13} borderRadius={4} style={{ marginBottom: 5 }} />
        <Skeleton width="80%" height={13} borderRadius={4} style={{ marginBottom: 5 }} />
        <Skeleton width="60%" height={13} borderRadius={4} style={{ marginBottom: 14 }} />

        {/* Image thumbnails placeholder */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[1, 2].map((i) => (
            <Skeleton key={i} className="skeleton-rounded" style={{ width: 56, height: 56, flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Product reference — bottom anchored */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 12,
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <Skeleton className="skeleton-rounded" style={{ width: 36, height: 36, flexShrink: 0 }} />
        <Skeleton width="50%" height={13} borderRadius={4} />
      </div>
    </div>
  );
}

export default function ReviewSkeleton({ count = 3 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading reviews"
      style={{
        display: "grid",
        gridTemplateColumns: count === 1 ? "1fr" : count === 2 ? "repeat(2, minmax(0, 480px))" : "repeat(3, minmax(0, 380px))",
        justifyContent: "center",
        alignItems: "stretch",
        gap: 24,
        maxWidth: count === 1 ? 520 : count === 2 ? 1020 : 1200,
        margin: "0 auto",
        width: "100%"
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}
