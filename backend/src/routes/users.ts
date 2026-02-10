import { Router } from 'express';
import userController from '../controllers/userController';
import { cacheResponse } from '../middleware/responseCache';

const router = Router();

/**
 * GET /api/users
 * List/search users
 */
router.get(
  '/',
  cacheResponse({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
  }),
  userController.list
);

export default router;
