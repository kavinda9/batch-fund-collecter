// backend/src/routes/authRoutes.js
import { Router } from 'express';
import { verifyUserToken } from '../controllers/authController.js';

const router = Router();


router.post('/verify', verifyUserToken);

export default router;