import { useState } from "react";
import { createProduct, updateProduct } from "../../api/product.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type Props = {
  product?: any;
  onSuccess: () => void;
};

const ProductForm = ({ product, onSuccess }: Props) => {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [description, setDescription] = useState(product?.description || "");
  const [stock, setStock] = useState(product?.stock || "");
  const [images, setImages] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images && images.length > 5) {
      setError("You can upload up to 5 images only");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("description", description);
    formData.append("stock", stock.toString());

    if (images) {
      Array.from(images).forEach((img) => {
        formData.append("images", img);
      });
    }

    try {
      setLoading(true);
      product
        ? await updateProduct(product._id, formData)
        : await createProduct(formData);
      onSuccess();
    } catch {
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <form onSubmit={handleSubmit}>
      <h3>{product ? "Edit Product" : "Add Product"}</h3>

      <ErrorBox message={error} />

      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(e.target.files)}
      />

      <button type="submit">
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;
