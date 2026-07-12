import { ExpenseType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { getVehicleById } from "./vehicle.service.js";
import { emitOperationsUpdate } from "../lib/socket.js";

export async function listExpenses(vehicleId?: string) {
  return prisma.expense.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(data: {
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  date?: Date;
  description?: string;
}) {
  await getVehicleById(data.vehicleId);

  const expense = await prisma.expense.create({
    data: {
      vehicleId: data.vehicleId,
      type: data.type,
      amount: data.amount,
      date: data.date ?? new Date(),
      description: data.description,
    },
    include: { vehicle: true },
  });
  emitOperationsUpdate("expense.logged", { expenseId: expense.id, vehicleId: expense.vehicleId });
  return expense;
}

export async function getVehicleOperationalCost(vehicleId: string) {
  const [fuelAgg, maintenanceAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    }),
    prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    }),
    prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
    }),
  ]);

  const fuelCost = fuelAgg._sum.cost ?? 0;
  const maintenanceCost = maintenanceAgg._sum.cost ?? 0;
  const otherExpenses = expenseAgg._sum.amount ?? 0;

  return {
    fuelCost,
    maintenanceCost,
    otherExpenses,
    totalOperationalCost: fuelCost + maintenanceCost + otherExpenses,
  };
}
