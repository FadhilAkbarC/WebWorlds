import express from 'express';
import activityController from '../controllers/activityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public: get activities for a user (paginated)
router.get('/users/:userId/activities', activityController.getUserActivities);

export default router;
