import { Response } from 'express';
import { Game, User, Activity } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';

export const gameController = {
  /**
   * List games with pagination, search, and filtering
   */
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = (req.query.search as string)?.trim() || '';
    const category = (req.query.category as string)?.trim() || '';

    const skip = (page - 1) * limit;

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

    // Execute queries in parallel for performance
    const [games, total] = await Promise.all([
      Game.find(query)
        .populate('creator', 'username avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Game.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  /**
   * Get single game by ID
   */
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const game = await Game.findById(id).populate('creator', 'username avatar');

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    // Increment play count
    await Game.findByIdAndUpdate(id, { $inc: { 'stats.plays': 1 } });

    // Create a play activity if user is present
    if (req.userId) {
      try {
        await Activity.create({
          user: req.userId,
          type: 'play',
          targetId: id,
          targetType: 'Game',
          meta: { title: game.title },
        });
      } catch (e) {
        console.warn('Failed to create play activity', e);
      }
    }

    res.json({
      success: true,
      data: game,
    });
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

    // Create activity for game creation
    try {
      await Activity.create({
        user: req.userId,
        type: 'create_game',
        targetId: game._id,
        targetType: 'Game',
        meta: { title: game.title },
      });
    } catch (e) {
      console.warn('Failed to create activity for game creation', e);
    }

    // Add to user's created games
    await User.findByIdAndUpdate(req.userId, {
      $push: { createdGames: game._id },
      $inc: { 'stats.gamesCreated': 1 },
    });

    res.status(201).json({
      success: true,
      data: game,
    });
  }),

  /**
   * Update a game
   */
  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const { title, description, code, settings, scripts, assets } = req.body;

    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    // Check ownership
    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized to update this game');
    }

    // Validate updates
    if (title && !validators.title(title)) {
      throw new AppError(400, 'Invalid title');
    }

    if (settings && !validators.gameSettings(settings)) {
      throw new AppError(400, 'Invalid game settings');
    }

    // Update fields
    if (title) game.title = title;
    if (description !== undefined) game.description = description;
    if (code) game.code = code;
    if (settings) game.settings = { ...game.settings, ...settings };
    if (scripts) game.scripts = scripts;
    if (assets) game.assets = assets;

    await game.save();

    res.json({
      success: true,
      data: game,
    });
  }),

  /**
   * Publish a game (make it public)
   */
  publish: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    game.published = true;
    await game.save();

    res.json({
      success: true,
      data: game,
    });
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
      throw new AppError(403, 'Not authorized');
    }

    // Remove from creator's list
    await User.findByIdAndUpdate(game.creator, {
      $pull: { createdGames: game._id },
      $inc: { 'stats.gamesCreated': -1 },
    });

    await Game.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Game deleted',
    });
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
    const user = await User.findById(req.userId);
    if (user?.likedGames.includes(id as any)) {
      throw new AppError(409, 'Already liked this game');
    }

    // Update game likes
    const game = await Game.findByIdAndUpdate(
      id,
      { $inc: { 'stats.likes': 1 } },
      { new: true }
    );

    // Add to user's liked games
    await User.findByIdAndUpdate(req.userId, {
      $push: { likedGames: id },
    });

    // create like activity
    try {
      await Activity.create({
        user: req.userId,
        type: 'like',
        targetId: id,
        targetType: 'Game',
        meta: { title: game?.title },
      });
    } catch (e) {
      console.warn('Failed to create like activity', e);
    }

    res.json({
      success: true,
      data: game,
    });
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
    await User.findByIdAndUpdate(req.userId, {
      $pull: { likedGames: id },
    });

    // remove like activity entries (best-effort)
    try {
      await Activity.deleteMany({ user: req.userId, targetId: id, type: 'like' });
    } catch (e) {
      console.warn('Failed to remove like activity', e);
    }

    res.json({
      success: true,
      data: game,
    });
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

    res.json({ success: true, data: { isLiked } });
  }),

  /**
   * Get games by creator
   */
  getByCreator: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { creatorId } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '12')));
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      Game.find({ creator: creatorId, published: true })
        .populate('creator', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Game.countDocuments({ creator: creatorId, published: true }),
    ]);

    res.json({
      success: true,
      data: games,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
};

export default gameController;
