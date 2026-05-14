import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosPublic } from "../api/axios";

const ForgotPassword = () => {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosPublic.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔑</div>
          <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", marginBottom: "4px" }}>
            Forgot password?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            We'll send a reset link to your email
          </p>
        </div>

        <div style={{ padding: "32px" }}>
          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
              <h3 style={{ marginBottom: "10px", color: "var(--text-primary)" }}>Check your inbox</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
                If <strong>{email}</strong> is registered, you'll receive a password reset link within a few minutes.
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login">
                <button className="btn-brand" style={{ width: "100%" }}>Back to Login</button>
              </Link>
            </div>
          ) : (
            /* ── Form ── */
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
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                    Enter the email address linked to your account.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: "100%", justifyContent: "center", marginTop: "8px", borderRadius: "var(--radius-md)" }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: "16px", height: "16px",
                        border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                        borderRadius: "50%", display: "inline-block",
                        animation: "spin 0.6s linear infinite",
                      }} />
                      Sending…
                    </>
                  ) : "Send Reset Link"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
                Remember it?{" "}
                <Link to="/login" style={{ fontWeight: 600, color: "var(--brand-500)" }}>Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
