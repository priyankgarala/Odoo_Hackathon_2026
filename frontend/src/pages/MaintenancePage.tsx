import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { createMaintenanceLog, closeMaintenanceLog, getMaintenanceLogs, type MaintenancePayload } from "@/api/maintenance";
import { getVehicles } from "@/api/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";

const emptyLog: MaintenancePayload = { vehicleId: "", description: "", cost: 0, date: new Date().toISOString().slice(0, 10) };

export function MaintenancePage() {
  useOperationsRealtime();
  const queryClient = useQueryClient();
  const form = useForm<MaintenancePayload>({ defaultValues: emptyLog });
  
  const { data: logs = [], isLoading } = useQuery({ queryKey: ["maintenance"], queryFn: () => getMaintenanceLogs() });
  const { data: vehicles = [] } = useQuery({ queryKey: ["maintenance-vehicles"], queryFn: () => getVehicles() });
  
  const refresh = () => { 
    queryClient.invalidateQueries({ queryKey: ["maintenance"] }); 
    queryClient.invalidateQueries({ queryKey: ["vehicles"] }); 
    queryClient.invalidateQueries({ queryKey: ["maintenance-vehicles"] }); 
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] }); 
  };
  
  const create = useMutation({ 
    mutationFn: createMaintenanceLog, 
    onSuccess: () => { 
      toast.success("Maintenance log opened; vehicle is now in shop"); 
      form.reset(emptyLog); 
      refresh(); 
    }, 
    onError: (e) => toast.error(e instanceof Error ? e.message : "Unable to open maintenance log") 
  });
  
  const close = useMutation({ 
    mutationFn: closeMaintenanceLog, 
    onSuccess: () => { 
      toast.success("Maintenance log closed"); 
      refresh(); 
    }, 
    onError: (e) => toast.error(e instanceof Error ? e.message : "Unable to close maintenance log") 
  });
  
  const maintenanceEligible = vehicles.filter((vehicle) => vehicle.status !== "RETIRED" && vehicle.status !== "ON_TRIP");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">5. Maintenance</h1>
      
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        
        {/* Left Column: LOG SERVICE RECORD */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">LOG SERVICE RECORD</h2>
          
          <form className="space-y-4" onSubmit={form.handleSubmit((data) => create.mutate({ ...data, cost: Number(data.cost) }))}>
            <Field label="VEHICLE" error={form.formState.errors.vehicleId?.message}>
              <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register("vehicleId", { required: "Select a vehicle" })}>
                <option value="">Select vehicle...</option>
                {maintenanceEligible.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} · {vehicle.registrationNumber} ({vehicle.status === "IN_SHOP" ? "in shop" : "available"})
                  </option>
                ))}
              </select>
            </Field>
            
            <Field label="SERVICE TYPE" error={form.formState.errors.description?.message}>
              <Input className="h-11" placeholder="Oil Change, Engine Repair..." {...form.register("description", { required: "Required" })} />
            </Field>
            
            <Field label="COST">
              <Input className="h-11" type="number" min="0" placeholder="0" {...form.register("cost", { min: 0 })} />
            </Field>
            
            <Field label="DATE">
              <Input className="h-11" type="date" {...form.register("date")} />
            </Field>

            <Field label="STATUS">
              <Input className="h-11 bg-muted/50 text-muted-foreground font-medium" value="Active" readOnly disabled />
            </Field>
            
            <Button type="submit" disabled={create.isPending} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold transition-colors mt-2">
              {create.isPending ? "Saving..." : "Save"}
            </Button>
          </form>

        </div>

        {/* Right Column: SERVICE LOG */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">SERVICE LOG</h2>
          
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b bg-muted/30">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4 pl-6">VEHICLE</th>
                    <th className="p-4">SERVICE</th>
                    <th className="p-4 text-right">COST</th>
                    <th className="p-4 pl-8">STATUS</th>
                    <th className="p-4 pr-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-base">Loading service logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-base">No maintenance logs yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 pl-6 font-medium text-base">
                          {log.vehicle.registrationNumber || log.vehicle.name}
                        </td>
                        <td className="p-4 text-muted-foreground">{log.description}</td>
                        <td className="p-4 text-right font-medium">
                          {log.cost.toLocaleString()}
                        </td>
                        <td className="p-4 pl-8">
                          <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold shadow-sm transition-colors cursor-default ${
                            log.status === "OPEN" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}>
                            {log.status === "OPEN" ? "In Shop" : "Completed"}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {log.status === "OPEN" && (
                            <Button size="sm" variant="ghost" className="h-8 hover:bg-emerald-500/10 hover:text-emerald-600" disabled={close.isPending} onClick={() => close.mutate(log.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Close
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { 
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  ); 
}
