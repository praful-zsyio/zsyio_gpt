import { Router } from 'express';
import { register, login, getMe, logout, firebaseAuth, getGuestSession, registerSchema, loginSchema } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router();
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/guest', getGuestSession);
router.get('/guest', getGuestSession);
router.post('/firebase', firebaseAuth);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);
export default router;

