import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    // Registration remains available only for initial setup when no valid session exists.
  }
  next();
}
