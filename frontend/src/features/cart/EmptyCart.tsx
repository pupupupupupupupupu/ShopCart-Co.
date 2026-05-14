import { Link } from "react-router-dom";

const EmptyCart = () => (
  <main>
    <div style={{
      textAlign: "center",
      padding: "80px 24px",
      background: "var(--surface)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)",
      maxWidth: "420px",
      margin: "0 auto",
    }}>
      <div style={{ fontSize: "56px", marginBottom: "20px" }}>🛒</div>
      <h2 style={{ marginBottom: "10px" }}>Your cart is empty</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "15px" }}>
        Looks like you haven't added anything yet.
      </p>
      <Link to="/">
        <button className="btn-brand btn-lg">
          Browse Products
        </button>
      </Link>
    </div>
  </main>
);

export default EmptyCart;
