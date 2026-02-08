import { Router } from 'express';
import commentController from '../controllers/commentController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/games/:gameId/comments
 * Get comments for a game
 * Params: gameId
 * Query: ?page=1&limit=10
 */
router.get('/:gameId/comments', optionalAuth, commentController.getGameComments);

/**
 * POST /api/games/:gameId/comments
 * Create a comment
 * Requires: Authentication
 * Body: { text }
 */
router.post('/:gameId/comments', authenticateToken, commentController.createComment);

/**
 * DELETE /api/comments/:commentId
 * Delete a comment (own comment only)
 * Requires: Authentication
 */
router.delete(
  '/comment/:commentId',
  authenticateToken,
  commentController.deleteComment
);

/**
 * POST /api/comments/:commentId/like
 * Like a comment
 * Requires: Authentication
 */
router.post(
  '/comment/:commentId/like',
  authenticateToken,
  commentController.likeComment
);

/**
 * POST /api/comments/:commentId/unlike
 * Unlike a comment
 * Requires: Authentication
 */
router.post(
  '/comment/:commentId/unlike',
  authenticateToken,
  commentController.unlikeComment
);

export default router;
