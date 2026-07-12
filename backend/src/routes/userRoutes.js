import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js";

const router = express.Router();

// All member/user dashboard routes require authentication
router.use(authMiddleware);

router.get("/stats", userController.getStats);
router.get("/announcements", userController.getAnnouncements);
router.get("/events", userController.getEvents);
router.post("/events/:id/rsvp", userController.toggleRSVP);
router.get("/notifications", userController.getNotifications);
router.patch("/notifications/read-all", userController.markNotificationsRead);

export default router;
