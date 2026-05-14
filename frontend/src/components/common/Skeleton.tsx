interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = "100%", height = "16px", radius = "var(--radius-sm)", style }: SkeletonProps) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius: radius, ...style }}
  />
);

export const SkeletonCard = () => (
  <div className="card" style={{ overflow: "hidden" }}>
    <Skeleton height="220px" radius="0" />
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <Skeleton height="14px" width="80%" />
      <Skeleton height="14px" width="55%" />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <Skeleton height="24px" width="70px" />
        <Skeleton height="34px" width="80px" radius="var(--radius-md)" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
    <Skeleton width="40px" height="40px" radius="var(--radius-sm)" style={{ flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
      <Skeleton height="14px" width="60%" />
      <Skeleton height="12px" width="35%" />
    </div>
    <Skeleton height="14px" width="60px" style={{ flexShrink: 0 }} />
  </div>
);

export default Skeleton;
