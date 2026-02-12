import { Response } from 'express';
import { Comment, User, Activity, Game } from '../models';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';

export const commentController = {
  /**
   * Get comments for a game
   */
  getGameComments: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { gameId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ gameId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ gameId }),
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  /**
   * Create a comment
   */
  createComment: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { gameId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      throw new AppError(400, 'Comment text is required');
    }

    if (text.length > 500) {
      throw new AppError(400, 'Comment must be 500 characters or less');
    }

    // Get user info
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Create comment
    const comment = new Comment({
      gameId,
      userId: req.userId,
      username: user.username,
      avatar: user.avatar,
      text: text.trim(),
    });

    await comment.save();

    // Create activity for comment (include game title if possible)
    try {
      const game = await Game.findById(gameId).select('title').lean();
      await Activity.create({
        user: req.userId,
        type: 'comment',
        targetId: comment._id,
        targetType: 'Comment',
        meta: { gameId, gameTitle: game?.title },
      });
    } catch (e) {
      // non-fatal
      console.warn('Failed to create activity for comment', e);
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  }),

  /**
   * Delete a comment
   */
  deleteComment: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    if (comment.userId.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(commentId);

    // remove comment activity entries (best-effort)
    try {
      await Activity.deleteMany({ targetId: commentId, type: 'comment' });
    } catch (e) {
      console.warn('Failed to cleanup activities for deleted comment', e);
    }

    res.json({
      success: true,
      message: 'Comment deleted',
    });
  }),

  /**
   * Like a comment
   */
  likeComment: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    // Check if already liked
    if (comment.likedBy.includes(req.userId as any)) {
      throw new AppError(409, 'Already liked this comment');
    }

    // Add like
    comment.likes += 1;
    comment.likedBy.push(req.userId as any);
    await comment.save();

    // create activity for comment like
    try {
      await Activity.create({
        user: req.userId,
        type: 'like',
        targetId: comment._id,
        targetType: 'Comment',
        meta: {},
      });
    } catch (e) {
      console.warn('Failed to create activity for comment like', e);
    }

    res.json({
      success: true,
      data: comment,
    });
  }),

  /**
   * Unlike a comment
   */
  unlikeComment: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    // Check if liked
    const likedIndex = comment.likedBy.findIndex(
      (id) => id.toString() === req.userId
    );

    if (likedIndex === -1) {
      throw new AppError(409, 'Haven\'t liked this comment');
    }

    // Remove like
    comment.likes = Math.max(0, comment.likes - 1);
    comment.likedBy.splice(likedIndex, 1);
    await comment.save();

    // remove like activity (best-effort)
    try {
      await Activity.deleteMany({ user: req.userId, targetId: comment._id, type: 'like' });
    } catch (e) {
      console.warn('Failed to remove comment like activity', e);
    }

    res.json({
      success: true,
      data: comment,
    });
  }),
};

export default commentController;
