// backend/src/routes/contributionRoutes.js
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { 
  createContribution, 
  getMyContributionHistory, 
  updateContributionStatus 
} from '../controllers/contributionController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

// Setup local disk configuration for staging payment upload receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, `slip-${Date.now()}${fileExtension}`);
  }
});

const upload = multer({ storage });
const router = Router();

// Base routes protected by mandatory identity token verification
router.post('/', verifyToken, upload.single('slip'), createContribution);
router.get('/my-history', verifyToken, getMyContributionHistory);

// Admin exclusive command endpoint
router.put('/:id/status', verifyToken, isAdmin, updateContributionStatus);

export default router;