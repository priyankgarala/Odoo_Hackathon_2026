import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";

const realtimeKeys = ["dashboard-kpis", "vehicles", "drivers", "trips", "my-trips", "maintenance", "maintenance-vehicles", "available-vehicles", "available-drivers", "fuel-logs", "expenses", "analytics"];

export function useOperationsRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => { realtimeKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })); };
    socket.on("operations:update", refresh);
    socket.connect();
    return () => { socket.off("operations:update", refresh); socket.disconnect(); };
  }, [queryClient]);
}
