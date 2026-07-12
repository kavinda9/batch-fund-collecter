import express from "express";
import { body } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";
import authController from "../controllers/authController.js";

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("regNumber").trim().notEmpty().withMessage("Registration number is required"),
  body("degreeProgram").trim().notEmpty().withMessage("Degree program is required"),
  body("batch").trim().notEmpty().withMessage("Batch is required"),
  body("contactNumber").isLength({ min: 10, max: 10 }).isNumeric().withMessage("Contact number must be exactly 10 digits"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post(
    "/register",
    registerValidation,
    authController.register
);

router.post(
    "/login",
    loginValidation,
    authController.login
);

router.get(
    "/profile",
    authMiddleware,
    authController.getProfile
);

router.patch(
    "/profile",
    authMiddleware,
    authController.updateProfile
);

export default router;