import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as tripController from "../controllers/trip.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize(Role.FLEET_MANAGER), tripController.list);
router.get("/mine", authorize(Role.DRIVER), tripController.listMine);
router.get("/:id", authorize(Role.FLEET_MANAGER), tripController.getById);

router.post(
  "/",
  authorize(Role.FLEET_MANAGER),
  validate([
    body("source").notEmpty().withMessage("Source is required"),
    body("destination").notEmpty().withMessage("Destination is required"),
    body("cargoWeight").isFloat({ min: 0 }).withMessage("Valid cargo weight required"),
    body("plannedDistance").isFloat({ min: 0 }).withMessage("Valid planned distance required"),
    body("vehicleId").notEmpty().withMessage("Vehicle is required"),
    body("driverId").notEmpty().withMessage("Driver is required"),
  ]),
  tripController.create,
);

router.patch(
  "/:id/dispatch",
  authorize(Role.FLEET_MANAGER),
  tripController.dispatch,
);

router.patch(
  "/:id/complete",
  authorize(Role.FLEET_MANAGER),
  validate([
    body("finalOdometer").isFloat({ min: 0 }).withMessage("Valid final odometer required"),
    body("fuelConsumed").isFloat({ min: 0 }).withMessage("Valid fuel consumed required"),
  ]),
  tripController.complete,
);

router.patch(
  "/:id/cancel",
  authorize(Role.FLEET_MANAGER),
  tripController.cancel,
);

export default router;
