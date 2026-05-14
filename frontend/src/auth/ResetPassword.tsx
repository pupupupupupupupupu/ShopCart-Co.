import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosPublic } from "../api/axios";

const ResetPassword = () => {
  const { token }   = useParams<{ token: string }>();
  const navigate    = useNavigate();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters"); return;
    }
    if (password !== confirm) {
      setError("Passwords don't match"); return;
    }

    setLoading(true);
    try {
      await axiosPublic.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  /* Password strength indicator */
  const strength = (() => {
    if (!password) return { level: 0, label: "", color: "var(--gray-200)" };
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: score, label: "Weak",   color: "var(--error)" };
    if (score <= 3) return { level: score, label: "Fair",   color: "var(--warning)" };
    return            { level: score, label: "Strong", color: "var(--success)" };
  })();

  return (
    <div style={{
      minHeight: "calc(100vh - var(--navbar-height))",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
      background: "linear-gradient(135deg, var(--brand-50) 0%, var(--gray-50) 60%)",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "var(--surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "var(--brand-900)", padding: "32px 32px 28px", textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
          <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
            Choose a new password
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            Must be at least 8 characters
          </p>
        </div>

        <div style={{ padding: "32px" }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ marginBottom: "10px", color: "var(--success)" }}>Password reset!</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
                Your password has been updated. Redirecting you to login…
              </p>
              <Link to="/login">
                <button className="btn-brand" style={{ width: "100%" }}>Go to Login</button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  background: "var(--error-light)", color: "var(--error)",
                  borderRadius: "var(--radius-md)", padding: "12px 16px",
                  fontSize: "14px", fontWeight: 500, marginBottom: "20px",
                  display: "flex", gap: "8px", alignItems: "center",
                  border: "1px solid #fca5a5",
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {/* New password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                        color: "var(--text-muted)", cursor: "pointer",
                        padding: "2px", fontSize: "16px",
                      }}
                    >{showPwd ? "🙈" : "👁"}</button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} style={{
                            flex: 1, height: "3px", borderRadius: "2px",
                            background: i <= strength.level ? strength.color : "var(--gray-200)",
                            transition: "background var(--transition-fast)",
                          }} />
                        ))}
                      </div>
                      <p style={{ fontSize: "11px", color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      borderColor: confirm && confirm !== password ? "var(--error)" : undefined,
                    }}
                  />
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "5px" }}>
                      Passwords don't match
                    </p>
                  )}
                  {confirm && confirm === password && (
                    <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "5px" }}>
                      ✓ Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lg"
                  disabled={loading || password !== confirm}
                  style={{
                    width: "100%", justifyContent: "center",
                    marginTop: "8px", borderRadius: "var(--radius-md)",
                    opacity: password !== confirm ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: "16px", height: "16px",
                        border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                        borderRadius: "50%", display: "inline-block",
                        animation: "spin 0.6s linear infinite",
                      }} />
                      Resetting…
                    </>
                  ) : "Reset Password"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
                Link expired?{" "}
                <Link to="/forgot-password" style={{ fontWeight: 600, color: "var(--brand-500)" }}>
                  Request a new one
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
