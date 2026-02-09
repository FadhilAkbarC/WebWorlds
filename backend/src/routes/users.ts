import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

/**
 * GET /api/users
 * List/search users
 */
router.get('/', userController.list);

export default router;
