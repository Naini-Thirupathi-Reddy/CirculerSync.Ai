import { Router } from 'express';
import { googleAuth, verifyOtp, resendOtp, signup, login, getMe, demoLogin } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Gmail & Google OAuth Authentication
router.post('/google', googleAuth);

// 6-Digit OTP Verification & Resend Endpoints
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Standard Login & Signup endpoints mapped to Google Auth
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/demo-login', demoLogin);

export default router;
