import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as vehicleController from "../controllers/vehicle.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", vehicleController.list);
router.get("/available", vehicleController.listAvailable);
router.get("/:id", vehicleController.getById);

router.post(
  "/",
  authorize(Role.FLEET_MANAGER),
  validate([
    body("registrationNumber").notEmpty().withMessage("Registration number required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("maxLoadCapacity").isFloat({ min: 0 }).withMessage("Valid max load capacity required"),
    body("acquisitionCost").isFloat({ min: 0 }).withMessage("Valid acquisition cost required"),
  ]),
  vehicleController.create,
);

router.put("/:id", authorize(Role.FLEET_MANAGER), vehicleController.update);
router.delete("/:id", authorize(Role.FLEET_MANAGER), vehicleController.remove);

export default router;
