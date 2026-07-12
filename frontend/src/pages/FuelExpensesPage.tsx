import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { createExpense, createFuelLog, getExpenses, getFuelLogs } from "@/api/finance";
import { getVehicles } from "@/api/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";
import type { ExpenseType } from "@/types";

type FuelForm = { vehicleId: string; liters: number; cost: number; date: string }; 
type ExpenseForm = { vehicleId: string; type: ExpenseType; amount: number; date: string; description: string };
const today = () => new Date().toISOString().slice(0, 10);

export function FuelExpensesPage() {
  useOperationsRealtime(); 
  const queryClient = useQueryClient(); 
  const [mode, setMode] = useState<"fuel" | "expense" | null>(null); 
  
  const fuelForm = useForm<FuelForm>({ defaultValues: { vehicleId: "", liters: 0, cost: 0, date: today() } }); 
  const expenseForm = useForm<ExpenseForm>({ defaultValues: { vehicleId: "", type: "TOLL", amount: 0, date: today(), description: "" } });
  
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => getVehicles() }); 
  const { data: fuelLogs = [], isLoading: fuelLoading } = useQuery({ queryKey: ["fuel-logs"], queryFn: getFuelLogs }); 
  const { data: expenses = [], isLoading: expenseLoading } = useQuery({ queryKey: ["expenses"], queryFn: getExpenses }); 
  
  const refresh = () => { 
    ["fuel-logs", "expenses", "dashboard-kpis"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })); 
  };
  
  const addFuel = useMutation({ 
    mutationFn: createFuelLog, 
    onSuccess: () => { 
      toast.success("Fuel log added"); 
      setMode(null); 
      fuelForm.reset({ vehicleId: "", liters: 0, cost: 0, date: today() }); 
      refresh(); 
    }, 
    onError: (e) => toast.error(e instanceof Error ? e.message : "Unable to save fuel log") 
  }); 
  
  const addExpense = useMutation({ 
    mutationFn: createExpense, 
    onSuccess: () => { 
      toast.success("Expense added"); 
      setMode(null); 
      expenseForm.reset({ vehicleId: "", type: "TOLL", amount: 0, date: today(), description: "" }); 
      refresh(); 
    }, 
    onError: (e) => toast.error(e instanceof Error ? e.message : "Unable to save expense") 
  });
  
  const maintenanceExpenses = expenses.filter(e => e.type === "MAINTENANCE");
  const maintenanceTotal = maintenanceExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">Fuel & Expense Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => setMode("fuel")} className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 shadow-md transition-colors" size="lg">
            <Plus className="mr-2 h-4 w-4" /> Log Fuel
          </Button>
          <Button onClick={() => setMode("expense")} className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 shadow-md transition-colors" size="lg">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {mode === "fuel" && (
        <FormCard title="Log Fuel" onClose={() => setMode(null)}>
          <form className="grid gap-6 md:grid-cols-4" onSubmit={fuelForm.handleSubmit((data) => addFuel.mutate({ ...data, liters: Number(data.liters), cost: Number(data.cost) }))}>
            <VehicleField register={fuelForm.register} error={fuelForm.formState.errors.vehicleId?.message} vehicles={vehicles} />
            <Field label="LITERS"><Input className="h-11" type="number" min="0.01" step="0.01" {...fuelForm.register("liters", { required: true, min: 0.01 })} /></Field>
            <Field label="TOTAL COST"><Input className="h-11" type="number" min="0.01" step="0.01" {...fuelForm.register("cost", { required: true, min: 0.01 })} /></Field>
            <Field label="DATE"><Input className="h-11" type="date" {...fuelForm.register("date")} /></Field>
            <div className="md:col-span-4 pt-2">
              <Button type="submit" size="lg" disabled={addFuel.isPending} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-8">
                {addFuel.isPending ? "Saving..." : "Save Fuel Log"}
              </Button>
            </div>
          </form>
        </FormCard>
      )}

      {mode === "expense" && (
        <FormCard title="Add Expense" onClose={() => setMode(null)}>
          <form className="grid gap-6 md:grid-cols-3" onSubmit={expenseForm.handleSubmit((data) => addExpense.mutate({ ...data, amount: Number(data.amount), description: data.description || undefined }))}>
            <VehicleField register={expenseForm.register} error={expenseForm.formState.errors.vehicleId?.message} vehicles={vehicles} />
            <Field label="EXPENSE TYPE">
              <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...expenseForm.register("type")}>
                <option value="TOLL">Toll</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="AMOUNT"><Input className="h-11" type="number" min="0.01" {...expenseForm.register("amount", { required: true, min: 0.01 })} /></Field>
            <Field label="DATE"><Input className="h-11" type="date" {...expenseForm.register("date")} /></Field>
            <Field label="DESCRIPTION"><Input className="h-11" placeholder="Optional note" {...expenseForm.register("description")} /></Field>
            <div className="md:col-span-3 pt-2">
              <Button type="submit" size="lg" disabled={addExpense.isPending} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-8">
                {addExpense.isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </form>
        </FormCard>
      )}

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">FUEL LOGS</h2>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b bg-muted/30">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4 pl-6">VEHICLE</th>
                    <th className="p-4 text-center">DATE</th>
                    <th className="p-4 text-center">LITERS</th>
                    <th className="p-4 pr-6 text-right">COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fuelLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading fuel logs...</td></tr>
                  ) : fuelLogs.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No fuel logs found.</td></tr>
                  ) : (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-medium text-base">{log.vehicle.registrationNumber || log.vehicle.name}</p>
                        </td>
                        <td className="p-4 text-center text-muted-foreground">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="p-4 text-center font-medium">{log.liters} L</td>
                        <td className="p-4 pr-6 text-right font-medium">₹{log.cost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">OTHER EXPENSES (TOLL / MAINT.)</h2>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b bg-muted/30">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4 pl-6">VEHICLE</th>
                    <th className="p-4 text-center">DATE</th>
                    <th className="p-4 text-center">TYPE</th>
                    <th className="p-4 pr-6 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenseLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading expenses...</td></tr>
                  ) : expenses.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No expenses found.</td></tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-medium text-base">{expense.vehicle.registrationNumber || expense.vehicle.name}</p>
                        </td>
                        <td className="p-4 text-center text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="p-4 text-center font-medium">
                          {expense.type.charAt(0) + expense.type.slice(1).toLowerCase()}
                        </td>
                        <td className="p-4 pr-6 text-right font-medium">₹{expense.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-sm font-medium">
            <div className="text-muted-foreground">
              TOTAL MAINTENANCE OVER LAST 30 DAYS = {maintenanceExpenses.map(e => e.amount).join(" + ") || "0"} = <span className="text-orange-600 dark:text-orange-400 font-bold ml-1">₹{maintenanceTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { 
  return (
    <Card className="shadow-lg border-muted">
      <CardContent className="pt-6">
        <div className="mb-5 flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-muted"><X className="h-5 w-5" /></Button>
        </div>
        {children}
      </CardContent>
    </Card>
  ); 
} 

function Field({ label, children }: { label: string; children: React.ReactNode }) { 
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  ); 
} 

function VehicleField({ register, error, vehicles }: { register: any; error?: string; vehicles: { id: string; name: string; registrationNumber: string }[] }) { 
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">VEHICLE</Label>
      <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("vehicleId", { required: "Select a vehicle" })}>
        <option value="">Select vehicle...</option>
        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>)}
      </select>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  ); 
}
