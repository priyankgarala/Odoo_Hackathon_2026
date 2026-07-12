import { api } from "./client";
import type { Driver, DriverStatus } from "@/types";

export type DriverPayload = {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status?: DriverStatus;
};

export async function getDrivers(filters?: { status?: DriverStatus }) {
  const { data } = await api.get<Driver[]>("/drivers", { params: filters });
  return data;
}

export async function getAvailableDrivers() { const { data } = await api.get<Driver[]>("/drivers/available"); return data; }

export async function createDriver(payload: DriverPayload) {
  const { data } = await api.post<Driver>("/drivers", payload);
  return data;
}

export async function onboardDriver(payload: DriverPayload & { email: string; password: string }) { const { data } = await api.post<Driver>("/drivers/onboard", payload); return data; }

export async function updateDriver(id: string, payload: Partial<DriverPayload>) {
  const { data } = await api.put<Driver>(`/drivers/${id}`, payload);
  return data;
}

export async function deleteDriver(id: string) { await api.delete(`/drivers/${id}`); }
