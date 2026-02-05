import { Link } from "react-router-dom";

const EmptyCart = () => {
  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven’t added anything yet.</p>

      <Link to="/">
        <button style={{ marginTop: "1rem" }}>Browse Products</button>
      </Link>
    </main>
  );
};

export default EmptyCart;
