// Routes index - centralized route exports
import { Router } from 'express';
import authRoutes from './auth';
import gameRoutes from './games';

const router = Router();

/**
 * Mount all API routes
 */
router.use('/auth', authRoutes);
router.use('/games', gameRoutes);

export default router;
