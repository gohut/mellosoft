import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * ProductGridSkeleton — Renders a grid of ProductCardSkeletons.
 *
 * Uses the same grid CSS class as actual product grids.
 *
 * Props:
 *   count      {number} — number of card skeletons to render (default 8)
 *   gridStyle  {object} — override grid container style if needed
 */
export default function ProductGridSkeleton({ count = 8, gridStyle = {} }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
        width: "100%",
        minWidth: 0,
        ...gridStyle
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        Loading products...
      </span>
    </div>
  );
}
