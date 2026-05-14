import { useState } from "react";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

const AdminProducts = () => {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => { setEditingProduct(null); setShowForm(true); };
  const handleEdit = (product: any) => { setEditingProduct(product); setShowForm(true); };
  const handleSuccess = () => { setShowForm(false); setEditingProduct(null); };

  return (
    <main>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "6px" }}>Admin Panel</p>
          <h1 style={{ marginBottom: "4px" }}>Products</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage your product catalog</p>
        </div>
        {!showForm && (
          <button className="btn-brand" onClick={handleAdd}>
            ➕ Add Product
          </button>
        )}
        {showForm && (
          <button className="btn-ghost" onClick={() => setShowForm(false)}>
            ← Back to list
          </button>
        )}
      </div>

      {!showForm && <ProductTable onEdit={handleEdit} />}
      {showForm && <ProductForm product={editingProduct} onSuccess={handleSuccess} />}
    </main>
  );
};

export default AdminProducts;
