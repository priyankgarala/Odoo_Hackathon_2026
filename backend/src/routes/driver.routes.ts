import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as driverController from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/", driverController.list);
router.get("/available", driverController.listAvailable);
router.get("/:id", driverController.getById);

router.post(
  "/",
  authorize(Role.SAFETY_OFFICER, Role.FLEET_MANAGER),
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("licenseNumber").notEmpty().withMessage("License number required"),
    body("licenseCategory").notEmpty().withMessage("License category required"),
    body("licenseExpiry").isISO8601().withMessage("Valid license expiry date required"),
    body("contactNumber").notEmpty().withMessage("Contact number required"),
  ]),
  driverController.create,
);

router.put(
  "/:id",
  authorize(Role.SAFETY_OFFICER, Role.FLEET_MANAGER),
  driverController.update,
);
router.delete(
  "/:id",
  authorize(Role.SAFETY_OFFICER, Role.FLEET_MANAGER),
  driverController.remove,
);

export default router;
