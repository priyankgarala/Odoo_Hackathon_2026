import { Router } from "express";
import { Role } from "@prisma/client";
import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

router.use(authenticate);

router.get(
  "/analytics",
  authorize(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER),
  reportController.getAnalytics,
);

router.get(
  "/export/csv",
  authorize(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER),
  reportController.exportCsv,
);

export default router;
