const Footer = () => (
  <footer style={{
    marginTop: "auto",
    background: "var(--brand-900)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  }}>
    <div style={{
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "40px 24px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "32px",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "30px", height: "30px",
            background: "var(--accent)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
          }}>🛍</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#fff", fontWeight: 700 }}>ShopCart Co.</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: 1.7, maxWidth: "220px" }}>
          Quality products, seamless shopping experience.
        </p>
      </div>

      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>Shop</p>
        {["All Products", "New Arrivals", "Featured"].map(l => (
          <p key={l} style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", cursor: "pointer" }}>{l}</p>
        ))}
      </div>

      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>Account</p>
        {["My Orders", "Cart", "Settings"].map(l => (
          <p key={l} style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px", cursor: "pointer" }}>{l}</p>
        ))}
      </div>
    </div>

    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "16px 24px",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
        © {new Date().getFullYear()} ShopCart Co. All rights reserved.
      </p>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>Made with ❤️</p>
    </div>
  </footer>
);

export default Footer;
