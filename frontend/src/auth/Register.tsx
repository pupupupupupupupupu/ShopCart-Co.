import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth.api";

const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const pwdMatch = pwd && confirmPwd && pwd === confirmPwd;
  const pwdMismatch = pwd && confirmPwd && pwd !== confirmPwd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pwd !== confirmPwd) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register({ user, pwd });
      navigate("/login");
    } catch {
      setError("Username already taken. Try another.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - var(--navbar-height))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      background: "linear-gradient(135deg, var(--brand-50) 0%, var(--gray-50) 60%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
      }}>
        <div style={{
          background: "var(--brand-900)",
          padding: "32px 32px 28px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✨</div>
          <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Create account</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Join ShopCart Co. today</p>
        </div>

        <div style={{ padding: "32px" }}>
          {error && (
            <div style={{
              background: "var(--error-light)", color: "var(--error)",
              borderRadius: "var(--radius-md)", padding: "12px 16px",
              fontSize: "14px", fontWeight: 500, marginBottom: "24px",
              display: "flex", gap: "8px", alignItems: "center",
              border: "1px solid #fca5a5",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", boxShadow: "none",
                    color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", padding: "2px",
                  }}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password
                {pwdMatch && <span style={{ color: "var(--success)", marginLeft: "8px", fontSize: "13px" }}>✓ Match</span>}
                {pwdMismatch && <span style={{ color: "var(--error)", marginLeft: "8px", fontSize: "13px" }}>✗ Mismatch</span>}
              </label>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                autoComplete="new-password"
                style={{
                  borderColor: pwdMismatch ? "var(--error)" : pwdMatch ? "var(--success)" : undefined,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={loading || !!pwdMismatch}
              style={{ width: "100%", justifyContent: "center", marginTop: "8px", borderRadius: "var(--radius-md)" }}>
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                  Creating account…
                </>
              ) : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 600, color: "var(--brand-500)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
