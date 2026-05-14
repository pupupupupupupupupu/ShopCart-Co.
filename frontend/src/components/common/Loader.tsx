const Loader = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    gap: "16px",
  }}>
    <div className="spinner" />
    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</p>
  </div>
);

export default Loader;
