import { Router } from 'express';
import { streamMessage } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// Streaming SSE endpoint
router.post('/stream', streamMessage);
export default router;
