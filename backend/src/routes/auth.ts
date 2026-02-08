import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username, email, password }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 * Requires: Authorization header with JWT token
 */
router.get('/me', authenticateToken, authController.me);

/**
 * GET /api/auth/profile/:id
 * Get public user profile
 */
router.get('/profile/:id', authController.getProfile);

export default router;
