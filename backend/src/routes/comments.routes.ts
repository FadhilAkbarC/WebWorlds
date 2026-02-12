import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { cacheResponse } from '../middleware/response-cache';

const router = Router();

/**
 * GET /api/games/:gameId/comments
 * Get comments for a game
 * Params: gameId
 * Query: ?page=1&limit=10
 */
router.get(
  '/games/:gameId/comments',
  optionalAuth,
  cacheResponse({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
  }),
  commentController.getGameComments
);

/**
 * POST /api/games/:gameId/comments
 * Create a comment
 * Requires: Authentication
 * Body: { text }
 */
router.post('/games/:gameId/comments', authenticateToken, commentController.createComment);

/**
 * DELETE /api/comments/:commentId
 * Delete a comment (own comment only)
 * Requires: Authentication
 */
router.delete(
  '/comments/:commentId',
  authenticateToken,
  commentController.deleteComment
);

/**
 * POST /api/comments/:commentId/like
 * Like a comment
 * Requires: Authentication
 */
router.post(
  '/comments/:commentId/like',
  authenticateToken,
  commentController.likeComment
);

/**
 * POST /api/comments/:commentId/unlike
 * Unlike a comment
 * Requires: Authentication
 */
router.post(
  '/comments/:commentId/unlike',
  authenticateToken,
  commentController.unlikeComment
);

export default router;
