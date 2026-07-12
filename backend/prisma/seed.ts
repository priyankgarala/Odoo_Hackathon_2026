import bcrypt from "bcrypt";
import { PrismaClient, DriverStatus, ExpenseType, MaintenanceStatus, Role, TripStatus, VehicleStatus } from "@prisma/client";

const prisma = new PrismaClient();
const future = new Date("2027-12-31T00:00:00.000Z");

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({ where: { email: "admin@transitops.com" }, update: {}, create: { email: "admin@transitops.com", name: "Fleet Admin", passwordHash, role: Role.FLEET_MANAGER } });
  const driverUser = await prisma.user.upsert({ where: { email: "alex@transitops.com" }, update: {}, create: { email: "alex@transitops.com", name: "Alex Morgan", passwordHash, role: Role.DRIVER } });
  const alex = await prisma.driver.upsert({ where: { licenseNumber: "DL-AX-2026-001" }, update: { userId: driverUser.id, status: DriverStatus.AVAILABLE }, create: { name: "Alex Morgan", licenseNumber: "DL-AX-2026-001", licenseCategory: "LMV", licenseExpiry: future, contactNumber: "+91 98765 43210", safetyScore: 94, status: DriverStatus.AVAILABLE, userId: driverUser.id } });
  const priya = await prisma.driver.upsert({ where: { licenseNumber: "DL-PR-2026-002" }, update: { status: DriverStatus.ON_TRIP }, create: { name: "Priya Shah", licenseNumber: "DL-PR-2026-002", licenseCategory: "HMV", licenseExpiry: future, contactNumber: "+91 98765 43211", safetyScore: 89, status: DriverStatus.ON_TRIP } });
  const van = await prisma.vehicle.upsert({ where: { registrationNumber: "MH-01-VAN-05" }, update: { status: VehicleStatus.AVAILABLE }, create: { registrationNumber: "MH-01-VAN-05", name: "Van-05", type: "Van", maxLoadCapacity: 500, odometer: 24500, acquisitionCost: 850000, status: VehicleStatus.AVAILABLE, region: "West" } });
  const truck = await prisma.vehicle.upsert({ where: { registrationNumber: "MH-02-TRK-10" }, update: { status: VehicleStatus.ON_TRIP }, create: { registrationNumber: "MH-02-TRK-10", name: "Truck-10", type: "Truck", maxLoadCapacity: 5000, odometer: 68200, acquisitionCost: 2600000, status: VehicleStatus.ON_TRIP, region: "North" } });
  const shopVan = await prisma.vehicle.upsert({ where: { registrationNumber: "MH-03-VAN-12" }, update: { status: VehicleStatus.IN_SHOP }, create: { registrationNumber: "MH-03-VAN-12", name: "Van-12", type: "Van", maxLoadCapacity: 800, odometer: 39800, acquisitionCost: 1100000, status: VehicleStatus.IN_SHOP, region: "South" } });
  const completed = await prisma.trip.findFirst({ where: { source: "Mumbai", destination: "Pune", vehicleId: van.id } }) ?? await prisma.trip.create({ data: { source: "Mumbai", destination: "Pune", cargoWeight: 450, plannedDistance: 150, status: TripStatus.COMPLETED, finalOdometer: 24500, fuelConsumed: 18, revenue: 18000, vehicleId: van.id, driverId: alex.id, createdById: admin.id, dispatchedAt: new Date("2026-07-08"), completedAt: new Date("2026-07-08") } });
  await prisma.trip.upsert({ where: { id: "seed-dispatched-trip" }, update: {}, create: { id: "seed-dispatched-trip", source: "Delhi", destination: "Jaipur", cargoWeight: 1800, plannedDistance: 280, status: TripStatus.DISPATCHED, vehicleId: truck.id, driverId: priya.id, createdById: admin.id, dispatchedAt: new Date() } });
  await prisma.trip.upsert({ where: { id: "seed-draft-trip" }, update: {}, create: { id: "seed-draft-trip", source: "Pune", destination: "Nashik", cargoWeight: 300, plannedDistance: 210, status: TripStatus.DRAFT, vehicleId: van.id, driverId: alex.id, createdById: admin.id } });
  if (!await prisma.maintenanceLog.findFirst({ where: { vehicleId: shopVan.id, status: MaintenanceStatus.OPEN } })) await prisma.maintenanceLog.create({ data: { vehicleId: shopVan.id, description: "Oil change and brake inspection", cost: 6500, status: MaintenanceStatus.OPEN } });
  if (!await prisma.fuelLog.findFirst({ where: { vehicleId: van.id, tripId: completed.id } })) await prisma.fuelLog.create({ data: { vehicleId: van.id, tripId: completed.id, liters: 18, cost: 1900, date: new Date("2026-07-08") } });
  if (!await prisma.expense.findFirst({ where: { vehicleId: van.id, type: ExpenseType.TOLL } })) await prisma.expense.create({ data: { vehicleId: van.id, type: ExpenseType.TOLL, amount: 420, description: "Mumbai–Pune Expressway toll" } });
  if (!await prisma.expense.findFirst({ where: { vehicleId: shopVan.id, type: ExpenseType.MAINTENANCE } })) await prisma.expense.create({ data: { vehicleId: shopVan.id, type: ExpenseType.MAINTENANCE, amount: 1200, description: "Replacement oil filter" } });
  console.log("TransitOps demo data seeded.");
}

main().finally(() => prisma.$disconnect());
