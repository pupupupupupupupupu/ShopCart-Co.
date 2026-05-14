import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{
    minHeight: "calc(100vh - var(--navbar-height))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  }}>
    <div style={{ textAlign: "center", maxWidth: "420px" }}>
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "7rem",
        fontWeight: 700,
        color: "var(--gray-200)",
        lineHeight: 1,
        marginBottom: "8px",
        userSelect: "none",
      }}>404</p>
      <h2 style={{ marginBottom: "12px" }}>Page not found</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <button className="btn-brand btn-lg">
          ← Back to Home
        </button>
      </Link>
    </div>
  </div>
);

export default NotFound;
