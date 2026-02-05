import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import { getCart } from "../api/cart.api";

const useCart = () => {
  const { auth } = useAuth();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
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

    loadCart();
  }, [auth]);

  return { totalItems };
};

export default useCart;
