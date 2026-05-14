import { useEffect, useState } from "react";
import { getCart, clearCart } from "../../api/cart.api";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";

export type CartProduct  = { _id: string; name: string; price: number; images: string[] };
export type CartItemType = { productId: CartProduct; qty: number };

const CartPage = () => {
  const [items,    setItems]    = useState<CartItemType[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const axiosPrivate = useAxiosPrivate();
  const navigate     = useNavigate();
  const { refreshCart } = useCart();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart(axiosPrivate);
      setItems(data.items || []);
    } catch {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    await clearCart(axiosPrivate);
    setItems([]);
    await refreshCart();
  };

  useEffect(() => { fetchCart(); }, []);

  if (loading) return <Loader />;
  if (!items.length) return <EmptyCart />;

  const totalPrice = items.reduce((sum, item) => sum + item.qty * item.productId.price, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const tax        = Math.round(totalPrice * 0.08 * 100) / 100;
  const shipping   = totalPrice >= 75 ? 0 : 5.99;
  const orderTotal = totalPrice + tax + shipping;

  return (
    <main>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "4px" }}>Your Cart</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
      </div>

      <ErrorBox message={error} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px", alignItems: "start" }}>
        {/* Items list */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card)", padding: "8px 28px 20px",
        }}>
          {items.map((item) => (
            <CartItem key={item.productId._id} item={item} onChange={fetchCart} />
          ))}
          <div style={{ paddingTop: "16px" }}>
            <button onClick={handleClearCart} className="btn-ghost btn-sm"
              style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              🗑 Clear cart
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card)", padding: "24px",
          position: "sticky", top: "calc(var(--navbar-height) + 20px)",
        }}>
          <h3 style={{ marginBottom: "20px", fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>Order Summary</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {items.map(item => (
              <div key={item.productId._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.productId.name} <span style={{ color: "var(--text-muted)" }}>×{item.qty}</span>
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>${(item.qty * item.productId.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Subtotal", value: `$${totalPrice.toFixed(2)}` },
              { label: "Tax (8%)", value: `$${tax.toFixed(2)}` },
              { label: shipping === 0 ? "Shipping (free!)" : "Shipping ($75+ for free)", value: shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`, accent: shipping === 0 ? "var(--success)" : undefined },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                <span style={{ fontWeight: 500, color: row.accent || "var(--text-primary)" }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1.5px solid var(--border)" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--brand-800)" }}>
                ${orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            className="btn-primary btn-lg"
            onClick={() => navigate("/checkout")}
            style={{ width: "100%", borderRadius: "var(--radius-md)", justifyContent: "center" }}
          >
            Proceed to Checkout →
          </button>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "12px" }}>
            🔒 Pay securely via Stripe or Razorpay
          </p>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
