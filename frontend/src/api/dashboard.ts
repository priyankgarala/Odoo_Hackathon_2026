import { api } from "./client";
import type { DashboardKpis, VehicleStatus } from "@/types";

export async function getDashboardKpis(filters?: { type?: string; status?: VehicleStatus; region?: string }) {
  const { data } = await api.get<DashboardKpis>("/dashboard/kpis", { params: filters });
  return data;
}
