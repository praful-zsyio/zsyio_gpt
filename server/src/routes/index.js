import { Router } from 'express';
import authRoutes from './authRoutes.js';
import modelRoutes from './modelRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import messageRoutes from './messageRoutes.js';
import promptRoutes from './promptRoutes.js';
import usageRoutes from './usageRoutes.js';
import fileRoutes from './fileRoutes.js';
import mediaRoutes from './mediaRoutes.js';
const router = Router();
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'ZsyioGPT Unified AI & Media Gateway',
        timestamp: new Date().toISOString(),
    });
});
router.use('/auth', authRoutes);
router.use('/models', modelRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/prompts', promptRoutes);
router.use('/usage', usageRoutes);
router.use('/files', fileRoutes);
router.use('/media', mediaRoutes);
export default router;
