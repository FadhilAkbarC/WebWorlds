import { Response } from 'express';
import mongoose from 'mongoose';
import { Game, User, Activity } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';
import { db } from '../services';
import { logger } from '../utils/logger';
import { successResponse } from '../utils/response';

export const gameController = {
  /**
   * List games with pagination, search, and filtering
   */
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = (req.query.search as string)?.trim() || '';
    const category = (req.query.category as string)?.trim() || '';

    // Build query
    const query: any = { published: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category && validators.category(category)) {
      query.category = category;
    }

    // Use cached DB service
    const result = await db.getGames(query, page, limit);

    res.json(successResponse(result.games, result.pagination));
  }),

  /**
   * Get single game by ID
   */
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Get game with creator info
    const game = await db.getGameById(id, { populate: true });

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    // Increment play count (non-blocking)
    Game.findByIdAndUpdate(id, { $inc: { 'stats.plays': 1 } }).catch((e) =>
      logger.warn('Failed to update play count', { gameId: id })
    );

    // Create play activity (non-blocking, fire-and-forget)
    if (req.userId) {
      Activity.create({
        user: req.userId,
        type: 'play',
        targetId: id,
        targetType: 'Game',
        meta: { title: game.title },
      }).catch((e) => logger.warn('Failed to create play activity'));
    }

    res.json(successResponse(game));
  }),

  /**
   * Create a new game (draft)
   */
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { title, description, code } = req.body;

    // Validation
    if (!title) {
      throw new AppError(400, 'Title is required');
    }

    if (!validators.title(title)) {
      throw new AppError(400, 'Title must be 3-100 characters');
    }

    if (description && !validators.description(description)) {
      throw new AppError(400, 'Description max 1000 characters');
    }

    // Create game
    const game = new Game({
      title,
      description,
      code: code || '// Your game code here',
      creator: req.userId,
      published: false,
    });

    await game.save();

    // Create activity (non-blocking)
    Activity.create({
      user: req.userId,
      type: 'create_game',
      targetId: game._id,
      targetType: 'Game',
      meta: { title: game.title },
    }).catch(() => logger.warn('Failed to create activity'));

    // Update user's game count (non-blocking)
    User.findByIdAndUpdate(req.userId, {
      $push: { createdGames: game._id },
      $inc: { 'stats.gamesCreated': 1 },
    }).then(() => {
      // Invalidate user cache
      db.invalidateUserCache(req.userId!);
    });

    res.status(201).json(successResponse(game));
  }),

  /**
   * Update a game
   */
  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid game id');
    }

    const body =
      typeof req.body === 'string'
        ? (() => {
            try {
              return JSON.parse(req.body);
            } catch {
              throw new AppError(400, 'Invalid JSON body');
            }
          })()
        : req.body || {};

    const {
      title,
      description,
      code,
      settings,
      scripts,
      assets,
      category,
      tags,
    } = body;

    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    // Check ownership
    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized to update this game');
    }

    // Validate updates
    if (title !== undefined && typeof title !== 'string') {
      throw new AppError(400, 'Invalid title');
    }
    if (title && !validators.title(title)) {
      throw new AppError(400, 'Invalid title');
    }

    if (settings !== undefined && (typeof settings !== 'object' || !settings)) {
      throw new AppError(400, 'Invalid game settings');
    }
    if (settings && !validators.gameSettings(settings)) {
      throw new AppError(400, 'Invalid game settings');
    }

    if (category !== undefined) {
      if (typeof category !== 'string') {
        throw new AppError(400, 'Invalid category');
      }
      const normalizedCategory = category.trim().toLowerCase();
      if (!validators.category(normalizedCategory)) {
        throw new AppError(400, 'Invalid category');
      }
      game.category = normalizedCategory;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        throw new AppError(400, 'Invalid tags');
      }
      const normalizedTags = tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter((tag) => tag.length > 0);
      game.tags = normalizedTags;
    }

    // Update fields
    if (title) game.title = title;
    if (description !== undefined) game.description = description;
    if (code) game.code = code;
    if (settings) game.settings = { ...game.settings, ...settings };
    if (scripts) game.scripts = scripts;
    if (assets) game.assets = assets;

    await game.save();

    // Invalidate cache
    db.invalidateGameCache(id);

    res.json(successResponse(game));
  }),

  /**
   * Publish a game (make it public)
   */
  publish: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid game id');
    }
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized to publish this game');
    }

    game.published = true;
    await game.save();

    // Invalidate cache
    db.invalidateGameCache(id);

    logger.info('Game published', { gameId: id, userId: req.userId });

    res.json(successResponse(game));
  }),

  /**
   * Delete a game
   */
  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized to delete this game');
    }

    // Remove from creator's list
    User.findByIdAndUpdate(game.creator, {
      $pull: { createdGames: game._id },
      $inc: { 'stats.gamesCreated': -1 },
    }).then(() => {
      db.invalidateUserCache(game.creator.toString());
    });

    await Game.findByIdAndDelete(id);

    // Invalidate cache
    db.invalidateGameCache(id);

    logger.info('Game deleted', { gameId: id, userId: req.userId });

    res.json(successResponse({ message: 'Game deleted successfully' }));
  }),

  /**
   * Like a game
   */
  like: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;

    // Check if already liked
    const user = await User.findById(req.userId).select('likedGames').lean();
    if (user && (user as any).likedGames.includes(id)) {
      throw new AppError(409, 'Already liked this game');
    }

    // Update game likes (non-blocking)
    const game = await Game.findByIdAndUpdate(
      id,
      { $inc: { 'stats.likes': 1 } },
      { new: true }
    );

    // Add to user's liked games
    User.findByIdAndUpdate(req.userId, {
      $push: { likedGames: id },
    }).then(() => {
      db.invalidateUserCache(req.userId!);
    });

    // Create activity (non-blocking)
    Activity.create({
      user: req.userId,
      type: 'like',
      targetId: id,
      targetType: 'Game',
      meta: { title: game?.title },
    }).catch(() => logger.warn('Failed to create like activity'));

    // Invalidate cache
    db.invalidateGameCache(id);

    res.json(successResponse(game));
  }),

  /**
   * Unlike a game
   */
  unlike: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;

    // Update game likes
    const game = await Game.findByIdAndUpdate(
      id,
      { $inc: { 'stats.likes': -1 } },
      { new: true }
    );

    // Remove from user's liked games
    User.findByIdAndUpdate(req.userId, {
      $pull: { likedGames: id },
    }).then(() => {
      db.invalidateUserCache(req.userId!);
    });

    // Remove activity (non-blocking)
    Activity.deleteMany({
      user: req.userId,
      targetId: id,
      type: 'like',
    }).catch(() => logger.warn('Failed to remove like activity'));

    // Invalidate cache
    db.invalidateGameCache(id);

    res.json(successResponse(game));
  }),

  /**
   * Get like status for the current user on a game
   */
  likeStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let isLiked = false;

    if (req.userId) {
      const user = await User.findById(req.userId).select('likedGames').lean();
      if (user && (user as any).likedGames) {
        isLiked = (user as any).likedGames.some((g: any) => g.toString() === id);
      }
    }

    res.json(successResponse({ isLiked }));
  }),

  /**
   * Get games by creator
   */
  getByCreator: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { creatorId } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '12')));

    const result = await db.getUserGames(creatorId, page, limit);

    res.json(successResponse(result.games, result.pagination));
  }),
};

export default gameController;
