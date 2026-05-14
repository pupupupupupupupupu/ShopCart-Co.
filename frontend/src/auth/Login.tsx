import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.api";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

type DecodedToken = { UserInfo: { username: string; roles: number[] } };

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ user, pwd });
      const decoded = jwtDecode<DecodedToken>(data.accessToken);
      setAuth({ user: decoded.UserInfo.username, roles: decoded.UserInfo.roles, accessToken: data.accessToken });
      navigate("/", { replace: true });
    } catch {
      setError("Invalid username or password");
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
        {/* Header band */}
        <div style={{
          background: "var(--brand-900)",
          padding: "32px 32px 28px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛍</div>
          <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", marginBottom: "4px" }}>Welcome back</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Sign in to your ShopCart account</p>
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  autoComplete="current-password"
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
                  }}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "4px" }}>
              <Link to="/forgot-password" style={{ fontSize: "13px", color: "var(--brand-500)", fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "8px", borderRadius: "var(--radius-md)" }}>
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 600, color: "var(--brand-500)" }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
