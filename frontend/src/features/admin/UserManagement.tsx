import { useEffect, useState } from "react";
import { getAllUsers, disableUser, enableUser } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (user: any) => {
    setTogglingId(user._id);
    try {
      user.active ? await disableUser(user._id) : await enableUser(user._id);
      await fetchUsers();
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <Loader />;

  return (
    <main>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "6px" }}>Admin Panel</p>
        <h1 style={{ marginBottom: "4px" }}>Users</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
      </div>

      <ErrorBox message={error} />

      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Roles</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ opacity: togglingId === u._id ? 0.5 : 1, transition: "opacity var(--transition-base)" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px",
                      borderRadius: "50%",
                      background: "var(--brand-100)",
                      color: "var(--brand-500)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "14px", flexShrink: 0,
                    }}>
                      {u.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{u.username}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.active ? "badge-success" : "badge-error"}`}>
                    {u.active ? "● Active" : "○ Disabled"}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {u.roles?.includes(5150) ? "Admin" : "Customer"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => toggleUser(u)}
                      disabled={togglingId === u._id}
                      className={u.active ? "btn-danger btn-sm" : "btn-sm"}
                      style={{ fontSize: "12px" }}>
                      {togglingId === u._id ? "…" : u.active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default UserManagement;
