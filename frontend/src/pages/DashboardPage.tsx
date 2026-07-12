import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Bus, CircleCheck, Gauge, Route, Users, Wrench } from "lucide-react";
import { getDashboardKpis } from "@/api/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import type { VehicleStatus } from "@/types";

const statusOptions: { value: "" | VehicleStatus; label: string }[] = [{ value: "", label: "All statuses" }, { value: "AVAILABLE", label: "Available" }, { value: "ON_TRIP", label: "On trip" }, { value: "IN_SHOP", label: "In shop" }, { value: "RETIRED", label: "Retired" }];
const cards = [
  { key: "activeVehicles", label: "Active vehicles", icon: Bus, color: "bg-blue-50 text-blue-600" }, { key: "availableVehicles", label: "Available vehicles", icon: CircleCheck, color: "bg-emerald-50 text-emerald-600" }, { key: "vehiclesInMaintenance", label: "In maintenance", icon: Wrench, color: "bg-amber-50 text-amber-600" }, { key: "activeTrips", label: "Active trips", icon: Route, color: "bg-violet-50 text-violet-600" }, { key: "pendingTrips", label: "Pending trips", icon: Activity, color: "bg-rose-50 text-rose-600" }, { key: "driversOnDuty", label: "Drivers on duty", icon: Users, color: "bg-cyan-50 text-cyan-600" },
] as const;

export function DashboardPage() {
  const [status, setStatus] = useState<"" | VehicleStatus>("");
  const [region, setRegion] = useState("");
  const { data: kpis, isLoading } = useQuery({ queryKey: ["dashboard-kpis", status, region], queryFn: () => getDashboardKpis({ status: status || undefined, region: region || undefined }) });
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Operations center</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Fleet dashboard</h2><p className="mt-1 text-muted-foreground">Live fleet availability and dispatch activity.</p></div><p className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">● Systems operational</p></div>
    <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-3"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as "" | VehicleStatus)}>{statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><input className="h-9 rounded-lg border bg-background px-3 text-sm" value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Filter by region" /></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({ key, label, icon: Icon, color }) => <Card key={key}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{isLoading ? "—" : kpis?.[key]}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span></CardContent></Card>)}</div>
    <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="font-semibold">Fleet utilization</p><p className="mt-1 text-sm text-muted-foreground">Vehicles currently serving dispatched trips</p></div><Gauge className="h-5 w-5 text-primary" /></div><div className="mt-8 h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${kpis?.fleetUtilization ?? 0}%` }} /></div><div className="mt-3 flex justify-between"><span className="text-3xl font-bold">{isLoading ? "—" : kpis?.fleetUtilization}%</span><span className="text-sm text-muted-foreground">Target: 75%</span></div></CardContent></Card><Card><CardContent className="p-6"><p className="font-semibold">Dispatch summary</p><div className="mt-5 space-y-4"><Summary label="Dispatched trips" value={kpis?.activeTrips} tone="bg-violet-500" /><Summary label="Awaiting dispatch" value={kpis?.pendingTrips} tone="bg-amber-500" /><Summary label="Available fleet" value={kpis?.availableVehicles} tone="bg-emerald-500" /></div></CardContent></Card></div>
  </div>;
}

function Summary({ label, value, tone }: { label: string; value?: number; tone: string }) { return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-muted-foreground"><i className={`h-2 w-2 rounded-full ${tone}`} />{label}</span><span className="font-semibold">{value ?? "—"}</span></div>; }
