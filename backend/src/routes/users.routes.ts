import { Router } from 'express';
import userController from '../controllers/user.controller';
import { cacheResponse } from '../middleware/response-cache';

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
