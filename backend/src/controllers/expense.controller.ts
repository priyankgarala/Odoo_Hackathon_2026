import { Request, Response, NextFunction } from "express";
import * as expenseService from "../services/expense.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const expenses = await expenseService.listExpenses(
      req.query.vehicleId as string | undefined,
    );
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expenseService.createExpense({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleCost(req: Request, res: Response, next: NextFunction) {
  try {
    const cost = await expenseService.getVehicleOperationalCost(req.params.vehicleId as string);
    res.json(cost);
  } catch (err) {
    next(err);
  }
}
