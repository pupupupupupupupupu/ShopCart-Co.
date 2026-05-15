import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../../components/common/Skeleton";

/* Recharts is loaded from CDN dynamically to avoid build-time dep */
declare const Recharts: any;

type DayRevenue   = { _id: string; revenue: number; orders: number };
type StatusCount  = { _id: string; count: number };
type LowStock     = { _id: string; name: string; stock: number };

const COLORS = ["#162231","#e8622a","#3a6898","#16a34a","#d97706","#7c3aed"];

const StatCard = ({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) => (
  <div className="card" style={{ padding: "20px 24px" }}>
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 10 }}>{label}</p>
    <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: accent || "var(--brand-800)", lineHeight: 1, marginBottom: 6 }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>}
  </div>
);

const AdminAnalytics = () => {
  const axiosAuth = useAxiosPrivate();
  const { toast }  = useToast();

  const [stats, setStats]           = useState<any>(null);
  const [data, setData]             = useState<any>(null);
  const [days, setDays]             = useState(30);
  const [loading, setLoading]       = useState(true);
  const [chartsReady, setChartsReady] = useState(!!(window as any).Recharts);

  useEffect(() => {
    if (!(window as any).Recharts) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/recharts@2.12.7/umd/Recharts.js";
      s.onload = () => setChartsReady(true);
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          axiosAuth.get("/admin/stats"),
          axiosAuth.get(`/admin/analytics?days=${days}`),
        ]);
        setStats(statsRes.data);
        setData(analyticsRes.data);
      } catch { toast("Failed to load analytics", "error"); }
      finally { setLoading(false); }
    })();
  }, [days]);

  if (loading || !stats || !data) return (
    <div>
      <h1 style={{ marginBottom: 32 }}>Analytics</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} height="110px" radius="var(--radius-xl)" />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Skeleton height="320px" radius="var(--radius-xl)" />
        <Skeleton height="320px" radius="var(--radius-xl)" />
      </div>
    </div>
  );

  const totalRevenue = data.dailyRevenue.reduce((s: number, d: DayRevenue) => s + d.revenue, 0);
  const totalOrders  = data.dailyRevenue.reduce((s: number, d: DayRevenue) => s + d.orders, 0);

  const statusTotal = data.statusBreakdown.reduce((s: number, b: StatusCount) => s + b.count, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Platform performance overview</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              style={{
                padding: "7px 16px", borderRadius: "var(--radius-md)", cursor: "pointer",
                fontSize: 13, fontWeight: 500, border: "1.5px solid",
                background: days === d ? "var(--brand-800)" : "var(--surface)",
                color: days === d ? "#fff" : "var(--text-secondary)",
                borderColor: days === d ? "var(--brand-800)" : "var(--border-strong)",
                fontFamily: "var(--font-body)", transition: "all var(--transition-fast)",
              }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} sub="All-time paid orders" accent="var(--brand-800)" />
        <StatCard label={`Revenue (${days}d)`} value={`$${totalRevenue.toFixed(2)}`} sub={`${totalOrders} orders`} accent="var(--accent)" />
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} sub="Registered accounts" />
        <StatCard label="Total Products" value={stats.totalProducts.toLocaleString()} sub="Active listings" />
      </div>

      {/* Charts row */}
      {chartsReady && (window as any).Recharts ? (
        (() => {
          const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
            ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } = (window as any).Recharts;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Revenue line chart */}
              <div className="card" style={{ padding: 24 }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Daily Revenue — Last {days} Days</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.dailyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                      tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                      tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                    <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2.5}
                      dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* Top products bar chart */}
                <div className="card" style={{ padding: 24 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Top Products by Revenue</p>
                  {data.topProducts.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: 40 }}>No data for this period.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.topProducts.slice(0, 6)} layout="vertical"
                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                          tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                        <YAxis type="category" dataKey="name" width={120}
                          tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                          tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + "…" : v} />
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                        <Bar dataKey="revenue" fill="var(--brand-500)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Status pie */}
                <div className="card" style={{ padding: 24 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Order Status Mix</p>
                  {data.statusBreakdown.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: 40 }}>No orders yet.</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={data.statusBreakdown} dataKey="count" nameKey="_id"
                            cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                            {data.statusBreakdown.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number, n: string) => [v, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        {data.statusBreakdown.map((b: StatusCount, i: number) => (
                          <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ flex: 1, color: "var(--text-secondary)", textTransform: "capitalize" }}>{b._id}</span>
                            <span style={{ fontWeight: 600 }}>{((b.count / statusTotal) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Loading charts…
        </div>
      )}

      {/* Low stock alerts */}
      {data.lowStock.length > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "var(--warning)" }}>
            ⚠ Low Stock Alerts ({data.lowStock.length})
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {data.lowStock.map((p: LowStock) => (
              <div key={p._id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: p.stock === 0 ? "var(--error-light)" : "var(--warning-light)",
                borderRadius: "var(--radius-md)", fontSize: 13,
              }}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: p.stock === 0 ? "var(--error)" : "var(--warning)" }}>
                  {p.stock === 0 ? "OUT" : p.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
