import {
  DriverStatus,
  TripStatus,
  VehicleStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function getDashboardKpis(filters?: {
  type?: string;
  status?: VehicleStatus;
  region?: string;
}) {
  const vehicleWhere = {
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.region && { region: filters.region }),
  };

  const [
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalVehicles,
    vehiclesOnTrip,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: { ...vehicleWhere, status: { not: VehicleStatus.RETIRED } },
    }),
    prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.AVAILABLE },
    }),
    prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.IN_SHOP },
    }),
    prisma.trip.count({ where: { status: TripStatus.DISPATCHED } }),
    prisma.trip.count({ where: { status: TripStatus.DRAFT } }),
    prisma.driver.count({ where: { status: DriverStatus.ON_TRIP } }),
    prisma.vehicle.count({
      where: { ...vehicleWhere, status: { not: VehicleStatus.RETIRED } },
    }),
    prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.ON_TRIP },
    }),
  ]);

  const fleetUtilization =
    totalVehicles > 0 ? Math.round((vehiclesOnTrip / totalVehicles) * 100) : 0;

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}
