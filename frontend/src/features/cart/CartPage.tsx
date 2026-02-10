import { useEffect, useState } from "react";
import { getCart, clearCart } from "../../api/cart.api";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";


export type CartProduct = {
  _id: string;
  name: string;
  price: number;
  images: string[];
};

export type CartItemType = {
  productId: CartProduct;
  qty: number;
};

const CartPage = () => {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const fetchCart = async () => {
    try {
      setLoading(true);
      // const data = await getCart();
      // setItems(data.items || []);
      const data = await getCart(axiosPrivate);
      setItems(data.items || []);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    await clearCart(axiosPrivate);
    setItems([]);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <Loader />;

  if (!items.length) {
    return <EmptyCart />;
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.qty * item.productId.price,
    0
  );

  const handleCheckout = async () => {
  try {
    await axiosPrivate.post("/orders");
    navigate("/orders");
    await clearCart(axiosPrivate);
    await refreshCart();
  } catch {
    setError("Checkout failed. Please try again.");
  }
};

  return (
    <main>
      <h2>Your Cart</h2>

      <ErrorBox message={error} />

      {items.map((item) => (
        <CartItem
          key={item.productId._id}
          item={item}
          onChange={fetchCart}
        />
      ))}

      <h3>Total: ${totalPrice.toFixed(2)}</h3>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleCheckout}>Place Order</button>
        <button onClick={handleClearCart} style={{ marginLeft: "1rem" }}>
          Clear Cart
        </button>
      </div>
    </main>
  );
};

export default CartPage;
