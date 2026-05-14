import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { addToCart } from "../../api/cart.api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import { Skeleton } from "../../components/common/Skeleton";

type Review = { _id: string; username: string; rating: number; comment: string; createdAt: string };
type Product = {
  _id: string; name: string; price: number; description: string;
  images: string[]; stock: number; category: string; tags: string[];
  ratingAvg: number; ratingCount: number; reviews: Review[];
};

const Stars = ({ rating, size = 16, interactive = false, onRate }: {
  rating: number; size?: number; interactive?: boolean; onRate?: (n: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
          style={{
            fontSize: size, cursor: interactive ? "pointer" : "default",
            color: s <= (hover || Math.round(rating)) ? "#f59e0b" : "var(--gray-300)",
            transition: "color var(--transition-fast)",
          }}>★</span>
      ))}
    </span>
  );
};

const ProductDetail = () => {
  const { id }          = useParams<{ id: string }>();
  const navigate        = useNavigate();
  const { auth }        = useAuth();
  const { refreshCart } = useCart();
  const axiosAuth       = useAxiosPrivate();
  const { toast }       = useToast();

  const [product,   setProduct]   = useState<Product | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [adding,    setAdding]    = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const [rating,           setRating]           = useState(0);
  const [comment,          setComment]          = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosPublic.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        toast("Product not found", "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!auth?.accessToken) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(axiosAuth, { productId: product!._id, qty: 1 });
      await refreshCart();
      toast(`"${product!.name}" added to cart`, "success");
    } catch { toast("Failed to add to cart", "error"); }
    finally { setAdding(false); }
  };

  const handleToggleWishlist = async () => {
    if (!auth?.accessToken) { navigate("/login"); return; }
    try {
      await axiosAuth.post(`/users/me/wishlist/${product!._id}`);
      setInWishlist((v) => !v);
      toast(inWishlist ? "Removed from wishlist" : "Saved to wishlist", "success");
    } catch { toast("Failed to update wishlist", "error"); }
  };

  const handleSubmitReview = async () => {
    if (!auth?.accessToken) { navigate("/login"); return; }
    if (!rating) { toast("Please select a star rating", "warning"); return; }
    setSubmittingReview(true);
    try {
      const res = await axiosAuth.post(`/products/${product!._id}/reviews`, { rating, comment });
      setProduct((prev) => prev ? {
        ...prev,
        ratingAvg: res.data.ratingAvg,
        ratingCount: res.data.ratingCount,
        reviews: [...prev.reviews, res.data.review],
      } : prev);
      setRating(0); setComment("");
      toast("Review submitted!", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to submit review", "error");
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      <Skeleton height="460px" radius="var(--radius-xl)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton height="32px" width="70%" />
        <Skeleton height="20px" width="45%" />
        <Skeleton height="56px" />
        <Skeleton height="48px" width="180px" radius="var(--radius-md)" />
      </div>
    </div>
  );

  if (!product) return null;

  const outOfStock = product.stock === 0;

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-500)", fontSize: 13, padding: 0, fontFamily: "var(--font-body)" }}>
          Products
        </button>
        <span>›</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{product.name}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64 }}>
        {/* ── Images ── */}
        <div>
          <div style={{
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            background: "var(--gray-100)", aspectRatio: "4/3", position: "relative",
            marginBottom: 12,
          }}>
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 72, color: "var(--gray-300)" }}>📦</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{
                    width: 68, height: 68, borderRadius: "var(--radius-md)",
                    overflow: "hidden", padding: 0, cursor: "pointer",
                    border: `2.5px solid ${i === activeImg ? "var(--brand-500)" : "var(--border)"}`,
                    background: "var(--gray-100)", transition: "border-color var(--transition-fast)",
                  }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {product.category && (
            <span style={{
              display: "inline-block", width: "fit-content",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--brand-500)",
              background: "var(--brand-50)", padding: "3px 10px",
              borderRadius: "var(--radius-full)",
            }}>{product.category}</span>
          )}

          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", margin: 0, lineHeight: 1.2 }}>{product.name}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Stars rating={product.ratingAvg} />
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {product.ratingAvg > 0
                ? `${product.ratingAvg.toFixed(1)} (${product.ratingCount} review${product.ratingCount !== 1 ? "s" : ""})`
                : "No reviews yet"}
            </span>
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, color: "var(--brand-800)", lineHeight: 1 }}>
            ${product.price.toFixed(2)}
          </div>

          {product.description && (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", margin: 0 }}>
              {product.description}
            </p>
          )}

          {/* Stock indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: outOfStock ? "var(--error)" : product.stock <= 5 ? "var(--warning)" : "var(--success)",
            }} />
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: outOfStock ? "var(--error)" : product.stock <= 5 ? "var(--warning)" : "var(--success)",
            }}>
              {outOfStock ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
            </span>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className="btn-brand"
              style={{ flex: 1, padding: "13px 20px", fontSize: 15, opacity: outOfStock ? 0.5 : 1 }}
            >
              {adding ? "Adding…" : outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleToggleWishlist}
              title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
              style={{
                padding: "13px 16px", fontSize: 20, lineHeight: 1,
                background: inWishlist ? "#fef2f2" : "var(--surface)",
                border: `1.5px solid ${inWishlist ? "#fca5a5" : "var(--border-strong)"}`,
                borderRadius: "var(--radius-md)", cursor: "pointer",
                transition: "all var(--transition-base)",
              }}
            >
              {inWishlist ? "❤️" : "🤍"}
            </button>
          </div>

          {product.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 12, padding: "3px 10px", background: "var(--gray-100)",
                  borderRadius: "var(--radius-full)", color: "var(--text-secondary)",
                }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews ── */}
      <div>
        <h2 style={{ marginBottom: 24 }}>
          Reviews
          {product.ratingCount > 0 && (
            <span style={{ fontSize: 16, fontFamily: "var(--font-body)", fontWeight: 400, color: "var(--text-muted)", marginLeft: 12 }}>
              {product.ratingAvg.toFixed(1)} / 5 · {product.ratingCount} review{product.ratingCount !== 1 ? "s" : ""}
            </span>
          )}
        </h2>

        {auth?.accessToken && (
          <div className="card" style={{ padding: "24px", marginBottom: 28 }}>
            <h4 style={{ marginBottom: 14 }}>Leave a Review</h4>
            <Stars rating={rating} size={32} interactive onRate={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this product?"
              rows={3}
              style={{
                width: "100%", marginTop: 14, padding: "10px 14px",
                border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)", fontSize: 14, resize: "vertical", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "var(--brand-400)"}
              onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
            />
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview || !rating}
              className="btn-brand"
              style={{ marginTop: 14, opacity: !rating ? 0.5 : 1 }}
            >
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        )}

        {product.reviews.length === 0 ? (
          <div style={{
            padding: "48px 24px", textAlign: "center",
            background: "var(--gray-50)", borderRadius: "var(--radius-xl)",
            color: "var(--text-muted)", fontSize: 14,
          }}>
            No reviews yet. {auth?.accessToken ? "Be the first to write one above!" : "Log in to leave a review."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {product.reviews.map((r) => (
              <div key={r._id} className="card" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.username}</span>
                    <div style={{ marginTop: 4 }}><Stars rating={r.rating} size={13} /></div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.65 }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
