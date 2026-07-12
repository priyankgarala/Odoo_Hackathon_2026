import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MapPin, X } from "lucide-react";
import toast from "react-hot-toast";
import { getAvailableDrivers } from "@/api/drivers";
import { cancelTrip, completeTrip, createTrip, dispatchTrip, getTrips, type CompleteTripPayload, type TripPayload } from "@/api/trips";
import { getAvailableVehicles } from "@/api/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRIP_STATUS_LABELS, type Trip, type TripStatus } from "@/types";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";
import { socket } from "@/lib/socket";

const statuses: TripStatus[] = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];
const emptyTrip: TripPayload = { source: "", destination: "", cargoWeight: 0, plannedDistance: 0, vehicleId: "", driverId: "" };

function TripBadge({ status }: { status: TripStatus }) { 
  const colors: Record<TripStatus, string> = { 
    DRAFT: "bg-slate-500 hover:bg-slate-600 text-white", 
    DISPATCHED: "bg-blue-500 hover:bg-blue-600 text-white", 
    COMPLETED: "bg-emerald-500 hover:bg-emerald-600 text-white", 
    CANCELLED: "bg-red-500 hover:bg-red-600 text-white" 
  }; 
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold shadow-sm transition-colors cursor-default ${colors[status]}`}>
      {TRIP_STATUS_LABELS[status]}
    </span>
  );
}

export function TripsPage() {
  useOperationsRealtime();
  const queryClient = useQueryClient(); 
  const [completing, setCompleting] = useState<Trip | null>(null);
  const [locations, setLocations] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const handleLocationUpdate = (payload: { tripId: string, location: string }) => {
      setLocations(prev => ({ ...prev, [payload.tripId]: payload.location }));
    };
    
    socket.on("driver:location:updated", handleLocationUpdate);
    return () => {
      socket.off("driver:location:updated", handleLocationUpdate);
    };
  }, []);
  
  const { data: trips = [], isLoading } = useQuery({ queryKey: ["trips"], queryFn: () => getTrips() }); 
  const { data: vehicles = [] } = useQuery({ queryKey: ["available-vehicles"], queryFn: getAvailableVehicles }); 
  const { data: drivers = [] } = useQuery({ queryKey: ["available-drivers"], queryFn: getAvailableDrivers });
  
  const tripForm = useForm<TripPayload>({ defaultValues: emptyTrip }); 
  const completeForm = useForm<CompleteTripPayload>(); 
  
  const refresh = () => { 
    queryClient.invalidateQueries({ queryKey: ["trips"] }); 
    queryClient.invalidateQueries({ queryKey: ["available-vehicles"] }); 
    queryClient.invalidateQueries({ queryKey: ["available-drivers"] }); 
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] }); 
  };
  
  const create = useMutation({ 
    mutationFn: createTrip, 
    onSuccess: () => { 
      toast.success("Trip saved as draft"); 
      tripForm.reset(emptyTrip); 
      refresh(); 
    }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create trip") 
  }); 
  
  const dispatch = useMutation({ 
    mutationFn: dispatchTrip, 
    onSuccess: () => { 
      toast.success("Trip dispatched; driver and vehicle are now on trip"); 
      refresh(); 
    }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to dispatch trip") 
  }); 
  
  const cancel = useMutation({ 
    mutationFn: cancelTrip, 
    onSuccess: () => { 
      toast.success("Trip cancelled"); 
      refresh(); 
    }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to cancel trip") 
  }); 
  
  const complete = useMutation({ 
    mutationFn: ({ id, data }: { id: string; data: CompleteTripPayload }) => completeTrip(id, data), 
    onSuccess: () => { 
      toast.success("Trip completed and resources released"); 
      setCompleting(null); 
      refresh(); 
    }, 
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to complete trip") 
  });
  
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === tripForm.watch("vehicleId"));
  const cargoWeightStr = tripForm.watch("cargoWeight");
  const cargoWeight = typeof cargoWeightStr === "number" ? cargoWeightStr : Number(cargoWeightStr) || 0;
  
  const isCapacityExceeded = selectedVehicle ? cargoWeight > selectedVehicle.maxLoadCapacity : false;
  const capacityDiff = selectedVehicle ? cargoWeight - selectedVehicle.maxLoadCapacity : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">4. Trip Dispatcher</h1>
      
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        
        {/* Left Column: CREATE TRIP */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">TRIP LIFECYCLE</h2>
            <div className="flex items-center gap-2 pt-2 pb-4">
              <div className="flex flex-col items-center">
                <div className="h-7 w-7 rounded-full bg-slate-500 border-[3px] border-background shadow-sm flex items-center justify-center text-[10px] font-bold text-white z-10">1</div>
                <span className="text-[10px] font-bold mt-1.5 text-slate-600 dark:text-slate-400 uppercase tracking-wide">Draft</span>
              </div>
              <div className="h-0.5 flex-1 bg-muted/70 -mt-6"></div>
              <div className="flex flex-col items-center">
                <div className="h-7 w-7 rounded-full bg-blue-500 border-[3px] border-background shadow-sm flex items-center justify-center text-[10px] font-bold text-white z-10">2</div>
                <span className="text-[10px] font-bold mt-1.5 text-blue-600 dark:text-blue-400 uppercase tracking-wide">Dispatched</span>
              </div>
              <div className="h-0.5 flex-1 bg-muted/70 -mt-6"></div>
              <div className="flex flex-col items-center">
                <div className="h-7 w-7 rounded-full bg-emerald-500 border-[3px] border-background shadow-sm flex items-center justify-center text-[10px] font-bold text-white z-10">3</div>
                <span className="text-[10px] font-bold mt-1.5 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Completed</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">CREATE TRIP</h2>
            
            <form className="space-y-4" onSubmit={tripForm.handleSubmit((data) => {
              if (isCapacityExceeded) return;
              create.mutate({ ...data, cargoWeight: Number(data.cargoWeight), plannedDistance: Number(data.plannedDistance) })
            })}>
              <Field label="SOURCE" error={tripForm.formState.errors.source?.message}>
                <Input className="h-11" placeholder="Gandhinagar Depot" {...tripForm.register("source", { required: "Required" })} />
              </Field>
              
              <Field label="DESTINATION" error={tripForm.formState.errors.destination?.message}>
                <Input className="h-11" placeholder="Ahmedabad Hub" {...tripForm.register("destination", { required: "Required" })} />
              </Field>
              
              <Field label="VEHICLE (AVAILABLE ONLY)" error={tripForm.formState.errors.vehicleId?.message}>
                <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...tripForm.register("vehicleId", { required: "Required" })}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.name} · {vehicle.registrationNumber} ({vehicle.maxLoadCapacity} kg capacity)</option>
                  ))}
                </select>
              </Field>
              
              <Field label="DRIVER (AVAILABLE ONLY)" error={tripForm.formState.errors.driverId?.message}>
                <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...tripForm.register("driverId", { required: "Required" })}>
                  <option value="">Select driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name} · {driver.licenseCategory}</option>
                  ))}
                </select>
              </Field>
              
              <Field label="CARGO WEIGHT (KG)" error={tripForm.formState.errors.cargoWeight?.message}>
                <Input className="h-11" type="number" min="1" placeholder="900" {...tripForm.register("cargoWeight", { required: "Required", min: { value: 1, message: "Must be above 0" } })} />
              </Field>
              
              <Field label="PLANNED DISTANCE (KM)" error={tripForm.formState.errors.plannedDistance?.message}>
                <Input className="h-11" type="number" min="1" placeholder="38" {...tripForm.register("plannedDistance", { required: "Required", min: { value: 1, message: "Must be above 0" } })} />
              </Field>

              {/* Validation Box matching mockup */}
              {selectedVehicle && (
                <div className={`p-4 rounded-md border text-sm transition-colors mt-2 ${
                  isCapacityExceeded 
                    ? "bg-red-50/50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300" 
                    : "bg-muted/30 border-border text-muted-foreground"
                }`}>
                  <div className="font-medium">Vehicle Capacity: {selectedVehicle.maxLoadCapacity} kg</div>
                  <div>Cargo Weight: {cargoWeight} kg</div>
                  {isCapacityExceeded && (
                    <div className="text-red-600 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1.5">
                      <X className="h-4 w-4 stroke-[3]" /> 
                      Capacity exceeded by {capacityDiff} kg &rarr; dispatch blocked
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={create.isPending || isCapacityExceeded} className={`flex-1 h-12 text-base font-semibold transition-colors ${
                  isCapacityExceeded ? "bg-muted text-muted-foreground opacity-70" : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}>
                  {create.isPending ? "Saving..." : isCapacityExceeded ? "Save (Disabled)" : "Save Draft"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-12 text-base font-semibold" onClick={() => tripForm.reset(emptyTrip)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: LIVE BOARD */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">LIVE BOARD</h2>
          
          {completing && (
            <Card className="border-emerald-200 shadow-md mb-6 bg-emerald-50/30">
              <CardContent className="pt-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-900">Complete Trip</h3>
                    <p className="text-sm text-emerald-700 mt-1 font-medium">{completing.source} &rarr; {completing.destination}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-emerald-100" onClick={() => setCompleting(null)}><X className="h-5 w-5" /></Button>
                </div>
                <form className="grid gap-4 md:grid-cols-3" onSubmit={completeForm.handleSubmit((data) => complete.mutate({ id: completing.id, data: { ...data, finalOdometer: Number(data.finalOdometer), fuelConsumed: Number(data.fuelConsumed), revenue: data.revenue ? Number(data.revenue) : undefined } }))}>
                  <Field label="FINAL ODOMETER"><Input className="h-11 border-emerald-200 focus-visible:ring-emerald-500" type="number" min={completing.vehicle.odometer} {...completeForm.register("finalOdometer", { required: true })} /></Field>
                  <Field label="FUEL CONSUMED (L)"><Input className="h-11 border-emerald-200 focus-visible:ring-emerald-500" type="number" min="0" step="0.01" {...completeForm.register("fuelConsumed", { required: true })} /></Field>
                  <Field label="REVENUE (OPTIONAL)"><Input className="h-11 border-emerald-200 focus-visible:ring-emerald-500" type="number" min="0" {...completeForm.register("revenue")} /></Field>
                  <div className="md:col-span-3 pt-2">
                    <Button type="submit" disabled={complete.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold">
                      <CheckCircle2 className="h-5 w-5 mr-2" /> {complete.isPending ? "Completing..." : "Complete Trip"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">Loading trips...</div>
            ) : trips.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">No trips on the live board yet.</div>
            ) : (
              trips.map((trip) => (
                <div key={trip.id} className="p-5 rounded-xl border bg-card shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors hover:bg-muted/30">
                  <div className="space-y-2.5">
                    <div className="font-bold text-sm tracking-wider text-muted-foreground">
                      TRIP-{trip.id.substring(0, 4).toUpperCase()}
                    </div>
                    <div className="font-bold text-lg leading-tight">
                      {trip.source} &rarr; {trip.destination}
                    </div>
                    <div>
                      <TripBadge status={trip.status} />
                    </div>
                    {locations[trip.id] && trip.status === "DISPATCHED" && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 mt-2">
                        <MapPin className="h-4 w-4" />
                        {locations[trip.id]}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:items-end justify-between gap-3 text-sm">
                    <div className="font-medium text-foreground sm:text-right">
                      {trip.vehicle.registrationNumber || trip.vehicle.name} / {trip.driver.name}
                    </div>
                    
                    <div className="text-muted-foreground sm:text-right font-medium">
                      {trip.status === "DRAFT" && "Awaiting driver dispatch"}
                      {trip.status === "DISPATCHED" && "On route"}
                      {trip.status === "CANCELLED" && "Cancelled, vehicle unassigned"}
                      {trip.status === "COMPLETED" && "Completed successfully"}
                    </div>
                    
                    <div className="flex gap-2">
                      {trip.status === "DRAFT" && (
                        <>
                          <Button size="sm" onClick={() => dispatch.mutate(trip.id)} disabled={dispatch.isPending} className="h-9 bg-blue-500 hover:bg-blue-600 text-white font-semibold">Dispatch</Button>
                          <Button size="sm" variant="ghost" onClick={() => cancel.mutate(trip.id)} className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold">Cancel</Button>
                        </>
                      )}
                      {trip.status === "DISPATCHED" && (
                        <>
                          <Button size="sm" onClick={() => { setCompleting(trip); completeForm.reset({ finalOdometer: trip.vehicle.odometer, fuelConsumed: 0 }); }} className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Complete</Button>
                          <Button size="sm" variant="ghost" onClick={() => cancel.mutate(trip.id)} className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold">Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
