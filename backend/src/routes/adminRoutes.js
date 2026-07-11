import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyToken);
router.use(adminMiddleware);

router.get("/dashboard", adminController.getDashboard);
router.get("/students", adminController.getStudents);
router.post("/students/payments", adminController.addStudentPayment);
router.delete("/students/:id", adminController.deleteStudentRecord);
router.get("/expenses", adminController.getExpenses);
router.post("/expenses", adminController.addExpense);
router.delete("/expenses/:id", adminController.deleteExpenseRecord);
router.get("/events", adminController.getEvents);
router.post("/events", adminController.addEvent);
router.get("/income", adminController.getIncomeRecords);
router.get("/activities", adminController.getActivities);
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

export default router;