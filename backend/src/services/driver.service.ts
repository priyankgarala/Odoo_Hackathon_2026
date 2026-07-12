import { DriverStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { emitOperationsUpdate } from "../lib/socket.js";

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
  const driver = await prisma.driver.create({ data });
  emitOperationsUpdate("driver.created", { driverId: driver.id });
  return driver;
}

export async function onboardDriver(data: {
  name: string; licenseNumber: string; licenseCategory: string; licenseExpiry: Date; contactNumber: string; safetyScore?: number; email: string; password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email already registered");
  const passwordHash = await bcrypt.hash(data.password, 10);
  const driver = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email: data.email, passwordHash, name: data.name, role: Role.DRIVER } });
    return tx.driver.create({ data: { name: data.name, licenseNumber: data.licenseNumber, licenseCategory: data.licenseCategory, licenseExpiry: data.licenseExpiry, contactNumber: data.contactNumber, safetyScore: data.safetyScore, userId: user.id } });
  });
  emitOperationsUpdate("driver.onboarded", { driverId: driver.id, userId: driver.userId! });
  return driver;
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
  const driver = await getDriverById(id);
  if (data.status && data.status !== driver.status) {
    if (driver.status === DriverStatus.ON_TRIP) {
      throw new AppError(400, "Driver status is controlled by the trip workflow while on a trip");
    }
    if (data.status === DriverStatus.ON_TRIP) {
      throw new AppError(400, "Only dispatching a trip can set a driver to On Trip");
    }
  }
  const updatedDriver = await prisma.driver.update({ where: { id }, data });
  emitOperationsUpdate("driver.updated", { driverId: updatedDriver.id });
  return updatedDriver;
}

export async function deleteDriver(id: string) {
  await getDriverById(id);
  const driver = await prisma.driver.delete({ where: { id } });
  emitOperationsUpdate("driver.deleted", { driverId: id });
  return driver;
}
