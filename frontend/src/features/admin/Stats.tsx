import { useEffect, useState } from "react";
import { getAdminStats, type AdminStats } from "../../api/admin.api";
import { Skeleton } from "../../components/common/Skeleton";
import ErrorBox from "../../components/common/ErrorBox";

const CARDS = [
  { key: "totalRevenue",  label: "Total Revenue",   icon: "💰", color: "var(--success)",  fmt: (v: number) => `$${v.toFixed(2)}` },
  { key: "totalOrders",   label: "Orders Placed",   icon: "🛍", color: "var(--accent)",   fmt: (v: number) => v.toLocaleString() },
  { key: "totalProducts", label: "Active Products", icon: "📦", color: "var(--brand-500)", fmt: (v: number) => v.toLocaleString() },
  { key: "totalUsers",    label: "Registered Users",icon: "👥", color: "#7c3aed",          fmt: (v: number) => v.toLocaleString() },
];

const Stats = () => {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch {
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      <ErrorBox message={error} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {CARDS.map(({ key, label, icon, color, fmt }) => (
          <div key={key} style={{
            background: "var(--surface)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-card)", padding: "22px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              width: "50px", height: "50px", borderRadius: "var(--radius-md)",
              background: `${color}18`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "22px", flexShrink: 0,
            }}>{icon}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "4px" }}>
                {label}
              </p>
              {loading
                ? <Skeleton height="28px" width="72px" />
                : <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem",
                    fontWeight: 700, color, lineHeight: 1 }}>
                    {stats ? fmt(stats[key as keyof AdminStats] as number) : "—"}
                  </p>
              }
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
