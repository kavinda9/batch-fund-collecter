import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyToken);
router.use(adminMiddleware);

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
