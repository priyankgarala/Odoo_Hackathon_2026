import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { createDriver, deleteDriver, getDrivers, onboardDriver, updateDriver, type DriverPayload } from "@/api/drivers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DRIVER_STATUS_LABELS, type Driver, type DriverStatus } from "@/types";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";
import { useAuth } from "@/providers/AuthProvider";

const statuses: DriverStatus[] = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
const manuallySettableStatuses: DriverStatus[] = ["AVAILABLE", "OFF_DUTY", "SUSPENDED"];
type DriverForm = DriverPayload & { email: string; password: string };
const emptyDriver: DriverForm = { name: "", licenseNumber: "", licenseCategory: "", licenseExpiry: "", contactNumber: "", safetyScore: 100, email: "", password: "" };

function daysUntil(date: string) { return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000); }

function DriverBadge({ status }: { status: DriverStatus }) {
  const colors: Record<DriverStatus, string> = {
    AVAILABLE: "bg-emerald-500 hover:bg-emerald-600 text-white",
    ON_TRIP: "bg-blue-500 hover:bg-blue-600 text-white",
    OFF_DUTY: "bg-slate-500 hover:bg-slate-600 text-white",
    SUSPENDED: "bg-orange-500 hover:bg-orange-600 text-white"
  };
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium shadow-sm transition-colors cursor-default ${colors[status]}`}>
      {DRIVER_STATUS_LABELS[status]}
    </span>
  );
}

export function DriversPage() {
  useOperationsRealtime();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | DriverStatus>("");
  const [search, setSearch] = useState("");
  
  const { data: drivers = [], isLoading } = useQuery({ 
    queryKey: ["drivers", statusFilter], 
    queryFn: () => getDrivers(statusFilter ? { status: statusFilter } : undefined) 
  });
  
  const form = useForm<DriverForm>({ defaultValues: emptyDriver });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["drivers"] });
  
  const save = useMutation({ 
    mutationFn: (data: DriverForm) => editing ? updateDriver(editing.id, data) : hasRole("FLEET_MANAGER") ? onboardDriver(data) : createDriver(data), 
    onSuccess: () => { 
      toast.success(editing ? "Driver updated" : hasRole("FLEET_MANAGER") ? "Driver account and profile created" : "Driver added"); 
      closeForm(); 
      refresh(); 
    }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save driver") 
  });
  
  const remove = useMutation({ 
    mutationFn: deleteDriver, 
    onSuccess: () => { toast.success("Driver removed"); refresh(); }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to remove driver") 
  });

  function closeForm() { setShowForm(false); setEditing(null); form.reset(emptyDriver); }
  function openCreate() { setEditing(null); form.reset(emptyDriver); setShowForm(true); }
  function openEdit(driver: Driver) { setEditing(driver); form.reset({ ...driver, licenseExpiry: driver.licenseExpiry.slice(0, 10) }); setShowForm(true); }
  function onSubmit(data: DriverForm) { save.mutate({ ...data, safetyScore: Number(data.safetyScore) }); }
  
  const displayed = drivers.filter((driver) => `${driver.name} ${driver.licenseNumber} ${driver.contactNumber}`.toLowerCase().includes(search.toLowerCase()));

  const toggleStatusFilter = (status: DriverStatus) => {
    setStatusFilter(prev => prev === status ? "" : status);
  };

  return (
    <div className="space-y-8">
      {/* Header section from mockup */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">Drivers & Safety Profiles</h1>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 shadow-md transition-colors" size="lg">
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-lg border-muted">
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold">{editing ? "Edit Driver" : "Register Driver"}</h3>
                {!editing && hasRole("FLEET_MANAGER") && <p className="text-sm text-muted-foreground mt-1">A linked Driver login account will be created automatically.</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={closeForm} className="rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
              <Field label="Full Name" error={form.formState.errors.name?.message}>
                <Input className="h-11" {...form.register("name", { required: "Required" })} />
              </Field>
              {!editing && hasRole("FLEET_MANAGER") && (
                <>
                  <Field label="Login Email">
                    <Input className="h-11" type="email" {...form.register("email", { required: "Required" })} />
                  </Field>
                  <Field label="Temporary Password">
                    <Input className="h-11" type="password" {...form.register("password", { required: "Required", minLength: 8 })} />
                  </Field>
                </>
              )}
              <Field label="License Number" error={form.formState.errors.licenseNumber?.message}>
                <Input className="h-11" {...form.register("licenseNumber", { required: "Required" })} disabled={Boolean(editing)} />
              </Field>
              <Field label="License Category" error={form.formState.errors.licenseCategory?.message}>
                <Input className="h-11" placeholder="LMV, HMV..." {...form.register("licenseCategory", { required: "Required" })} />
              </Field>
              <Field label="License Expiry" error={form.formState.errors.licenseExpiry?.message}>
                <Input className="h-11" type="date" {...form.register("licenseExpiry", { required: "Required" })} />
              </Field>
              <Field label="Contact Number" error={form.formState.errors.contactNumber?.message}>
                <Input className="h-11" type="tel" {...form.register("contactNumber", { required: "Required" })} />
              </Field>
              <Field label="Safety Score" error={form.formState.errors.safetyScore?.message}>
                <Input className="h-11" type="number" min="0" max="100" {...form.register("safetyScore", { min: { value: 0, message: "Minimum is 0" }, max: { value: 100, message: "Maximum is 100" } })} />
              </Field>
              {editing && editing.status !== "ON_TRIP" && (
                <Field label="Status">
                  <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register("status")}>
                    {manuallySettableStatuses.map((status) => (
                      <option value={status} key={status}>{DRIVER_STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="flex items-end gap-3 lg:col-span-3 pt-2">
                <Button type="submit" size="lg" disabled={save.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {save.isPending ? "Saving..." : editing ? "Save Changes" : "Register Driver"}
                </Button>
                <Button type="button" size="lg" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main table matching mockup */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b bg-muted/30">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4 pl-6">DRIVER</th>
                <th className="p-4">LICENSE NO</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">EXPIRY</th>
                <th className="p-4">CONTACT</th>
                <th className="p-4 text-center">TRIP COMPL.</th>
                <th className="p-4 text-center">SAFETY</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 pr-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-base">Loading drivers...</td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-base">No drivers match these filters.</td>
                </tr>
              ) : (
                displayed.map((driver) => {
                  const days = daysUntil(driver.licenseExpiry);
                  const expiring = days <= 30;
                  const expiryDate = new Date(driver.licenseExpiry);
                  // Format expiry to MM/YYYY to match mockup closely
                  const formattedExpiry = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear()}${days < 0 ? ' EXPIRS' : ''}`;
                  
                  return (
                    <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 pl-6 font-medium text-base">{driver.name}</td>
                      <td className="p-4">{driver.licenseNumber}</td>
                      <td className="p-4">{driver.licenseCategory}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 ${expiring ? "font-semibold text-destructive" : ""}`}>
                          {expiring && <AlertTriangle className="h-4 w-4" />}
                          {formattedExpiry}
                        </span>
                      </td>
                      <td className="p-4">{driver.contactNumber}</td>
                      <td className="p-4 text-center font-medium">{driver.safetyScore}%</td>
                      <td className="p-4 text-center"><DriverBadge status={driver.status} /></td>
                      <td className="p-4 text-center"><DriverBadge status={driver.status} /></td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted" onClick={() => openEdit(driver)} aria-label={`Edit ${driver.name}`}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" disabled={remove.isPending} onClick={() => { if (window.confirm(`Remove ${driver.name}?`)) remove.mutate(driver.id); }} aria-label={`Delete ${driver.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle Stat Section matching mockup */}
      <div className="pt-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TOGGLE STAT</h4>
        <div className="flex flex-wrap items-center gap-3">
          {statuses.map((status) => {
            const isSelected = statusFilter === status;
            const colors: Record<DriverStatus, string> = {
              AVAILABLE: "bg-emerald-500 text-white",
              ON_TRIP: "bg-blue-500 text-white",
              OFF_DUTY: "bg-slate-500 text-white",
              SUSPENDED: "bg-orange-500 text-white"
            };
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-5 py-2 rounded-md text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out ${
                  isSelected ? 'ring-2 ring-ring ring-offset-2 scale-105 shadow-md' : 'opacity-80 hover:opacity-100 hover:shadow'
                } ${colors[status]}`}
              >
                {DRIVER_STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
          Note: Expired license or Suspended status &rarr; blocked from Trip assignment
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { 
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  ); 
}

