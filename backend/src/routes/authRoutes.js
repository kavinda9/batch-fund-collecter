import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import authController from "../controllers/authController.js";

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    authController.getProfile
);

export default router;