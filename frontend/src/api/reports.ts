import { api } from "./client";
import type { AnalyticsReport } from "@/types";
export async function getAnalyticsReport() { const { data } = await api.get<AnalyticsReport>("/reports/analytics"); return data; }
export async function downloadAnalyticsCsv() { const { data } = await api.get<Blob>("/reports/export/csv", { responseType: "blob" }); return data; }
