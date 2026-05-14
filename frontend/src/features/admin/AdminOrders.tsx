import { useEffect, useState, useCallback } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast } from "../../context/ToastContext";
import { SkeletonRow } from "../../components/common/Skeleton";

type Order = {
  _id: string; user: string; totalAmount: number; status: string;
  paymentStatus: string; createdAt: string; items: { name: string; qty: number }[];
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "var(--warning-light)",  color: "var(--warning)" },
  processing: { bg: "var(--brand-50)",       color: "var(--brand-500)" },
  shipped:    { bg: "#ede9fe",               color: "#7c3aed" },
  delivered:  { bg: "var(--success-light)",  color: "var(--success)" },
  cancelled:  { bg: "var(--error-light)",    color: "var(--error)" },
  refunded:   { bg: "var(--gray-100)",       color: "var(--gray-500)" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:    ["processing", "cancelled"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped:    ["delivered"],
  delivered:  ["refunded"],
  cancelled:  [],
  refunded:   [],
};

const Badge = ({ status }: { status: string }) => {
  const c = STATUS_COLORS[status] || { bg: "var(--gray-100)", color: "var(--gray-500)" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      borderRadius: "var(--radius-full)", fontSize: 11,
      fontWeight: 700, textTransform: "capitalize",
      background: c.bg, color: c.color,
    }}>{status}</span>
  );
};

const AdminOrders = () => {
  const axiosAuth = useAxiosPrivate();
  const { toast } = useToast();

  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatus]   = useState("");
  const [search, setSearch]         = useState("");
  const [updating, setUpdating]     = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await axiosAuth.get(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast("Failed to load orders", "error"); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await axiosAuth.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast(`Order updated to "${newStatus}"`, "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Update failed", "error");
    } finally { setUpdating(null); }
  };

  const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 6 }}>Order Management</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{total} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by username…"
          style={{
            padding: "9px 14px", border: "1.5px solid var(--border-strong)",
            borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)",
            fontSize: 14, outline: "none", minWidth: 220,
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button key={s || "all"} onClick={() => { setStatus(s); setPage(1); }}
              style={{
                padding: "7px 14px", borderRadius: "var(--radius-md)", cursor: "pointer",
                fontSize: 13, fontWeight: 500, border: "1.5px solid",
                background: statusFilter === s ? "var(--brand-800)" : "var(--surface)",
                color: statusFilter === s ? "#fff" : "var(--text-secondary)",
                borderColor: statusFilter === s ? "var(--brand-800)" : "var(--border-strong)",
                transition: "all var(--transition-fast)",
              }}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--border)" }}>
                {["Order", "Customer", "Items", "Total", "Status", "Payment", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan={8} style={{ padding: "12px 16px" }}><SkeletonRow /></td></tr>
                  ))
                : orders.map((order) => (
                    <>
                      <tr
                        key={order._id}
                        style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                        onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>{order.user}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--brand-800)" }}>
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: "14px 16px" }}><Badge status={order.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: order.paymentStatus === "paid" ? "var(--success)" : "var(--warning)" }}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {STATUS_TRANSITIONS[order.status]?.length > 0 && (
                            <select
                              value=""
                              disabled={updating === order._id}
                              onChange={(e) => { if (e.target.value) { e.stopPropagation(); handleStatusUpdate(order._id, e.target.value); }}}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                padding: "5px 10px", fontSize: 12,
                                border: "1.5px solid var(--border-strong)",
                                borderRadius: "var(--radius-md)",
                                fontFamily: "var(--font-body)", cursor: "pointer",
                                background: "var(--surface)",
                              }}
                            >
                              <option value="">Update →</option>
                              {STATUS_TRANSITIONS[order.status]?.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                      {expanded === order._id && (
                        <tr key={`${order._id}-exp`} style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--border)" }}>
                          <td colSpan={8} style={{ padding: "16px 24px" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>Items</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {order.items.map((item, i) => (
                                <span key={i} style={{ fontSize: 13, padding: "4px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                                  {item.name} ×{item.qty}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                width: 36, height: 36, borderRadius: "var(--radius-md)", cursor: "pointer",
                border: "1.5px solid",
                background: page === i + 1 ? "var(--brand-800)" : "var(--surface)",
                color: page === i + 1 ? "#fff" : "var(--text-secondary)",
                borderColor: page === i + 1 ? "var(--brand-800)" : "var(--border-strong)",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
              }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
