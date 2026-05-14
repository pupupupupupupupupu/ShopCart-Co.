import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "../../components/common/Skeleton";

type Address = { _id: string; label: string; street: string; city: string; state: string; zip: string; country: string; isDefault: boolean };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-body)", fontSize: "14px",
  outline: "none", background: "var(--surface)",
  transition: "border-color var(--transition-fast)",
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 14 }}>
    {children}
  </p>
);

const Profile = () => {
  const axiosAuth = useAxiosPrivate();
  const { toast }  = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: "", fullName: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", street: "", city: "", state: "", zip: "", country: "US", isDefault: false });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosAuth.get("/users/me");
        setProfile({ username: res.data.username, fullName: res.data.fullName || "", email: res.data.email || "" });
        setAddresses(res.data.addresses || []);
      } catch { toast("Failed to load profile", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await axiosAuth.put("/users/me", { fullName: profile.fullName, email: profile.email });
      toast("Profile updated!", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to save", "error");
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) { toast("Passwords don't match", "error"); return; }
    if (passwords.newPassword.length < 8) { toast("Password must be at least 8 characters", "error"); return; }
    setSavingPassword(true);
    try {
      await axiosAuth.put("/users/me", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed!", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setSavingPassword(false); }
  };

  const handleAddAddress = async () => {
    if (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zip) {
      toast("Please fill all required fields", "warning"); return;
    }
    setSavingAddr(true);
    try {
      const res = await axiosAuth.post("/users/me/addresses", newAddr);
      setAddresses(res.data);
      setShowAddForm(false);
      setNewAddr({ label: "Home", street: "", city: "", state: "", zip: "", country: "US", isDefault: false });
      toast("Address added!", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to add address", "error");
    } finally { setSavingAddr(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await axiosAuth.delete(`/users/me/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast("Address removed", "info");
    } catch { toast("Failed to remove address", "error"); }
  };

  if (loading) return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
      <Skeleton height="200px" radius="var(--radius-xl)" />
      <Skeleton height="180px" radius="var(--radius-xl)" />
      <Skeleton height="220px" radius="var(--radius-xl)" />
    </div>
  );

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ marginBottom: 6 }}>My Profile</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>@{profile.username}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Account info ── */}
        <div className="card" style={{ padding: 24 }}>
          <SectionLabel>Account Details</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label>
              <input
                value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Your name"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "var(--brand-400)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-strong)"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "var(--brand-400)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-strong)"}
              />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-brand" style={{ fontSize: 13 }}>
            {savingProfile ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* ── Change password ── */}
        <div className="card" style={{ padding: 24 }}>
          <SectionLabel>Change Password</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {["currentPassword", "newPassword", "confirm"].map((field) => (
              <input
                key={field}
                type="password"
                value={(passwords as any)[field]}
                onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password (min 8 chars)" : "Confirm new password"}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "var(--brand-400)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-strong)"}
              />
            ))}
          </div>
          <button onClick={handleChangePassword} disabled={savingPassword} className="btn-brand" style={{ fontSize: 13 }}>
            {savingPassword ? "Changing…" : "Update Password"}
          </button>
        </div>

        {/* ── Addresses ── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionLabel>Saved Addresses</SectionLabel>
            <button onClick={() => setShowAddForm((v) => !v)} className="btn-outline" style={{ fontSize: 12, padding: "5px 12px" }}>
              {showAddForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input value={newAddr.label} onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))}
                  placeholder="Label (Home, Work…)" style={inputStyle} />
                <input value={newAddr.street} onChange={(e) => setNewAddr((a) => ({ ...a, street: e.target.value }))}
                  placeholder="Street address *" style={inputStyle} />
                <input value={newAddr.city} onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
                  placeholder="City *" style={inputStyle} />
                <input value={newAddr.state} onChange={(e) => setNewAddr((a) => ({ ...a, state: e.target.value }))}
                  placeholder="State *" style={inputStyle} />
                <input value={newAddr.zip} onChange={(e) => setNewAddr((a) => ({ ...a, zip: e.target.value }))}
                  placeholder="ZIP / Postal code *" style={inputStyle} />
                <input value={newAddr.country} onChange={(e) => setNewAddr((a) => ({ ...a, country: e.target.value }))}
                  placeholder="Country" style={inputStyle} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
                <input type="checkbox" checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr((a) => ({ ...a, isDefault: e.target.checked }))} />
                Set as default address
              </label>
              <button onClick={handleAddAddress} disabled={savingAddr} className="btn-brand" style={{ fontSize: 13 }}>
                {savingAddr ? "Saving…" : "Save Address"}
              </button>
            </div>
          )}

          {addresses.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              No addresses saved yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {addresses.map((a) => (
                <div key={a._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: "var(--radius-lg)",
                  border: `1.5px solid ${a.isDefault ? "var(--brand-400)" : "var(--border)"}`,
                  background: a.isDefault ? "var(--brand-50)" : "var(--surface)",
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      {a.label}
                      {a.isDefault && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brand-500)", background: "var(--brand-100)", padding: "2px 7px", borderRadius: "var(--radius-full)" }}>Default</span>}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.street}, {a.city}, {a.state} {a.zip}, {a.country}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(a._id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: 18, padding: "0 4px", lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
