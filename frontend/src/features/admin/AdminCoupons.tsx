import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast } from "../../context/ToastContext";
import { SkeletonRow } from "../../components/common/Skeleton";

type Coupon = {
  _id: string; code: string; type: "percent" | "fixed";
  value: number; minCartValue: number; maxUses: number | null;
  usedCount: number; expiresAt: string | null; isActive: boolean;
};

const inputStyle: React.CSSProperties = {
  padding: "9px 13px", border: "1.5px solid var(--border-strong)",
  borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)",
  fontSize: 14, outline: "none", background: "var(--surface)", width: "100%",
};

const blank = (): Partial<Coupon> => ({
  code: "", type: "percent", value: 10,
  minCartValue: 0, maxUses: null, expiresAt: null, isActive: true,
});

const AdminCoupons = () => {
  const axiosAuth  = useAxiosPrivate();
  const { toast }  = useToast();

  const [coupons, setCoupons]   = useState<Coupon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<Partial<Coupon>>(blank());
  const [saving, setSaving]     = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/admin/coupons");
      setCoupons(res.data.coupons);
    } catch { toast("Failed to load coupons", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setForm(blank()); setEditId(null); setShowForm(true); };
  const openEdit   = (c: Coupon) => { setForm({ ...c }); setEditId(c._id); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(blank()); };

  const handleSave = async () => {
    if (!form.code || !form.type || form.value === undefined) {
      toast("Code, type, and value are required", "warning"); return;
    }
    setSaving(true);
    try {
      if (editId) {
        const res = await axiosAuth.put(`/admin/coupons/${editId}`, form);
        setCoupons((prev) => prev.map((c) => c._id === editId ? res.data : c));
        toast("Coupon updated!", "success");
      } else {
        const res = await axiosAuth.post("/admin/coupons", form);
        setCoupons((prev) => [res.data, ...prev]);
        toast("Coupon created!", "success");
      }
      cancelForm();
    } catch (err: any) {
      toast(err.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const handleToggle = async (c: Coupon) => {
    try {
      const res = await axiosAuth.put(`/admin/coupons/${c._id}`, { isActive: !c.isActive });
      setCoupons((prev) => prev.map((x) => x._id === c._id ? res.data : x));
      toast(`Coupon ${res.data.isActive ? "activated" : "deactivated"}`, "info");
    } catch { toast("Failed to update coupon", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await axiosAuth.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast("Coupon deleted", "info");
    } catch { toast("Delete failed", "error"); }
  };

  const isExpired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt) < new Date();
  const isMaxed   = (c: Coupon) => c.maxUses !== null && c.usedCount >= c.maxUses;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Coupons</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{coupons.length} discount codes</p>
        </div>
        <button onClick={openCreate} className="btn-brand" style={{ fontSize: 13 }}>+ New Coupon</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
            {editId ? "Edit Coupon" : "Create Coupon"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Code *</label>
              <input value={form.code || ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20" style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.06em" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Type *</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                style={inputStyle}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Value * {form.type === "percent" ? "(%)" : "($)"}
              </label>
              <input type="number" min={0} max={form.type === "percent" ? 100 : undefined}
                value={form.value || ""}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                placeholder={form.type === "percent" ? "20" : "15.00"} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Min Cart Value ($)</label>
              <input type="number" min={0} value={form.minCartValue || ""}
                onChange={(e) => setForm((f) => ({ ...f, minCartValue: Number(e.target.value) }))}
                placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Max Uses (blank = unlimited)</label>
              <input type="number" min={1} value={form.maxUses || ""}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : null }))}
                placeholder="∞" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Expires At (blank = never)</label>
              <input type="datetime-local"
                value={form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || null }))}
                style={inputStyle} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 20 }}>
            <input type="checkbox" checked={!!form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active (can be redeemed immediately)
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving} className="btn-brand" style={{ fontSize: 13 }}>
              {saving ? "Saving…" : editId ? "Update Coupon" : "Create Coupon"}
            </button>
            <button onClick={cancelForm} className="btn-outline" style={{ fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--border)" }}>
              {["Code", "Type", "Value", "Min Cart", "Uses", "Expires", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} style={{ padding: "12px 16px" }}><SkeletonRow /></td></tr>)
              : coupons.map((c) => {
                  const expired = isExpired(c);
                  const maxed   = isMaxed(c);
                  const effective = c.isActive && !expired && !maxed;
                  return (
                    <tr key={c._id} style={{ borderBottom: "1px solid var(--border)", opacity: effective ? 1 : 0.6 }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em" }}>{c.code}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: "var(--radius-full)", background: c.type === "percent" ? "var(--brand-50)" : "var(--accent-light)", color: c.type === "percent" ? "var(--brand-500)" : "var(--accent)", fontWeight: 600 }}>
                          {c.type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 15 }}>
                        {c.type === "percent" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                        {c.minCartValue > 0 ? `$${c.minCartValue}` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13 }}>
                        <span style={{ color: maxed ? "var(--error)" : "var(--text-secondary)" }}>
                          {c.usedCount}/{c.maxUses ?? "∞"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: expired ? "var(--error)" : "var(--text-secondary)" }}>
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Never"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px",
                          borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700,
                          background: effective ? "var(--success-light)" : "var(--gray-100)",
                          color: effective ? "var(--success)" : "var(--gray-500)",
                        }}>
                          {effective ? "Active" : expired ? "Expired" : maxed ? "Maxed" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(c)} style={{ background: "none", border: "1px solid var(--border-strong)", padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12 }}>
                            Edit
                          </button>
                          <button onClick={() => handleToggle(c)} style={{ background: "none", border: "1px solid var(--border-strong)", padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, color: c.isActive ? "var(--warning)" : "var(--success)" }}>
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDelete(c._id)} style={{ background: "none", border: "1px solid var(--error)", padding: "5px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, color: "var(--error)" }}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
        {!loading && coupons.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            No coupons yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
