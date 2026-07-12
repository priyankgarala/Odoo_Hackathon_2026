import { TripStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getVehicleOperationalCost } from "./expense.service.js";

export async function getAnalytics() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { not: "RETIRED" } },
    include: {
      trips: { where: { status: TripStatus.COMPLETED } },
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });

  const vehicleAnalytics = await Promise.all(
    vehicles.map(async (vehicle) => {
      const costs = await getVehicleOperationalCost(vehicle.id);

      const completedTrips = vehicle.trips;
      const totalDistance = completedTrips.reduce(
        (sum, trip) => sum + trip.plannedDistance,
        0,
      );
      const totalFuel = completedTrips.reduce(
        (sum, trip) => sum + (trip.fuelConsumed ?? 0),
        0,
      );
      const totalRevenue = completedTrips.reduce(
        (sum, trip) => sum + (trip.revenue ?? 0),
        0,
      );

      const fuelEfficiency =
        totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : 0;

      const roi =
        vehicle.acquisitionCost > 0
          ? Number(
              (
                (totalRevenue - costs.totalOperationalCost) /
                vehicle.acquisitionCost
              ).toFixed(4),
            )
          : 0;

      return {
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        fuelEfficiency,
        operationalCost: costs.totalOperationalCost,
        roi,
        totalDistance,
        totalRevenue,
      };
    }),
  );

  const avgFuelEfficiency =
    vehicleAnalytics.length > 0
      ? Number(
          (
            vehicleAnalytics.reduce((s, v) => s + v.fuelEfficiency, 0) /
            vehicleAnalytics.length
          ).toFixed(2),
        )
      : 0;

  const totalOperationalCost = vehicleAnalytics.reduce(
    (s, v) => s + v.operationalCost,
    0,
  );

  return {
    fleetSummary: {
      avgFuelEfficiency,
      totalOperationalCost,
      vehicleCount: vehicles.length,
    },
    vehicles: vehicleAnalytics,
  };
}

export async function exportAnalyticsCsv() {
  const analytics = await getAnalytics();
  const headers = [
    "Registration Number",
    "Vehicle Name",
    "Fuel Efficiency (km/L)",
    "Operational Cost",
    "ROI",
    "Total Distance",
    "Total Revenue",
  ];

  const rows = analytics.vehicles.map((v) =>
    [
      v.registrationNumber,
      v.name,
      v.fuelEfficiency,
      v.operationalCost,
      v.roi,
      v.totalDistance,
      v.totalRevenue,
    ].join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
