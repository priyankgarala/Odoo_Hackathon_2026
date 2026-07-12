import { Request, Response, NextFunction } from "express";
import { TripStatus } from "@prisma/client";
import * as tripService from "../services/trip.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const trips = await tripService.listTrips({
      status: req.query.status as TripStatus | undefined,
    });
    res.json(trips);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try { res.json(await tripService.listMyTrips(req.user!.id)); } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getTripById(req.params.id as string);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.createTrip({
      ...req.body,
      createdById: req.user!.id,
    });
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
}

export async function dispatch(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.dispatchTrip(req.params.id as string);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.completeTrip(req.params.id as string, req.body);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.cancelTrip(req.params.id as string);
    res.json(trip);
  } catch (err) {
    next(err);
  }
}
