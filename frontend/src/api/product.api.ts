import { axiosPublic, axiosPrivate } from "./axios";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  category: string;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  createdBy: string;
};

export type ProductQuery = {
  page?:     number;
  limit?:    number;
  search?:   string;
  category?: string;
};

export const getProducts = async (query?: ProductQuery) => {
  const response = await axiosPublic.get("/products", { params: query });
  return response.data; // { products, totalPages, currentPage, total }
};

export const getProductById = async (id: string) => {
  const response = await axiosPublic.get(`/products/${id}`);
  return response.data;
};

// Admin
export const createProduct = async (formData: FormData) => {
  const response = await axiosPrivate.post("/products/admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  const response = await axiosPrivate.put(`/products/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  // Route is /products/admin/:id  (not /admin/products/:id)
  const response = await axiosPrivate.delete(`/products/admin/${id}`);
  return response.data;
};
