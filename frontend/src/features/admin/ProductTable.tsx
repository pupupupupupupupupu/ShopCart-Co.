import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../api/product.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type Props = { onEdit: (product: any) => void };

const ProductTable = ({ onEdit }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data.products);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      await fetchProducts();
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <ErrorBox message={error} />

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
          <p>No products yet. Add your first one.</p>
        </div>
      ) : (
        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "60px" }}></th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ opacity: deletingId === p._id ? 0.5 : 1, transition: "opacity var(--transition-base)" }}>
                  <td>
                    <div style={{
                      width: "44px", height: "44px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      background: "var(--gray-100)",
                      flexShrink: 0,
                    }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📦</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{p.name}</p>
                    {p.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "240px" }}>{p.description}</p>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--brand-800)", fontFamily: "var(--font-display)" }}>
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.stock > 10 ? "badge-success" : p.stock > 0 ? "badge-warning" : "badge-error"}`}>
                      {p.stock ?? "—"} {p.stock !== undefined ? "in stock" : ""}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onEdit(p)}
                        className="btn-sm"
                        style={{ fontSize: "12px" }}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="btn-danger btn-sm">
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ProductTable;
