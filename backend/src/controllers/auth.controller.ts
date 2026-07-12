import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import * as authService from "../services/auth.service.js";
import { AppError } from "../middleware/errorHandler.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const hasUsers = await authService.hasUsers();
    if (!hasUsers && req.body.role !== Role.FLEET_MANAGER) {
      throw new AppError(400, "The first account must be a Fleet Manager");
    }
    if (hasUsers && req.user?.role !== Role.FLEET_MANAGER) {
      throw new AppError(403, "Only a Fleet Manager can create user accounts");
    }
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, user } = await authService.loginUser(
      req.body.email,
      req.body.password,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
