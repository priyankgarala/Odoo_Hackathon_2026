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
    AVAILABLE: "bg-emerald-500 text-white", 
    ON_TRIP: "bg-blue-500 text-white",
    IN_SHOP: "bg-orange-500 text-white", 
    RETIRED: "bg-red-500 text-white",
  };
  return (
    <span className={`inline-flex min-w-[80px] items-center justify-center rounded-md px-3 py-1 text-xs font-semibold shadow-sm ${colors[status]}`}>
      {VEHICLE_STATUS_LABELS[status]}
    </span>
  );
}

export function VehiclesPage() {
  useOperationsRealtime();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | VehicleStatus>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  
  const { data: vehicles = [], isLoading } = useQuery({ 
    queryKey: ["vehicles", statusFilter, typeFilter], 
    queryFn: () => getVehicles({ status: statusFilter || undefined, type: typeFilter || undefined }) 
  });
  
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">Vehicle Registry</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <select className="flex h-11 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">Type: All</option>
            {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          
          <select className="flex h-11 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | VehicleStatus)}>
            <option value="">Status: All</option>
            {statuses.map((status) => <option key={status} value={status}>{VEHICLE_STATUS_LABELS[status]}</option>)}
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input className="h-11 w-64 pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search REG NO..." />
          </div>
        </div>
        
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-colors h-11 px-6">
          <Plus className="h-4 w-4 mr-2" /> Add Vehicle
        </Button>
      </div>

      {showForm && (
        <Card className="border-orange-500/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? "Edit Vehicle" : "Register Vehicle"}</h3>
              <Button variant="ghost" size="sm" onClick={closeForm}><X className="h-4 w-4" /></Button>
            </div>
            <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
              <Field label="Registration number" error={form.formState.errors.registrationNumber?.message}><Input {...form.register("registrationNumber", { required: "Required" })} disabled={Boolean(editing)} placeholder="MH-01-AB-1234" /></Field>
              <Field label="Vehicle name (Chassis/VIN)" error={form.formState.errors.name?.message}><Input {...form.register("name", { required: "Required" })} placeholder="Van-05" /></Field>
              <Field label="Vehicle type" error={form.formState.errors.type?.message}><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type", { required: "Required" })}><option value="">Select type</option>{VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
              <Field label="Maximum load (kg)" error={form.formState.errors.maxLoadCapacity?.message}><Input type="number" min="0" {...form.register("maxLoadCapacity", { required: "Required", min: { value: 1, message: "Must be above 0" } })} /></Field>
              <Field label="Odometer (km)"><Input type="number" min="0" {...form.register("odometer", { min: 0 })} /></Field>
              <Field label="Acquisition cost" error={form.formState.errors.acquisitionCost?.message}><Input type="number" min="0" {...form.register("acquisitionCost", { required: "Required", min: { value: 0, message: "Cannot be negative" } })} /></Field>
              <Field label="Region"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("region")}><option value="">Select region</option>{REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select></Field>
              {editing && editing.status === "AVAILABLE" && <Field label="Status"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}><option value="AVAILABLE">Available</option><option value="RETIRED">Retired</option></select></Field>}
              <div className="flex items-end gap-3 col-span-full mt-2">
                <Button type="submit" disabled={save.isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {save.isPending ? "Saving..." : editing ? "Save Changes" : "Register Vehicle"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b bg-muted/30">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4 pl-6">REG. NO.</th>
                <th className="p-4">CHASSIS/VIN</th>
                <th className="p-4">TYPE</th>
                <th className="p-4">CAPACITY</th>
                <th className="p-4">ODOMETER</th>
                <th className="p-4">ACQ COST</th>
                <th className="p-4 text-center pr-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>Loading vehicles...</td></tr>
              ) : displayedVehicles.length === 0 ? (
                <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>No vehicles match these filters.</td></tr>
              ) : displayedVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6 font-medium cursor-pointer" onClick={() => openEdit(vehicle)}>{vehicle.registrationNumber}</td>
                  <td className="p-4">{vehicle.name}</td>
                  <td className="p-4">{vehicle.type}</td>
                  <td className="p-4">{vehicle.maxLoadCapacity.toLocaleString()} kg</td>
                  <td className="p-4">{vehicle.odometer.toLocaleString()} km</td>
                  <td className="p-4">₹{vehicle.acquisitionCost.toLocaleString()}</td>
                  <td className="p-4 text-center pr-6">
                    <StatusBadge status={vehicle.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
