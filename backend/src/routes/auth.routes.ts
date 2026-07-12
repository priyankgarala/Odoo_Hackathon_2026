import { Router } from "express";
import { body } from "express-validator";
import { Role } from "@prisma/client";
import * as authController from "../controllers/auth.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  optionalAuthenticate,
  validate([
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("role").isIn(Object.values(Role)).withMessage("Valid role required"),
  ]),
  authController.register,
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  authController.login,
);

router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
