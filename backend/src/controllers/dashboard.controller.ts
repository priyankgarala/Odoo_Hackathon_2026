import { Request, Response, NextFunction } from "express";
import { VehicleStatus } from "@prisma/client";
import * as dashboardService from "../services/dashboard.service.js";

export async function getKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const kpis = await dashboardService.getDashboardKpis({
      type: req.query.type as string | undefined,
      status: req.query.status as VehicleStatus | undefined,
      region: req.query.region as string | undefined,
    });
    res.json(kpis);
  } catch (err) {
    next(err);
  }
}
