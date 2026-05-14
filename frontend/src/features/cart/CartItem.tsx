import { useState } from "react";
import { updateCartItem, removeFromCart } from "../../api/cart.api";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { CartItemType } from "./CartPage";

type Props = { item: CartItemType; onChange: () => void };

const CartItem = ({ item, onChange }: Props) => {
  const axiosPrivate = useAxiosPrivate();
  const [busy, setBusy] = useState(false);

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); await onChange(); }
    finally { setBusy(false); }
  };

  const increaseQty = () => withBusy(() =>
    updateCartItem(axiosPrivate, { productId: item.productId._id, qty: item.qty + 1 })
  );
  const decreaseQty = () => {
    if (item.qty <= 1) return;
    withBusy(() => updateCartItem(axiosPrivate, { productId: item.productId._id, qty: item.qty - 1 }));
  };
  const handleRemove = () => withBusy(() => removeFromCart(axiosPrivate, item.productId._id));

  const lineTotal = (item.qty * item.productId.price).toFixed(2);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "80px 1fr auto auto",
      gap: "20px",
      alignItems: "center",
      padding: "20px 0",
      borderBottom: "1px solid var(--border)",
      opacity: busy ? 0.6 : 1,
      transition: "opacity var(--transition-base)",
    }}>
      {/* Image */}
      <div style={{
        width: "80px", height: "80px",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--gray-100)",
        flexShrink: 0,
      }}>
        {item.productId.images?.[0] ? (
          <img
            src={item.productId.images[0]}
            alt={item.productId.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
        )}
      </div>

      {/* Info */}
      <div>
        <h4 style={{ marginBottom: "4px", fontSize: "15px" }}>{item.productId.name}</h4>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          ${item.productId.price.toFixed(2)} each
        </p>
      </div>

      {/* Qty Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        border: "1.5px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--surface)",
      }}>
        <button
          onClick={decreaseQty}
          disabled={item.qty <= 1 || busy}
          style={{
            width: "36px", height: "36px",
            border: "none", background: "none", boxShadow: "none",
            borderRight: "1.5px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: "18px", fontWeight: 400,
            borderRadius: 0,
          }}>−</button>
        <span style={{
          width: "40px", textAlign: "center",
          fontSize: "14px", fontWeight: 600,
          color: "var(--text-primary)",
        }}>{item.qty}</span>
        <button
          onClick={increaseQty}
          disabled={busy}
          style={{
            width: "36px", height: "36px",
            border: "none", background: "none", boxShadow: "none",
            borderLeft: "1.5px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: "18px", fontWeight: 400,
            borderRadius: 0,
          }}>+</button>
      </div>

      {/* Line total + remove */}
      <div style={{ textAlign: "right", minWidth: "90px" }}>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--brand-800)",
          marginBottom: "6px",
        }}>${lineTotal}</p>
        <button
          onClick={handleRemove}
          disabled={busy}
          className="btn-ghost btn-sm"
          style={{ color: "var(--error)", fontSize: "12px", padding: "4px 8px" }}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
