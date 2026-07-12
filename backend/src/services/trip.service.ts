import {
  DriverStatus,
  TripStatus,
  VehicleStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

async function validateTripAssignment(
  vehicleId: string,
  driverId: string,
  cargoWeight: number,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new AppError(404, "Vehicle not found");

  if (vehicle.status !== VehicleStatus.AVAILABLE) {
    throw new AppError(400, "Vehicle is not available for dispatch");
  }

  if (cargoWeight > vehicle.maxLoadCapacity) {
    throw new AppError(
      400,
      `Cargo weight exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`,
    );
  }

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw new AppError(404, "Driver not found");

  if (driver.status === DriverStatus.SUSPENDED) {
    throw new AppError(400, "Suspended drivers cannot be assigned to trips");
  }

  if (driver.status !== DriverStatus.AVAILABLE) {
    throw new AppError(400, "Driver is not available for dispatch");
  }

  if (driver.licenseExpiry < new Date()) {
    throw new AppError(400, "Driver license has expired");
  }

  return { vehicle, driver };
}

export async function listTrips(filters?: { status?: TripStatus }) {
  return prisma.trip.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
    },
    include: { vehicle: true, driver: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripById(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw new AppError(404, "Trip not found");
  return trip;
}

export async function createTrip(data: {
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  vehicleId: string;
  driverId: string;
  createdById: string;
}) {
  await validateTripAssignment(data.vehicleId, data.driverId, data.cargoWeight);

  return prisma.trip.create({
    data: {
      ...data,
      status: TripStatus.DRAFT,
    },
    include: { vehicle: true, driver: true },
  });
}

export async function dispatchTrip(id: string) {
  const trip = await getTripById(id);

  if (trip.status !== TripStatus.DRAFT) {
    throw new AppError(400, "Only draft trips can be dispatched");
  }

  await validateTripAssignment(trip.vehicleId, trip.driverId, trip.cargoWeight);

  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VehicleStatus.ON_TRIP },
    });
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.ON_TRIP },
    });

    return tx.trip.update({
      where: { id },
      data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() },
      include: { vehicle: true, driver: true },
    });
  });
}

export async function completeTrip(
  id: string,
  data: { finalOdometer: number; fuelConsumed: number; revenue?: number },
) {
  const trip = await getTripById(id);

  if (trip.status !== TripStatus.DISPATCHED) {
    throw new AppError(400, "Only dispatched trips can be completed");
  }

  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: VehicleStatus.AVAILABLE,
        odometer: data.finalOdometer,
      },
    });
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });

    return tx.trip.update({
      where: { id },
      data: {
        status: TripStatus.COMPLETED,
        finalOdometer: data.finalOdometer,
        fuelConsumed: data.fuelConsumed,
        revenue: data.revenue,
        completedAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });
  });
}

export async function cancelTrip(id: string) {
  const trip = await getTripById(id);

  if (trip.status === TripStatus.COMPLETED) {
    throw new AppError(400, "Completed trips cannot be cancelled");
  }

  if (trip.status === TripStatus.CANCELLED) {
    throw new AppError(400, "Trip is already cancelled");
  }

  return prisma.$transaction(async (tx) => {
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });
    }

    return tx.trip.update({
      where: { id },
      data: { status: TripStatus.CANCELLED },
      include: { vehicle: true, driver: true },
    });
  });
}
