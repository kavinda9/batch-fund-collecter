import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

// ── Dashboard Stats ──────────────────────────
router.get("/stats", adminController.getStats);

// ── Slip Review ──────────────────────────────
router.get("/slips", adminController.getAllSlips);
router.patch("/slips/:id/approve", adminController.approveSlip);
router.patch("/slips/:id/reject", adminController.rejectSlip);

// ── Member Management ────────────────────────
router.get("/members", adminController.getMembers);
router.delete("/members/:uid", adminController.deleteMember);

// ── Expense Management ───────────────────────
router.get("/expenses", adminController.getExpenses);
router.post("/expenses", adminController.createExpense);
router.delete("/expenses/:id", adminController.deleteExpense);

// ── Event Management ─────────────────────────
router.get("/events", adminController.getEvents);
router.post("/events", adminController.createEvent);
router.delete("/events/:id", adminController.deleteEvent);

// ── Announcement Management ──────────────────
router.post("/announcements", adminController.createAnnouncement);
router.delete("/announcements/:id", adminController.deleteAnnouncement);

export default router;
