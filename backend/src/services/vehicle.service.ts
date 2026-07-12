import { VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listVehicles(filters?: {
  type?: string;
  status?: VehicleStatus;
  region?: string;
}) {
  return prisma.vehicle.findMany({
    where: {
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.region && { region: filters.region }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: VehicleStatus.AVAILABLE },
    orderBy: { name: "asc" },
  });
}

export async function getVehicleById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError(404, "Vehicle not found");
  return vehicle;
}

export async function createVehicle(data: {
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer?: number;
  acquisitionCost: number;
  region?: string;
}) {
  return prisma.vehicle.create({ data });
}

export async function updateVehicle(
  id: string,
  data: Partial<{
    name: string;
    type: string;
    maxLoadCapacity: number;
    odometer: number;
    acquisitionCost: number;
    status: VehicleStatus;
    region: string;
  }>,
) {
  const vehicle = await getVehicleById(id);
  if (data.status && data.status !== vehicle.status) {
    if (vehicle.status === VehicleStatus.ON_TRIP || vehicle.status === VehicleStatus.IN_SHOP) {
      throw new AppError(400, "Vehicle status is controlled by trip and maintenance workflows");
    }
    if (data.status !== VehicleStatus.RETIRED) {
      throw new AppError(400, "Only available vehicles can be retired manually");
    }
  }
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  await getVehicleById(id);
  return prisma.vehicle.delete({ where: { id } });
}
