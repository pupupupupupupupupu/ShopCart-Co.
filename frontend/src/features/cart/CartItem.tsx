import { updateCartItem, removeFromCart } from "../../api/cart.api";
import { CartItemType } from "./CartPage";

type Props = {
  item: CartItemType;
  onChange: () => void;
};

const CartItem = ({ item, onChange }: Props) => {
  const handleQtyChange = async (qty: number) => {
    await updateCartItem({
      productId: item.productId._id,
      qty,
    });
    onChange();
  };

  const handleRemove = async () => {
    await removeFromCart(item.productId._id);
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

      <input
        type="number"
        min={1}
        value={item.qty}
        onChange={(e) => handleQtyChange(Number(e.target.value))}
        style={{ width: "60px" }}
      />

      <button onClick={handleRemove}>Remove</button>
    </div>
  );
};

export default CartItem;
