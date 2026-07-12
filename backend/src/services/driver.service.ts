import { DriverStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listDrivers(filters?: { status?: DriverStatus }) {
  return prisma.driver.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvailableDrivers() {
  const now = new Date();
  return prisma.driver.findMany({
    where: {
      status: DriverStatus.AVAILABLE,
      licenseExpiry: { gt: now },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDriverById(id: string) {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, "Driver not found");
  return driver;
}

export async function createDriver(data: {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: Date;
  contactNumber: string;
  safetyScore?: number;
}) {
  return prisma.driver.create({ data });
}

export async function updateDriver(
  id: string,
  data: Partial<{
    name: string;
    licenseCategory: string;
    licenseExpiry: Date;
    contactNumber: string;
    safetyScore: number;
    status: DriverStatus;
  }>,
) {
  await getDriverById(id);
  return prisma.driver.update({ where: { id }, data });
}

export async function deleteDriver(id: string) {
  await getDriverById(id);
  return prisma.driver.delete({ where: { id } });
}
