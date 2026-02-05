import { createContext, useEffect, useState, ReactNode } from "react";
import { getCart } from "../api/cart.api";
import useAuth from "../hooks/useAuth";

type CartContextType = {
  totalItems: number;
  refreshCart: () => void;
};

const CartContext = createContext<CartContextType>({
  totalItems: 0,
  refreshCart: () => {},
});

type Props = {
  children: ReactNode;
};

export const CartProvider = ({ children }: Props) => {
  const { auth } = useAuth();
  const [totalItems, setTotalItems] = useState(0);

  const refreshCart = async () => {
    if (!auth?.accessToken) {
      setTotalItems(0);
      return;
    }

    try {
      const data = await getCart();
      const count = data.items.reduce(
        (sum: number, item: any) => sum + item.qty,
        0
      );
      setTotalItems(count);
    } catch {
      setTotalItems(0);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [auth]);

  return (
    <CartContext.Provider value={{ totalItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
