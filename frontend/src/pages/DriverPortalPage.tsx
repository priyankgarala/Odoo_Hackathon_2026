import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Route, Truck, Send } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";
import { socket } from "@/lib/socket";
import type { Trip } from "@/types";

async function getMyTrips() { 
  const { data } = await api.get<Trip[]>("/trips/mine"); 
  return data; 
}

export function DriverPortalPage() {
  useOperationsRealtime(); 
  const { data: trips = [], isLoading, error } = useQuery({ queryKey: ["my-trips"], queryFn: getMyTrips }); 
  const active = trips.find((trip) => trip.status === "DISPATCHED");
  const [location, setLocation] = useState("");

  const handleUpdateLocation = () => {
    if (!active) return;
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    
    socket.emit("driver:location:update", { 
      tripId: active.id, 
      location: location 
    });
    
    toast.success("Location updated successfully");
    setLocation("");
  };

  if (error) return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
      Your account is not linked to a driver profile yet. Ask a Fleet Manager to link it before using the driver portal.
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">My Trips</h2>
        <p className="mt-1 text-muted-foreground">Your assigned routes update live as they are dispatched.</p>
      </div>

      {active ? (
        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Active Delivery</p>
                <h3 className="mt-2 flex items-center gap-2 text-2xl font-bold">
                  <MapPin className="h-6 w-6 text-blue-500" />
                  {active.source} &rarr; {active.destination}
                </h3>
              </div>
            </div>
            
            <div className="mt-6 grid gap-6 sm:grid-cols-3 p-4 bg-muted/30 rounded-lg">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vehicle</span>
                <p className="mt-1 font-medium">{active.vehicle.name}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cargo</span>
                <p className="mt-1 font-medium">{active.cargoWeight} kg</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Distance</span>
                <p className="mt-1 font-medium">{active.plannedDistance} km</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Update Location</p>
              <div className="flex gap-3">
                <Input 
                  placeholder="e.g. Highway 45, entering city limits..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUpdateLocation} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Truck className="h-12 w-12 text-slate-300 mb-4" />
            <p className="font-medium text-lg">No active trip assigned</p>
            <p className="text-sm">You are currently waiting for dispatch.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 font-bold uppercase tracking-wider text-sm text-muted-foreground">Trip History</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your trips...</p>
          ) : (
            <div className="space-y-3">
              {trips.filter(t => t.status !== "DISPATCHED").map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-card">
                  <span className="flex items-center gap-2 font-semibold">
                    <Route className="h-4 w-4 text-slate-400" />
                    {trip.source} &rarr; {trip.destination}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 sm:mt-0">
                    {trip.status}
                  </span>
                </div>
              ))}
              {trips.length === 0 && <p className="text-sm text-muted-foreground">No trips assigned yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
