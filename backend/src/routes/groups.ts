import { Router } from 'express';
import groupController from '../controllers/groupController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/groups
 * List groups with pagination and search
 */
router.get('/', optionalAuth, groupController.list);

/**
 * GET /api/groups/mine
 * List groups for current user
 */
router.get('/mine', authenticateToken, groupController.mine);

/**
 * GET /api/groups/:id
 * Get group details
 */
router.get('/:id', optionalAuth, groupController.get);

/**
 * POST /api/groups
 * Create group
 */
router.post('/', authenticateToken, groupController.create);

/**
 * POST /api/groups/:id/join
 * Join group
 */
router.post('/:id/join', authenticateToken, groupController.join);

/**
 * POST /api/groups/:id/leave
 * Leave group
 */
router.post('/:id/leave', authenticateToken, groupController.leave);

export default router;
