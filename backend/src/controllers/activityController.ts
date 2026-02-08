import { Response } from 'express';
import { Activity } from '../models/Activity';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const activityController = {
  getUserActivities: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '20')));
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments({ user: userId }),
    ]);

    res.json({
      success: true,
      data: activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
};

export default activityController;
