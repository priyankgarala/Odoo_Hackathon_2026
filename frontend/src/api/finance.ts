import { api } from "./client";
import type { Expense, ExpenseType, FuelLog } from "@/types";
export async function getFuelLogs() { const { data } = await api.get<FuelLog[]>("/fuel-logs"); return data; }
export async function createFuelLog(payload: { vehicleId: string; liters: number; cost: number; date?: string }) { const { data } = await api.post<FuelLog>("/fuel-logs", payload); return data; }
export async function getExpenses() { const { data } = await api.get<Expense[]>("/expenses"); return data; }
export async function createExpense(payload: { vehicleId: string; type: ExpenseType; amount: number; date?: string; description?: string }) { const { data } = await api.post<Expense>("/expenses", payload); return data; }
