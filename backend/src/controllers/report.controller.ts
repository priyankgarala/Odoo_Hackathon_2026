import { Request, Response, NextFunction } from "express";
import * as reportService from "../services/report.service.js";

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await reportService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(_req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await reportService.exportAnalyticsCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="transitops-report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
