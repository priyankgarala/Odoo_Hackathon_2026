import { api } from "./client";
import type { MaintenanceLog } from "@/types";

export type MaintenancePayload = { vehicleId: string; description: string; cost: number; date?: string };
export async function getMaintenanceLogs(vehicleId?: string) { const { data } = await api.get<MaintenanceLog[]>("/maintenance", { params: vehicleId ? { vehicleId } : undefined }); return data; }
export async function createMaintenanceLog(payload: MaintenancePayload) { const { data } = await api.post<MaintenanceLog>("/maintenance", payload); return data; }
export async function closeMaintenanceLog(id: string) { const { data } = await api.patch<MaintenanceLog>(`/maintenance/${id}/close`); return data; }
