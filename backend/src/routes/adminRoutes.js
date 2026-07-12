import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyToken);
router.use(adminMiddleware);

// ── Dashboard & Settings ─────────────────────
router.get("/dashboard", adminController.getDashboard);
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// ── Member / Student Management ──────────────
router.post("/students/payments", adminController.addStudentPayment);
router.delete("/students/:id", adminController.deleteStudentRecord);

// ── Expense Management ───────────────────────
router.get("/expenses", adminController.getExpenses);
router.post("/expenses", adminController.addExpense);
router.delete("/expenses/:id", adminController.deleteExpenseRecord);

// ── Event Management ─────────────────────────
router.get("/events", adminController.getEvents);
router.post("/events", adminController.addEvent);

export default router;
