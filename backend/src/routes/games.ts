import { Router } from 'express';
import gameController from '../controllers/gameController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { cacheResponse } from '../middleware/responseCache';

const router = Router();

/**
 * GET /api/games
 * List published games with pagination, search, and filtering
 * Query: ?page=1&limit=12&search=term&category=action
 */
router.get(
  '/',
  optionalAuth,
  cacheResponse({
    ttlMs: 20000,
    maxAgeSeconds: 30,
    staleWhileRevalidateSeconds: 300,
  }),
  gameController.list
);

/**
 * GET /api/games/:id
 * Get game details
 */
/**
 * GET /api/games/creator/:creatorId
 * Get all games by creator
 */
router.get(
  '/creator/:creatorId',
  optionalAuth,
  cacheResponse({
    ttlMs: 20000,
    maxAgeSeconds: 30,
    staleWhileRevalidateSeconds: 300,
  }),
  gameController.getByCreator
);

/**
 * GET /api/games/:id
 * Get game details
 * NOTE: Avoid response-level caching to preserve play count tracking.
 */
router.get('/:id', optionalAuth, gameController.get);

/**
 * GET /api/games/:id/like-status
 * Return whether the authenticated user has liked the game
 */
router.get('/:id/like-status', optionalAuth, gameController.likeStatus);

/**
 * POST /api/games
 * Create new game (draft)
 * Requires: Authentication
 * Body: { title, description, code }
 */
router.post('/', authenticateToken, gameController.create);

/**
 * PUT /api/games/:id
 * Update game
 * Requires: Authentication, ownership
 * Body: { title, description, code, settings, scripts, assets }
 */
router.put('/:id', authenticateToken, gameController.update);

/**
 * POST /api/games/:id/publish
 * Publish game (make it public)
 * Requires: Authentication, ownership
 */
router.post('/:id/publish', authenticateToken, gameController.publish);

/**
 * DELETE /api/games/:id
 * Delete game
 * Requires: Authentication, ownership
 */
router.delete('/:id', authenticateToken, gameController.delete);

/**
 * POST /api/games/:id/like
 * Like a game
 * Requires: Authentication
 */
router.post('/:id/like', authenticateToken, gameController.like);

/**
 * POST /api/games/:id/unlike
 * Unlike a game
 * Requires: Authentication
 */
router.post('/:id/unlike', authenticateToken, gameController.unlike);

export default router;
