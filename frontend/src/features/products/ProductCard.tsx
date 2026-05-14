import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { addToCart } from "../../api/cart.api";
import useCart from "../../hooks/useCart";
import { useToast } from "../../context/ToastContext";

export type Product = {
  _id: string; name: string; price: number;
  images: string[]; stock: number;
  ratingAvg?: number; ratingCount?: number; category?: string;
};

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: "inline-flex", gap: "1px" }}>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? "#f59e0b" : "var(--gray-300)" }}>★</span>
    ))}
  </span>
);

const ProductCard = ({ product }: { product: Product }) => {
  const navigate        = useNavigate();
  const { auth }        = useAuth();
  const axiosAuth       = useAxiosPrivate();
  const { refreshCart } = useCart();
  const { toast }       = useToast();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth?.accessToken) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(axiosAuth, { productId: product._id, qty: 1 });
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      toast(`"${product.name}" added to cart`, "success");
    } catch {
      toast("Failed to add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className="card card-hover fade-up"
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Image */}
      <div style={{ position: "relative", paddingTop: "68%", background: "var(--gray-100)", overflow: "hidden" }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 40, color: "var(--gray-400)" }}>📦</div>
        )}

        {outOfStock && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(220,38,38,0.88)", color: "#fff",
            fontSize: 10, fontWeight: 700, padding: "2px 8px",
            borderRadius: "var(--radius-full)", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Out of Stock</span>
        )}

        {product.category && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(22,34,49,0.72)", backdropFilter: "blur(4px)",
            color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 600,
            padding: "2px 8px", borderRadius: "var(--radius-full)",
          }}>{product.category}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {(product.ratingAvg ?? 0) > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Stars rating={product.ratingAvg!} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({product.ratingCount})</span>
          </div>
        )}

        <h4 style={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
          color: "var(--text-primary)", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{product.name}</h4>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-800)" }}>
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            style={{
              background: added ? "var(--success)" : outOfStock ? "var(--gray-300)" : "var(--brand-800)",
              color: "#fff", border: "none", borderRadius: "var(--radius-md)",
              padding: "8px 14px", fontSize: 13, fontWeight: 600,
              cursor: adding || outOfStock ? "not-allowed" : "pointer",
              transition: "all var(--transition-base)",
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}
          >
            {adding
              ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                  borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
              : <span>{added ? "✓" : outOfStock ? "—" : "+"}</span>
            }
            {added ? "Added!" : outOfStock ? "N/A" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
