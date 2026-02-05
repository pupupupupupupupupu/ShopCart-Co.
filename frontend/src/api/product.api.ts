import { axiosPublic, axiosPrivate } from "./axios";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export const getProducts = async (query?: ProductQuery) => {
  const response = await axiosPublic.get("/products", {
    params: query,
  });
  return response.data; // { products, totalPages, currentPage }
};

export const getProductById = async (id: string) => {
  const response = await axiosPublic.get(`/products/${id}`);
  return response.data;
};

// ADMIN ONLY
export const createProduct = async (formData: FormData) => {
  const response = await axiosPrivate.post("/admin/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  const response = await axiosPrivate.put(`/admin/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/products/${id}`);
  return response.data;
};
