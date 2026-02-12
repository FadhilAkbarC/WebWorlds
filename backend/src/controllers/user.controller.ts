import { Response } from 'express';
import { User } from '../models';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';
import { successResponse } from '../utils/response';

export const userController = {
  /**
   * List/search users
   * Query: ?search=term&page=1&limit=24
   */
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 24));
    const search = (req.query.search as string)?.trim().toLowerCase() || '';

    const query: any = {};

    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }

    const total = await User.countDocuments(query);
    const pages = Math.max(1, Math.ceil(total / limit));

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username avatar bio stats createdAt')
      .lean();

    res.json(
      successResponse(users, {
        page,
        limit,
        total,
        pages,
      })
    );
  }),
};

export default userController;
