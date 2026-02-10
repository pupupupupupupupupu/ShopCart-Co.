import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../api/product.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type Props = {
  onEdit: (product: any) => void;
};

const ProductTable = ({ onEdit }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    await deleteProduct(id);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <h3>Products</h3>
      <ErrorBox message={error} />

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => onEdit(p)}>Edit</button>{" "}
                <button onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default ProductTable;
