import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type OrderItem = { name: string; price: number; qty: number; image?: string };
type Order = {
  _id: string; items: OrderItem[];
  subtotal: number; tax: number; shipping: number;
  couponDiscount: number; totalAmount: number;
  status: string; paymentStatus: string;
  createdAt: string; shippingAddress?: any;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  pending:    { bg: "var(--warning-light)",  color: "var(--warning)",  icon: "⏳" },
  processing: { bg: "var(--brand-50)",       color: "var(--brand-500)", icon: "⚙️" },
  shipped:    { bg: "#ede9fe",               color: "#7c3aed",          icon: "🚚" },
  delivered:  { bg: "var(--success-light)",  color: "var(--success)",   icon: "✅" },
  cancelled:  { bg: "var(--error-light)",    color: "var(--error)",     icon: "✕" },
  refunded:   { bg: "var(--gray-100)",       color: "var(--gray-500)",  icon: "↩" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLE[status] || { bg: "var(--gray-100)", color: "var(--gray-500)", icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: "var(--radius-full)",
      fontSize: 12, fontWeight: 700, textTransform: "capitalize",
      background: s.bg, color: s.color,
    }}>
      <span style={{ fontSize: 11 }}>{s.icon}</span> {status}
    </span>
  );
};

const OrderHistory = () => {
  const axiosPrivate = useAxiosPrivate();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const params = filter ? `?status=${filter}` : "";
        const res = await axiosPrivate.get(`/orders/me${params}`);
        setOrders(res.data.orders ?? res.data);
      } catch {
        setError("Failed to load order history");
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  if (loading) return <Loader />;

  const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  return (
    <main>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ marginBottom: "6px" }}>Order History</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-md)", cursor: "pointer",
              fontSize: 13, fontWeight: 500, border: "1.5px solid",
              background: filter === s ? "var(--brand-800)" : "var(--surface)",
              color: filter === s ? "#fff" : "var(--text-secondary)",
              borderColor: filter === s ? "var(--brand-800)" : "var(--border-strong)",
              fontFamily: "var(--font-body)", transition: "all var(--transition-fast)",
            }}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      <ErrorBox message={error} />

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ marginBottom: "10px" }}>No orders yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px" }}>You haven't placed any orders.</p>
          <Link to="/"><button className="btn-brand">Browse Products</button></Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order, idx) => (
            <div key={order._id} className="card fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 24px", borderBottom: "1px solid var(--border)",
                background: "var(--gray-50)", flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 2 }}>Order</p>
                    <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 2 }}>Date</p>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 2, textAlign: "right" }}>Total</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--brand-800)" }}>
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: "0 24px" }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 0",
                    borderBottom: i < order.items.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        background: "var(--gray-100)", color: "var(--text-muted)",
                        borderRadius: "var(--radius-sm)", fontSize: 11, fontWeight: 700,
                        padding: "2px 7px", minWidth: 28, textAlign: "center",
                      }}>×{item.qty}</span>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown footer */}
              <div style={{
                padding: "14px 24px", background: "var(--gray-50)",
                borderTop: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 16, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  {order.couponDiscount > 0 && (
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>−${order.couponDiscount.toFixed(2)} discount</span>
                  )}
                  {order.tax > 0 && <span>Tax ${order.tax.toFixed(2)}</span>}
                  <span>{order.shipping === 0 ? "Free shipping" : `Shipping $${order.shipping.toFixed(2)}`}</span>
                  <span style={{
                    fontWeight: 600, color: order.paymentStatus === "paid" ? "var(--success)"
                      : order.paymentStatus === "refunded" ? "var(--gray-500)" : "var(--warning)",
                  }}>
                    {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentStatus === "refunded" ? "↩ Refunded" : "⏳ Unpaid"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrderHistory;
