import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { createVehicle, deleteVehicle, getVehicles, updateVehicle, type VehiclePayload } from "@/api/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGIONS, VEHICLE_STATUS_LABELS, VEHICLE_TYPES, type Vehicle, type VehicleStatus } from "@/types";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";

const statuses: VehicleStatus[] = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];
const emptyVehicle: VehiclePayload = {
  registrationNumber: "", name: "", type: "", maxLoadCapacity: 0, odometer: 0, acquisitionCost: 0, region: "",
};

function StatusBadge({ status }: { status: VehicleStatus }) {
  const colors: Record<VehicleStatus, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-800", ON_TRIP: "bg-blue-100 text-blue-800",
    IN_SHOP: "bg-amber-100 text-amber-800", RETIRED: "bg-slate-200 text-slate-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}>{VEHICLE_STATUS_LABELS[status]}</span>;
}

export function VehiclesPage() {
  useOperationsRealtime();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | VehicleStatus>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [search, setSearch] = useState("");
  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ["vehicles", statusFilter, typeFilter, regionFilter], queryFn: () => getVehicles({ status: statusFilter || undefined, type: typeFilter || undefined, region: regionFilter || undefined }) });
  const form = useForm<VehiclePayload>({ defaultValues: emptyVehicle });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  const save = useMutation({
    mutationFn: (data: VehiclePayload) => editing ? updateVehicle(editing.id, data) : createVehicle(data),
    onSuccess: () => { toast.success(editing ? "Vehicle updated" : "Vehicle added"); closeForm(); refresh(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save vehicle"),
  });
  const remove = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => { toast.success("Vehicle removed"); refresh(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to remove vehicle"),
  });

  function openCreate() { setEditing(null); form.reset(emptyVehicle); setShowForm(true); }
  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle); form.reset({ ...vehicle, region: vehicle.region ?? "" }); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); form.reset(emptyVehicle); }
  function onSubmit(data: VehiclePayload) {
    save.mutate({ ...data, maxLoadCapacity: Number(data.maxLoadCapacity), odometer: Number(data.odometer), acquisitionCost: Number(data.acquisitionCost), region: data.region || undefined });
  }
  const displayedVehicles = vehicles.filter((vehicle) => `${vehicle.name} ${vehicle.registrationNumber} ${vehicle.type}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-3xl font-bold tracking-tight">Vehicle Registry</h2><p className="text-muted-foreground">Manage fleet assets and vehicle lifecycle</p></div>
      <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add vehicle</Button>
    </div>

    {showForm && <Card><CardContent className="pt-6">
      <div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-semibold">{editing ? "Edit vehicle" : "Register vehicle"}</h3><Button variant="ghost" size="sm" onClick={closeForm}><X className="h-4 w-4" /></Button></div>
      <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="Registration number" error={form.formState.errors.registrationNumber?.message}><Input {...form.register("registrationNumber", { required: "Required" })} disabled={Boolean(editing)} placeholder="MH-01-AB-1234" /></Field>
        <Field label="Vehicle name / model" error={form.formState.errors.name?.message}><Input {...form.register("name", { required: "Required" })} placeholder="Van-05" /></Field>
        <Field label="Vehicle type" error={form.formState.errors.type?.message}><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type", { required: "Required" })}><option value="">Select type</option>{VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
        <Field label="Maximum load (kg)" error={form.formState.errors.maxLoadCapacity?.message}><Input type="number" min="0" {...form.register("maxLoadCapacity", { required: "Required", min: { value: 1, message: "Must be above 0" } })} /></Field>
        <Field label="Odometer (km)"><Input type="number" min="0" {...form.register("odometer", { min: 0 })} /></Field>
        <Field label="Acquisition cost" error={form.formState.errors.acquisitionCost?.message}><Input type="number" min="0" {...form.register("acquisitionCost", { required: "Required", min: { value: 0, message: "Cannot be negative" } })} /></Field>
        <Field label="Region"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("region")}><option value="">Select region</option>{REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></Field>
        {editing && editing.status === "AVAILABLE" && <Field label="Status"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}><option value="AVAILABLE">Available</option><option value="RETIRED">Retired</option></select></Field>}
        <div className="flex items-end gap-3"><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : editing ? "Save changes" : "Register vehicle"}</Button><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button></div>
      </form>
    </CardContent></Card>}

    <Card><CardContent className="pt-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Fleet vehicles</h3><p className="mt-1 text-sm text-muted-foreground">Search, filter, and update your fleet records.</p></div><div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search vehicles" className="h-9 w-48 pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fleet..." /></div><select aria-label="Filter by vehicle type" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">All types</option>{VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select><select aria-label="Filter by region" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="">All regions</option>{REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select><select aria-label="Filter by status" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | VehicleStatus)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{VEHICLE_STATUS_LABELS[status]}</option>)}</select></div></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-muted-foreground"><tr><th className="p-3">Vehicle</th><th className="p-3">Registration</th><th className="p-3">Capacity</th><th className="p-3">Odometer</th><th className="p-3">Region</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>
        {isLoading ? <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>Loading vehicles...</td></tr> : displayedVehicles.length === 0 ? <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>No vehicles match these filters.</td></tr> : displayedVehicles.map((vehicle) => <tr key={vehicle.id} className="border-b last:border-0"><td className="p-3 font-medium">{vehicle.name}<div className="text-xs font-normal text-muted-foreground">{vehicle.type}</div></td><td className="p-3">{vehicle.registrationNumber}</td><td className="p-3">{vehicle.maxLoadCapacity.toLocaleString()} kg</td><td className="p-3">{vehicle.odometer.toLocaleString()} km</td><td className="p-3">{vehicle.region || "—"}</td><td className="p-3"><StatusBadge status={vehicle.status} /></td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" aria-label={`Edit ${vehicle.name}`} onClick={() => openEdit(vehicle)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" aria-label={`Delete ${vehicle.name}`} disabled={remove.isPending} onClick={() => { if (window.confirm(`Remove ${vehicle.name}?`)) remove.mutate(vehicle.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td></tr>)}
      </tbody></table></div>
    </CardContent></Card>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
