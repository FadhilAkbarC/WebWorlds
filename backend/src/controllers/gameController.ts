import { Response } from 'express';
import { Game, User } from '../models';
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

    res.json({
      success: true,
      data: game,
    });
  }),

  /**
   * Get games by creator
   */
  getByCreator: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { creatorId } = req.params;

    const games = await Game.find({ creator: creatorId, published: true })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: games,
    });
  }),
};

export default gameController;
