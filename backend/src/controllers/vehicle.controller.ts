import { Request, Response, NextFunction } from "express";
import { VehicleStatus } from "@prisma/client";
import * as vehicleService from "../services/vehicle.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicles = await vehicleService.listVehicles({
      type: req.query.type as string | undefined,
      status: req.query.status as VehicleStatus | undefined,
      region: req.query.region as string | undefined,
    });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

export async function listAvailable(_req: Request, res: Response, next: NextFunction) {
  try {
    const vehicles = await vehicleService.getAvailableVehicles();
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id as string);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await vehicleService.deleteVehicle(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
