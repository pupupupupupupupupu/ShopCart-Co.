import { axiosPrivate } from "./axios";

export type AdminUser = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: Record<string, number>;
  active: boolean;
  createdAt: string;
};

export type AdminStats = {
  totalUsers:    number;
  totalProducts: number;
  totalOrders:   number;
  totalRevenue:  number;
};

export const getAllUsers = async () => {
  const response = await axiosPrivate.get("/admin/users");
  return response.data as AdminUser[];
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
