import { Router } from 'express';
import { signup, login, getMe, demoLogin } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Real authentication endpoints
router.post('/signup', signup);       // POST /api/auth/signup  { name, email, password }
router.post('/login', login);         // POST /api/auth/login   { email, password }
router.get('/me', authenticateToken, getMe);  // GET /api/auth/me (requires JWT)

// Demo login for hackathon judges
router.post('/demo-login', demoLogin);

// Legacy endpoints (backward compat, redirect to login)
router.post('/google', login);

export default router;
