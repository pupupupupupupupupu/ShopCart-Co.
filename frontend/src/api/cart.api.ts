// import { AxiosInstance } from "axios";

// export type CartItem = {
//   productId: string;
//   qty: number;
// };

// export const getCart = async (axiosPrivate: AxiosInstance) => {
//   const response = await axiosPrivate.get("/cart");
//   return response.data;
// };

// export const addToCart = async (
//   axiosPrivate: AxiosInstance,
//   item: CartItem
// ) => {
//   const response = await axiosPrivate.post("/cart", item);
//   return response.data;
// };

// export const updateCartItem = async (
//   axiosPrivate: AxiosInstance,
//   item: CartItem
// ) => {
//   const response = await axiosPrivate.put("/cart", item);
//   return response.data;
// };

// export const removeFromCart = async (
//   axiosPrivate: AxiosInstance,
//   productId: string
// ) => {
//   const response = await axiosPrivate.delete(`/cart/${productId}`);
//   return response.data;
// };

// export const clearCart = async (axiosPrivate: AxiosInstance) => {
//   const response = await axiosPrivate.delete("/cart");
//   return response.data;
// };


// import { axiosPrivate } from "./axios";

// export type CartItem = {
//   productId: string;
//   qty: number;
// };

// export const getCart = async (axiosPrivate: unknown) => {
//   const response = await axiosPrivate.get("/cart");
//   return response.data;
// };

// export const addToCart = async (item: CartItem) => {
//   const response = await axiosPrivate.post("/cart", item);
//   return response.data;
// };

// export const updateCartItem = async (item: CartItem) => {
//   const response = await axiosPrivate.put("/cart", item);
//   return response.data;
// };

// export const removeFromCart = async (productId: string) => {
//   const response = await axiosPrivate.delete(`/cart/${productId}`);
//   return response.data;
// };

// export const clearCart = async () => {
//   const response = await axiosPrivate.delete("/cart");
//   return response.data;
// };
import { AxiosInstance } from "axios";

export type CartItem = {
  productId: string;
  qty: number;
};

export const getCart = async (axios: AxiosInstance) => {
  const res = await axios.get("/cart");
  return res.data;
};

export const addToCart = async (axiosPrivate: any, item: CartItem) => {
  const res = await axiosPrivate.post("/cart", item);
  return res.data;
};

export const updateCartItem = async (axiosPrivate: any, item: CartItem) => {
  const res = await axiosPrivate.put("/cart", item);
  return res.data;
};

export const removeFromCart = async (
  axiosPrivate: any,
  productId: string
) => {
  const res = await axiosPrivate.delete(`/cart/${productId}`);
  return res.data;
};

export const clearCart = async (axiosPrivate: any) => {
  const res = await axiosPrivate.delete("/cart");
  return res.data;
};
