import { Router } from 'express';
import { getPlans, createOrder, verifyPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public plans and gateway discovery
router.get('/plans', getPlans);

// Authenticated payment transactions
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/history', authenticate, getPaymentHistory);

export default router;
