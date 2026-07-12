import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import slipController from "../controllers/slipController.js";

const router = express.Router();

// POST /api/slips/upload — upload a bank slip (authenticated)
router.post(
  "/upload",
  authMiddleware,
  upload.single("slipImage"),
  slipController.uploadSlip
);

// GET /api/slips/my — get own payment history (authenticated)
router.get("/my", authMiddleware, slipController.getMySlips);

export default router;
