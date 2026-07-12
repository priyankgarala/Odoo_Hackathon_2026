import { api } from "./client";
import type { Role, User } from "@/types";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: User }>("/auth/login", {
    email,
    password,
  });
  return data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getMe() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}
