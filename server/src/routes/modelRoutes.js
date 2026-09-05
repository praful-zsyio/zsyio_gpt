import { Router } from 'express';
import { getModels } from '../controllers/modelController.js';
const router = Router();
router.get('/', getModels);
export default router;
