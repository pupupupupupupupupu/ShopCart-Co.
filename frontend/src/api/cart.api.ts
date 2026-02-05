import { axiosPrivate } from "./axios";

export type CartItem = {
  productId: string;
  qty: number;
};

export const getCart = async () => {
  const response = await axiosPrivate.get("/cart");
  return response.data; // { items }
};

export const addToCart = async (item: CartItem) => {
  const response = await axiosPrivate.post("/cart", item);
  return response.data;
};

export const updateCartItem = async (item: CartItem) => {
  const response = await axiosPrivate.put("/cart", item);
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await axiosPrivate.delete(`/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axiosPrivate.delete("/cart");
  return response.data;
};
