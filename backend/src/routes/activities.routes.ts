import express from 'express';
import activityController from '../controllers/activity.controller';
import { cacheResponse } from '../middleware/response-cache';

const router = express.Router();

// Public: get activities for a user (paginated)
router.get(
  '/users/:userId/activities',
  cacheResponse({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
  }),
  activityController.getUserActivities
);

export default router;
