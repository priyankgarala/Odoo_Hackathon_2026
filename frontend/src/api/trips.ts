import { api } from "./client";
import type { Trip, TripStatus } from "@/types";

export type TripPayload = { source: string; destination: string; cargoWeight: number; plannedDistance: number; vehicleId: string; driverId: string };
export type CompleteTripPayload = { finalOdometer: number; fuelConsumed: number; revenue?: number };

export async function getTrips(filters?: { status?: TripStatus }) { const { data } = await api.get<Trip[]>("/trips", { params: filters }); return data; }
export async function createTrip(payload: TripPayload) { const { data } = await api.post<Trip>("/trips", payload); return data; }
export async function dispatchTrip(id: string) { const { data } = await api.patch<Trip>(`/trips/${id}/dispatch`); return data; }
export async function completeTrip(id: string, payload: CompleteTripPayload) { const { data } = await api.patch<Trip>(`/trips/${id}/complete`, payload); return data; }
export async function cancelTrip(id: string) { const { data } = await api.patch<Trip>(`/trips/${id}/cancel`); return data; }
