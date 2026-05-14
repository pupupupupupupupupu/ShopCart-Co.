// import { useEffect, useState } from "react";
// import useAuth from "./useAuth";
// import { getCart } from "../api/cart.api";

// import useAxiosPrivate from "./useAxiosPrivate";

// const useCart = () => {
//   const { auth } = useAuth();
//   const [totalItems, setTotalItems] = useState(0);

//   const axiosPrivate = useAxiosPrivate();

//   useEffect(() => {
//     const loadCart = async () => {
//       if (!auth?.accessToken) {
//         setTotalItems(0);
//         return;
//       }

//       try {
//         const data = await getCart(axiosPrivate);
//         const count = data.items.reduce(
//           (sum: number, item: any) => sum + item.qty,
//           0
//         );
//         setTotalItems(count);
//       } catch {
//         setTotalItems(0);
//       }
//     };

//     loadCart();
//   }, [auth]);

//   return { totalItems };
// };

// export default useCart;

// import { useEffect, useState } from "react";
// import useAuth from "./useAuth";
// import useAxiosPrivate from "./useAxiosPrivate";
// import { getCart } from "../api/cart.api";

// const useCart = () => {
//   const { auth } = useAuth();
//   const axiosPrivate = useAxiosPrivate();
//   const [totalItems, setTotalItems] = useState(0);

//   useEffect(() => {
//     const loadCart = async () => {
//       if (!auth?.accessToken) {
//         setTotalItems(0);
//         return;
//       }

//       try {
//         const data = await getCart(axiosPrivate);
//         const count = data.items.reduce(
//           (sum: number, item: any) => sum + item.qty,
//           0
//         );
//         setTotalItems(count);
//       } catch (err) {
//         console.error("Failed to load cart", err);
//         setTotalItems(0);
//       }
//     };

//     loadCart();
//   }, [auth?.accessToken, axiosPrivate]);

//   return { totalItems };
// };

// export default useCart;
import { useContext } from "react";
import CartContext from "../context/CartContext";

const useCart = () => {
  return useContext(CartContext);
};

export default useCart;
