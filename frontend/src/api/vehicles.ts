import { api } from "./client";
import type { Vehicle, VehicleStatus } from "@/types";

export type VehiclePayload = {
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region?: string;
  status?: VehicleStatus;
};

export async function getVehicles(filters?: { status?: VehicleStatus; type?: string; region?: string }) {
  const { data } = await api.get<Vehicle[]>("/vehicles", { params: filters });
  return data;
}

export async function getAvailableVehicles() { const { data } = await api.get<Vehicle[]>("/vehicles/available"); return data; }

export async function createVehicle(payload: VehiclePayload) {
  const { data } = await api.post<Vehicle>("/vehicles", payload);
  return data;
}

export async function updateVehicle(id: string, payload: Partial<VehiclePayload>) {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload);
  return data;
}

export async function deleteVehicle(id: string) {
  await api.delete(`/vehicles/${id}`);
}
