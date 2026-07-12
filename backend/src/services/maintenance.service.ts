import { MaintenanceStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { getVehicleById } from "./vehicle.service.js";
import { emitOperationsUpdate } from "../lib/socket.js";

export async function listMaintenanceLogs(vehicleId?: string) {
  return prisma.maintenanceLog.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });
}

export async function createMaintenanceLog(data: {
  vehicleId: string;
  description: string;
  cost?: number;
  date?: Date;
}) {
  const vehicle = await getVehicleById(data.vehicleId);

  if (vehicle.status === VehicleStatus.RETIRED) {
    throw new AppError(400, "Cannot create maintenance for retired vehicles");
  }
  if (vehicle.status === VehicleStatus.ON_TRIP) {
    throw new AppError(400, "Cannot place a vehicle on maintenance while it is on a trip");
  }

  const log = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: VehicleStatus.IN_SHOP },
    });

    return tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        cost: data.cost ?? 0,
        date: data.date ?? new Date(),
        status: MaintenanceStatus.OPEN,
      },
      include: { vehicle: true },
    });
  });
  emitOperationsUpdate("maintenance.opened", { maintenanceId: log.id, vehicleId: log.vehicleId });
  return log;
}

export async function closeMaintenanceLog(id: string) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!log) throw new AppError(404, "Maintenance log not found");
  if (log.status === MaintenanceStatus.CLOSED) {
    throw new AppError(400, "Maintenance log is already closed");
  }

  const updatedLog = await prisma.$transaction(async (tx) => {
    const otherOpenLogs = await tx.maintenanceLog.count({
      where: { vehicleId: log.vehicleId, status: MaintenanceStatus.OPEN, id: { not: id } },
    });
    if (log.vehicle.status !== VehicleStatus.RETIRED && otherOpenLogs === 0) {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });
    }

    return tx.maintenanceLog.update({
      where: { id },
      data: { status: MaintenanceStatus.CLOSED },
      include: { vehicle: true },
    });
  });
  emitOperationsUpdate("maintenance.closed", { maintenanceId: updatedLog.id, vehicleId: updatedLog.vehicleId });
  return updatedLog;
}
