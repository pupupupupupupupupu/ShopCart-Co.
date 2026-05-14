import { useState } from "react";
import { createProduct, updateProduct, type Product } from "../../api/product.api";
import ErrorBox from "../../components/common/ErrorBox";

type Props = { product?: Product; onSuccess: () => void };

const CATEGORIES = ["Electronics", "Clothing", "Home", "Books", "Sports", "Beauty", "Toys", "Food", "Other"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-body)", fontSize: "14px",
  outline: "none", background: "var(--surface)",
  transition: "border-color var(--transition-fast)",
};

const ProductForm = ({ product, onSuccess }: Props) => {
  const [name,        setName]        = useState(product?.name        || "");
  const [price,       setPrice]       = useState(product?.price       || "");
  const [description, setDescription] = useState(product?.description || "");
  const [stock,       setStock]       = useState(product?.stock       ?? "");
  const [category,    setCategory]    = useState(product?.category    || "");
  const [tags,        setTags]        = useState(product?.tags?.join(", ") || "");
  const [images,      setImages]      = useState<FileList | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images && images.length > 5) {
      setError("You can upload up to 5 images only"); return;
    }

    const formData = new FormData();
    formData.append("name",        name);
    formData.append("price",       price.toString());
    formData.append("description", description);
    formData.append("stock",       stock.toString());
    formData.append("category",    category);
    formData.append("tags",        tags);

    if (images) {
      Array.from(images).forEach((img) => formData.append("images", img));
    }

    try {
      setLoading(true);
      product
        ? await updateProduct(product._id, formData)
        : await createProduct(formData);
      onSuccess();
    } catch {
      setError("Failed to save product. Check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--brand-400)");
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--border-strong)");

  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)", overflow: "hidden", maxWidth: "640px",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--gray-50)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
          {product ? "Update the product details below" : "Fill in the details for your new product"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "0" }}>
        <ErrorBox message={error} />

        {/* Name */}
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wireless Headphones Pro"
            required style={inputStyle} onFocus={focus} onBlur={blur}
          />
        </div>

        {/* Price + Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input
              type="number" step="0.01" min="0" placeholder="0.00"
              value={price} onChange={(e) => setPrice(e.target.value)}
              required style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input
              type="number" min="0" placeholder="0"
              value={stock} onChange={(e) => setStock(e.target.value)}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>
        </div>

        {/* Category + Tags */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={category} onChange={(e) => setCategory(e.target.value)}
              style={inputStyle} onFocus={focus} onBlur={blur}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Tags
              <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>
                (comma-separated)
              </span>
            </label>
            <input
              value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="wireless, premium, sale"
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            placeholder="Describe the product…"
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
            onFocus={focus} onBlur={blur}
          />
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">
            Images
            <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>
              (up to 5, max 5MB each)
            </span>
          </label>
          <input
            type="file" multiple accept="image/*"
            onChange={(e) => setImages(e.target.files)}
            style={{ padding: "8px 12px", cursor: "pointer", width: "100%",
              border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-md)" }}
          />
          {product?.images && product.images.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Current images — uploading new ones will replace these:
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt=""
                    style={{ width: "60px", height: "60px", objectFit: "cover",
                      borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button type="submit" className="btn-brand" disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {loading ? (
              <>
                <span style={{ width: "14px", height: "14px",
                  border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                  borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.6s linear infinite" }} />
                Saving…
              </>
            ) : (product ? "Update Product" : "Create Product")}
          </button>
          <button type="button" className="btn-outline" onClick={onSuccess}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
