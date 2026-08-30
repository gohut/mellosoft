/**
 * Skeleton — Base reusable skeleton block.
 *
 * Usage:
 *   <Skeleton width="60%" height={16} borderRadius={6} className="my-extra-class" />
 *   <Skeleton className="skeleton-circle" style={{ width: 40, height: 40 }} />
 */
import "./SkeletonBase.css";

export default function Skeleton({
  width,
  height,
  borderRadius,
  className = "",
  style = {},
  ...rest
}) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-block ${className}`}
      style={{
        width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
        borderRadius: borderRadius !== undefined ? (typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius) : undefined,
        display: "block",
        ...style
      }}
      {...rest}
    />
  );
}
