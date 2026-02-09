/**
 * Database Query Service with Caching
 * Reduces redundant DB queries and improves response time
 */

import { User, Game } from '../models';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

const CACHE_TIMES = {
  USER_PROFILE: 30000, // 30 seconds
  GAME_DETAILS: 45000, // 45 seconds
  GAME_LIST: 60000, // 1 minute
  LEADERBOARD: 120000, // 2 minutes
  STATS: 60000, // 1 minute
} as const;

class DatabaseService {
  /**
   * Get user by ID with caching
   */
  async getUserById(userId: string, options?: { noCache?: boolean }) {
    if (!options?.noCache) {
      const cached = cache.get<any>(`user:${userId}`);
      if (cached) {
        logger.debug('Cache hit: user', { userId });
        return cached;
      }
    }

    try {
      const user = await User.findById(userId).lean();
      if (user) {
        cache.set(`user:${userId}`, user, CACHE_TIMES.USER_PROFILE);
      }
      return user;
    } catch (error) {
      logger.error('Failed to fetch user', error, { userId });
      return null;
    }
  }

  /**
   * Get user by email (no cache - used during auth)
   */
  async getUserByEmail(email: string) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Failed to fetch user by email', error);
      return null;
    }
  }

  /**
   * Get game by ID with caching
   */
  async getGameById(gameId: string, options?: { populate?: boolean; noCache?: boolean }) {
    if (!options?.noCache) {
      const cached = cache.get<any>(`game:${gameId}`);
      if (cached) {
        logger.debug('Cache hit: game', { gameId });
        return cached;
      }
    }

    try {
      const query = Game.findById(gameId);
      if (options?.populate) {
        query.populate('creator', 'username avatar');
      }
      const game = await query.lean();
      
      if (game && !options?.populate) {
        cache.set(`game:${gameId}`, game, CACHE_TIMES.GAME_DETAILS);
      }
      return game;
    } catch (error) {
      logger.error('Failed to fetch game', error, { gameId });
      return null;
    }
  }

  /**
   * Get games with pagination (implement cache-busting on new games)
   */
  async getGames(
    query: Record<string, any> = { published: true },
    page: number = 1,
    limit: number = 12,
    options?: { noCache?: boolean }
  ) {
    const cacheKey = `games:${JSON.stringify({ query, page, limit })}`;

    if (!options?.noCache) {
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        logger.debug('Cache hit: games list', { page, limit });
        return cached;
      }
    }

    try {
      const skip = (page - 1) * limit;
      const [games, total] = await Promise.all([
        Game.find(query)
          .populate('creator', 'username avatar')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Game.countDocuments(query),
      ]);

      const result = {
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };

      cache.set(cacheKey, result, CACHE_TIMES.GAME_LIST);
      return result;
    } catch (error) {
      logger.error('Failed to fetch games', error);
      return { games: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  }

  /**
   * Get user's games
   */
  async getUserGames(creatorId: string, page: number = 1, limit: number = 12) {
    const cacheKey = `user-games:${creatorId}:${page}:${limit}`;
    const cached = cache.get<any>(cacheKey);
    
    if (cached) {
      logger.debug('Cache hit: user games', { creatorId });
      return cached;
    }

    try {
      const skip = (page - 1) * limit;
      const [games, total] = await Promise.all([
        Game.find({ creator: creatorId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Game.countDocuments({ creator: creatorId }),
      ]);

      const result = {
        games,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };

      cache.set(cacheKey, result, CACHE_TIMES.USER_PROFILE);
      return result;
    } catch (error) {
      logger.error('Failed to fetch user games', error, { creatorId });
      return { games: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  }

  /**
   * Invalidate game cache on update
   */
  invalidateGameCache(gameId: string) {
    cache.delete(`game:${gameId}`);
    // Also invalidate game lists (brute force for now, can be optimized with pattern matching)
    logger.debug('Invalidated game cache', { gameId });
  }

  /**
   * Invalidate user cache on update
   */
  invalidateUserCache(userId: string) {
    cache.delete(`user:${userId}`);
    logger.debug('Invalidated user cache', { userId });
  }

  /**
   * Get cache stats for monitoring
   */
  getCacheStats() {
    return cache.getStats();
  }
}

export const db = new DatabaseService();
