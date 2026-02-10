import { useState } from "react";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

const AdminProducts = () => {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <main>
      <h2>Manage Products</h2>

      {!showForm && (
        <>
          <button onClick={handleAdd}>➕ Add Product</button>

          <ProductTable onEdit={handleEdit} />
        </>
      )}

      {showForm && (
        <>
          <button onClick={() => setShowForm(false)}>⬅ Back</button>

          <ProductForm
            product={editingProduct}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </main>
  );
};

export default AdminProducts;
