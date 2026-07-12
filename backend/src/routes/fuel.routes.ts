import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as fuelController from "../controllers/fuel.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", fuelController.list);

router.post(
  "/",
  authorize(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER),
  validate([
    body("vehicleId").notEmpty().withMessage("Vehicle is required"),
    body("liters").isFloat({ min: 0 }).withMessage("Valid liters required"),
    body("cost").isFloat({ min: 0 }).withMessage("Valid cost required"),
  ]),
  fuelController.create,
);

export default router;
