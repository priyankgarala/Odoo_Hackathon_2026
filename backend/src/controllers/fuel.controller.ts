import { Request, Response, NextFunction } from "express";
import * as fuelService from "../services/fuel.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await fuelService.listFuelLogs(
      req.query.vehicleId as string | undefined,
    );
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await fuelService.createFuelLog({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}
