import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { addToCart } from "../../api/cart.api";
import { Product } from "./ProductList";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const handleAddToCart = async () => {
    if (!auth?.accessToken) {
      navigate("/login");
      return;
    }

    await addToCart({ productId: product._id, qty: 1 });
  };

  return (
    <article
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: "4px",
      }}
    >
      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ width: "100%", height: "150px", objectFit: "cover" }}
        />
      )}

      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>

      <button onClick={handleAddToCart}>Add to Cart</button>
    </article>
  );
};

export default ProductCard;
