import { Router } from 'express';
import broadcastAlertController from '../controllers/broadcast-alert.controller';

const router = Router();

/**
 * GET /api/broadcast-alert
 * Read current broadcast refresh alert.
 */
router.get('/broadcast-alert', broadcastAlertController.get);

/**
 * POST /api/broadcast-alert
 * Set new broadcast refresh alert for all users.
 * Body: { message: string }
 */
router.post('/broadcast-alert', broadcastAlertController.set);

/**
 * POST /api/broadcast-alert/consume
 * Clear broadcast refresh alert globally after one click.
 */
router.post('/broadcast-alert/consume', broadcastAlertController.consume);

export default router;
