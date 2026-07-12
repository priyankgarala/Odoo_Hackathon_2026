import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as maintenanceController from "../controllers/maintenance.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", maintenanceController.list);

router.post(
  "/",
  authorize(Role.FLEET_MANAGER),
  validate([
    body("vehicleId").notEmpty().withMessage("Vehicle is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ]),
  maintenanceController.create,
);

router.patch(
  "/:id/close",
  authorize(Role.FLEET_MANAGER),
  maintenanceController.close,
);

export default router;
