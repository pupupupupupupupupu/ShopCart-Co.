import { axiosPrivate } from "./axios";

export type User = {
  _id: string;
  username: string;
  roles: number[];
  active: boolean;
};

export type AdminStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
};

export const getAllUsers = async () => {
  const response = await axiosPrivate.get("/admin/users");
  return response.data; // User[]
};

export const disableUser = async (userId: string) => {
  const response = await axiosPrivate.patch(`/admin/users/${userId}/disable`);
  return response.data;
};

export const enableUser = async (userId: string) => {
  const response = await axiosPrivate.patch(`/admin/users/${userId}/enable`);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await axiosPrivate.get("/admin/stats");
  return response.data as AdminStats;
};
