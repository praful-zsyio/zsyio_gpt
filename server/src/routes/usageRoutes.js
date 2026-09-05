import { Router } from 'express';
import { getUsageStats } from '../controllers/usageController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
router.get('/stats', getUsageStats);
export default router;
