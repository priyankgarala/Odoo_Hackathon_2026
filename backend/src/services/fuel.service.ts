import { prisma } from "../lib/prisma.js";
import { getVehicleById } from "./vehicle.service.js";

export async function listFuelLogs(vehicleId?: string) {
  return prisma.fuelLog.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { vehicle: true, trip: true },
    orderBy: { date: "desc" },
  });
}

export async function createFuelLog(data: {
  vehicleId: string;
  liters: number;
  cost: number;
  date?: Date;
  tripId?: string;
}) {
  await getVehicleById(data.vehicleId);

  return prisma.fuelLog.create({
    data: {
      vehicleId: data.vehicleId,
      liters: data.liters,
      cost: data.cost,
      date: data.date ?? new Date(),
      tripId: data.tripId,
    },
    include: { vehicle: true },
  });
}
