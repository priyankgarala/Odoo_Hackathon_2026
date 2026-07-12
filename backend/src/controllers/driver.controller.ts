import { Request, Response, NextFunction } from "express";
import { DriverStatus } from "@prisma/client";
import * as driverService from "../services/driver.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const drivers = await driverService.listDrivers({
      status: req.query.status as DriverStatus | undefined,
    });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
}

export async function listAvailable(_req: Request, res: Response, next: NextFunction) {
  try {
    const drivers = await driverService.getAvailableDrivers();
    res.json(drivers);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await driverService.getDriverById(req.params.id as string);
    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await driverService.createDriver({
      ...req.body,
      licenseExpiry: new Date(req.body.licenseExpiry),
    });
    res.status(201).json(driver);
  } catch (err) {
    next(err);
  }
}

export async function onboard(req: Request, res: Response, next: NextFunction) {
  try { const driver = await driverService.onboardDriver({ ...req.body, licenseExpiry: new Date(req.body.licenseExpiry) }); res.status(201).json(driver); } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body };
    if (data.licenseExpiry) {
      data.licenseExpiry = new Date(data.licenseExpiry);
    }
    const driver = await driverService.updateDriver(req.params.id as string, data);
    res.json(driver);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await driverService.deleteDriver(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
