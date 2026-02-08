import { Response } from 'express';
import { User } from '../models';
import { generateToken } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  /**
   * Register a new user
   */
  register: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      throw new AppError(400, 'Missing required fields: username, email, password');
    }

    if (!validators.username(username)) {
      throw new AppError(
        400,
        'Username must be 3-30 chars, lowercase letters, numbers, _, or -'
      );
    }

    if (!validators.email(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    if (!validators.password(password)) {
      throw new AppError(
        400,
        'Password must be 8+ chars with uppercase, lowercase, and number'
      );
    }

    // Check if user exists
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      throw new AppError(409, 'Username or email already registered');
    }

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  }),

  /**
   * Login user
   */
  login: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password required');
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    );

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        stats: user.stats,
      },
    });
  }),

  /**
   * Get current user profile
   */
  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      stats: user.stats,
      createdGames: user.createdGames.length,
      followers: user.followers.length,
    });
  }),

  /**
   * Get user profile by ID
   */
  getProfile: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('createdGames', 'title thumbnail stats')
      .lean();

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  }),
};

export default authController;
