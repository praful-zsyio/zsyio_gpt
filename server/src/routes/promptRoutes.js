import { Router } from 'express';
import { getPrompts, createPrompt, deletePrompt } from '../controllers/promptController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
router.get('/', getPrompts);
router.post('/', createPrompt);
router.delete('/:id', deletePrompt);
export default router;
