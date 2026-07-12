import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "../services/maintenance.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await maintenanceService.listMaintenanceLogs(
      req.query.vehicleId as string | undefined,
    );
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await maintenanceService.createMaintenanceLog({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

export async function close(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await maintenanceService.closeMaintenanceLog(req.params.id as string);
    res.json(log);
  } catch (err) {
    next(err);
  }
}
