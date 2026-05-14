import { axiosPublic } from "./axios";

export type LoginPayload = {
  user: string;
  pwd: string;
};

export type RegisterPayload = {
  user: string;
  pwd: string;
};

export const login = async (data: LoginPayload) => {
  const response = await axiosPublic.post("/auth/login", data);
  return response.data; // { accessToken }
};

export const register = async (data: RegisterPayload) => {
  const response = await axiosPublic.post("/auth/register", data);
  return response.data;
};

export const refresh = async () => {
  const response = await axiosPublic.get("/auth/refresh");
  return response.data; // { accessToken }
};

export const logout = async () => {
  await axiosPublic.post("/auth/logout");
};
