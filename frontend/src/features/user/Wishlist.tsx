import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useCart from "../../hooks/useCart";
import { addToCart } from "../../api/cart.api";
import { useToast } from "../../context/ToastContext";
import { SkeletonCard } from "../../components/common/Skeleton";

type WishlistProduct = {
  _id: string; name: string; price: number;
  images: string[]; ratingAvg: number; stock: number;
};

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: "inline-flex", gap: "1px" }}>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ fontSize: 12, color: s <= Math.round(rating) ? "#f59e0b" : "var(--gray-300)" }}>★</span>
    ))}
  </span>
);

const Wishlist = () => {
  const axiosAuth       = useAxiosPrivate();
  const navigate        = useNavigate();
  const { refreshCart } = useCart();
  const { toast }       = useToast();

  const [items,    setItems]    = useState<WishlistProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [adding,   setAdding]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosAuth.get("/users/me/wishlist");
        setItems(res.data);
      } catch { toast("Failed to load wishlist", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try {
      await axiosAuth.post(`/users/me/wishlist/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
      toast("Removed from wishlist", "info");
    } catch { toast("Failed to remove", "error"); }
    finally { setRemoving(null); }
  };

  const handleAddToCart = async (item: WishlistProduct) => {
    setAdding(item._id);
    try {
      await addToCart(axiosAuth, { productId: item._id, qty: 1 });
      await refreshCart();
      toast(`"${item.name}" added to cart`, "success");
    } catch { toast("Failed to add to cart", "error"); }
    finally { setAdding(null); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 6 }}>My Wishlist</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {items.length} saved item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
          <h3 style={{ marginBottom: 10 }}>Your wishlist is empty</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 14 }}>
            Browse products and click the heart to save them here.
          </p>
          <button className="btn-brand" onClick={() => navigate("/")}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {items.map((item) => (
            <div key={item._id} className="card card-hover" style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{ position: "relative", paddingTop: "68%", background: "var(--gray-100)", overflow: "hidden", cursor: "pointer" }}
                onClick={() => navigate(`/products/${item._id}`)}
              >
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 40, color: "var(--gray-400)" }}>📦</div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(item._id); }}
                  disabled={removing === item._id}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)", border: "none",
                    cursor: "pointer", fontSize: 16, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >{removing === item._id ? "…" : "❤️"}</button>
              </div>

              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {item.ratingAvg > 0 && <Stars rating={item.ratingAvg} />}

                <h4 style={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
                  color: "var(--text-primary)", lineHeight: 1.4, cursor: "pointer",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}
                  onClick={() => navigate(`/products/${item._id}`)}
                >{item.name}</h4>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-800)" }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={adding === item._id || item.stock === 0}
                    style={{
                      background: item.stock === 0 ? "var(--gray-300)" : "var(--brand-800)",
                      color: "#fff", border: "none", borderRadius: "var(--radius-md)",
                      padding: "8px 14px", fontSize: 13, fontWeight: 600,
                      cursor: item.stock === 0 ? "default" : "pointer",
                      transition: "all var(--transition-base)",
                    }}
                  >
                    {adding === item._id ? "…" : item.stock === 0 ? "N/A" : "+ Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
