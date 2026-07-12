import { Router } from "express";
import { body } from "express-validator";
import { ExpenseType, Role } from "@prisma/client";
import * as expenseController from "../controllers/expense.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", expenseController.list);
router.get("/vehicle/:vehicleId/cost", expenseController.getVehicleCost);

router.post(
  "/",
  authorize(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER),
  validate([
    body("vehicleId").notEmpty().withMessage("Vehicle is required"),
    body("type").isIn(Object.values(ExpenseType)).withMessage("Valid expense type required"),
    body("amount").isFloat({ min: 0 }).withMessage("Valid amount required"),
  ]),
  expenseController.create,
);

export default router;
