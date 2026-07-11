// backend/src/routes/campaignRoutes.js
import { Router } from 'express';
import { getActiveCampaigns, createCampaign } from '../controllers/campaignController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public route to view active campaigns on the home page
router.get('/', getActiveCampaigns);

// Protected route: requires a valid token AND admin privileges to create campaigns
router.post('/', verifyToken, isAdmin, createCampaign);

export default router;