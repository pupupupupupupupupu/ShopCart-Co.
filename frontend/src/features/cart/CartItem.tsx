import { updateCartItem, removeFromCart } from "../../api/cart.api";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { CartItemType } from "./CartPage";

type Props = {
  item: CartItemType;
  onChange: () => void;
};

const CartItem = ({ item, onChange }: Props) => {
  const axiosPrivate = useAxiosPrivate();
  const increaseQty = async () => {
    await updateCartItem(axiosPrivate, {
      productId: item.productId._id,
      qty: item.qty + 1,
    });
    onChange();
  };

  const decreaseQty = async () => {
    if (item.qty <= 1) return;

    await updateCartItem(axiosPrivate,{
      productId: item.productId._id,
      qty: item.qty - 1,
    });
    onChange();
  };

  const handleRemove = async () => {
    await removeFromCart(axiosPrivate, item.productId._id);
    onChange();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        padding: "1rem 0",
      }}
    >
      {item.productId.images?.[0] && (
        <img
          src={item.productId.images[0]}
          alt={item.productId.name}
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
      )}

      <div style={{ flex: 1 }}>
        <h4>{item.productId.name}</h4>
        <p>${item.productId.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button onClick={decreaseQty} disabled={item.qty <= 1}>
          −
        </button>

        <span>{item.qty}</span>

        <button onClick={increaseQty}>+</button>
      </div>

      <button onClick={handleRemove}>Remove</button>
    </div>
  );
};

export default CartItem;
