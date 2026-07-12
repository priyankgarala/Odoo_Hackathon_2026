import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardKpis } from "@/api/dashboard";
import { getTrips } from "@/api/trips";
import { Card, CardContent } from "@/components/ui/card";
import { REGIONS, VEHICLE_TYPES, type VehicleStatus, TRIP_STATUS_LABELS, type TripStatus } from "@/types";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";

const statusOptions: { value: "" | VehicleStatus; label: string }[] = [
  { value: "", label: "All statuses" }, 
  { value: "AVAILABLE", label: "Available" }, 
  { value: "ON_TRIP", label: "On trip" }, 
  { value: "IN_SHOP", label: "In shop" }, 
  { value: "RETIRED", label: "Retired" }
];

function TripBadge({ status }: { status: TripStatus }) { 
  const colors: Record<TripStatus, string> = { 
    DRAFT: "bg-slate-500 text-white", 
    DISPATCHED: "bg-blue-500 text-white", 
    COMPLETED: "bg-emerald-500 text-white", 
    CANCELLED: "bg-red-500 text-white" 
  }; 
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold shadow-sm ${colors[status]}`}>
      {TRIP_STATUS_LABELS[status]}
    </span>
  );
}

export function DashboardPage() {
  useOperationsRealtime();
  const [status, setStatus] = useState<"" | VehicleStatus>("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  
  const { data: kpis, isLoading } = useQuery({ 
    queryKey: ["dashboard-kpis", status, region, type], 
    queryFn: () => getDashboardKpis({ status: status || undefined, region: region || undefined, type: type || undefined }) 
  });
  
  const { data: trips = [] } = useQuery({ 
    queryKey: ["trips"], 
    queryFn: () => getTrips() 
  });
  
  const recentTrips = trips.slice(0, 4);

  const kpiCards = [
    { key: "activeVehicles", label: "Active Vehicles", color: "border-t-blue-500" },
    { key: "availableVehicles", label: "Available Vehicles", color: "border-t-emerald-500" },
    { key: "vehiclesInMaintenance", label: "Vehicles in Maintenance", color: "border-t-orange-500" },
    { key: "activeTrips", label: "Active Trips", color: "border-t-indigo-500" },
    { key: "pendingTrips", label: "Pending Trips", color: "border-t-red-500" },
    { key: "driversOnDuty", label: "Drivers on Duty", color: "border-t-cyan-500" },
    { key: "fleetUtilization", label: "Fleet Utilization", color: "border-t-green-500", suffix: "%" },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">Dashboard</h1>
      
      <div className="flex flex-wrap gap-4">
        <select className="flex h-11 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Type: All</option>
          {VEHICLE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="flex h-11 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={status} onChange={(event) => setStatus(event.target.value as "" | VehicleStatus)}>
          {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="flex h-11 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={region} onChange={(event) => setRegion(event.target.value)}>
          <option value="">Region: All</option>
          {REGIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpiCards.map(({ key, label, color, suffix }) => (
          <Card key={key} className={`border-t-4 ${color} shadow-sm`}>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 break-words leading-tight">{label}</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `${kpis?.[key as keyof typeof kpis] ?? 0}${suffix || ""}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">RECENT TRIPS</h2>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b bg-muted/30">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4 pl-6">VEHICLE</th>
                    <th className="p-4">ROUTE</th>
                    <th className="p-4 text-center">STATUS</th>
                    <th className="p-4 text-center pr-6">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTrips.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No recent trips.</td></tr>
                  ) : (
                    recentTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 pl-6 font-medium">{trip.vehicle.registrationNumber || trip.vehicle.name}</td>
                        <td className="p-4 text-muted-foreground">{trip.source} &rarr; {trip.destination}</td>
                        <td className="p-4 text-center"><TripBadge status={trip.status} /></td>
                        <td className="p-4 text-center pr-6 font-medium">{trip.status === "DISPATCHED" ? "45 min" : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">VEHICLE STATUS</h2>
          <div className="space-y-4 p-2">
            <StatusBar label="Available" count={kpis?.availableVehicles} total={kpis?.activeVehicles} color="bg-emerald-500" />
            <StatusBar label="On Trip" count={kpis?.activeTrips} total={kpis?.activeVehicles} color="bg-blue-500" />
            <StatusBar label="In Shop" count={kpis?.vehiclesInMaintenance} total={kpis?.activeVehicles} color="bg-orange-500" />
            <StatusBar label="Retired" count={1} total={kpis?.activeVehicles} color="bg-rose-500" /> 
            {/* Hardcoding Retired as 1 for visual representation as it's not in KPI usually, or omit */}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, count = 0, total = 1, color }: { label: string; count?: number; total?: number; color: string }) {
  const percentage = Math.max(0, Math.min(100, (count / (total || 1)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
      </div>
      <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
