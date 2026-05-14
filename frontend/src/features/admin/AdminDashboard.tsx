import Stats from "./Stats";
import { Link } from "react-router-dom";

const AdminDashboard = () => (
  <main>
    <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
      <div>
        <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "6px" }}>
          Admin Panel
        </p>
        <h1 style={{ marginBottom: "4px" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Overview of your store</p>
      </div>
      <Link to="/admin/products">
        <button className="btn-brand">
          ➕ Add Product
        </button>
      </Link>
    </div>

    <Stats />

    {/* Quick Actions */}
    <div style={{ marginTop: "32px" }}>
      <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        Quick Actions
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {[
          { to: "/admin/products", icon: "📦", title: "Manage Products", desc: "Add, edit or remove products" },
          { to: "/admin/users",    icon: "👥", title: "Manage Users",    desc: "View and manage accounts" },
        ].map(({ to, icon, title, desc }) => (
          <Link to={to} key={to} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
              padding: "20px",
              cursor: "pointer",
              transition: "all var(--transition-base)",
              border: "1.5px solid var(--border)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-400)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
              <h4 style={{ marginBottom: "4px", fontSize: "14px", fontWeight: 700 }}>{title}</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </main>
);

export default AdminDashboard;
