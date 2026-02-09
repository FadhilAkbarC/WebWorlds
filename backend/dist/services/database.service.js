"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const models_1 = require("../models");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const CACHE_TIMES = {
    USER_PROFILE: 30000,
    GAME_DETAILS: 45000,
    GAME_LIST: 60000,
    LEADERBOARD: 120000,
    STATS: 60000,
};
class DatabaseService {
    async getUserById(userId, options) {
        if (!options?.noCache) {
            const cached = cache_1.cache.get(`user:${userId}`);
            if (cached) {
                logger_1.logger.debug('Cache hit: user', { userId });
                return cached;
            }
        }
        try {
            const user = await models_1.User.findById(userId).lean();
            if (user) {
                cache_1.cache.set(`user:${userId}`, user, CACHE_TIMES.USER_PROFILE);
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch user', error, { userId });
            return null;
        }
    }
    async getUserByEmail(email) {
        try {
            return await models_1.User.findOne({ email: email.toLowerCase() });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch user by email', error);
            return null;
        }
    }
    async getGameById(gameId, options) {
        if (!options?.noCache) {
            const cached = cache_1.cache.get(`game:${gameId}`);
            if (cached) {
                logger_1.logger.debug('Cache hit: game', { gameId });
                return cached;
            }
        }
        try {
            const query = models_1.Game.findById(gameId);
            if (options?.populate) {
                query.populate('creator', 'username avatar');
            }
            const game = await query.lean();
            if (game && !options?.populate) {
                cache_1.cache.set(`game:${gameId}`, game, CACHE_TIMES.GAME_DETAILS);
            }
            return game;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch game', error, { gameId });
            return null;
        }
    }
    async getGames(query = { published: true }, page = 1, limit = 12, options) {
        const cacheKey = `games:${JSON.stringify({ query, page, limit })}`;
        if (!options?.noCache) {
            const cached = cache_1.cache.get(cacheKey);
            if (cached) {
                logger_1.logger.debug('Cache hit: games list', { page, limit });
                return cached;
            }
        }
        try {
            const skip = (page - 1) * limit;
            const [games, total] = await Promise.all([
                models_1.Game.find(query)
                    .populate('creator', 'username avatar')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .lean(),
                models_1.Game.countDocuments(query),
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
            cache_1.cache.set(cacheKey, result, CACHE_TIMES.GAME_LIST);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch games', error);
            return { games: [], pagination: { page, limit, total: 0, pages: 0 } };
        }
    }
    async getUserGames(creatorId, page = 1, limit = 12) {
        const cacheKey = `user-games:${creatorId}:${page}:${limit}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            logger_1.logger.debug('Cache hit: user games', { creatorId });
            return cached;
        }
        try {
            const skip = (page - 1) * limit;
            const [games, total] = await Promise.all([
                models_1.Game.find({ creator: creatorId })
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .lean(),
                models_1.Game.countDocuments({ creator: creatorId }),
            ]);
            const result = {
                games,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            };
            cache_1.cache.set(cacheKey, result, CACHE_TIMES.USER_PROFILE);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch user games', error, { creatorId });
            return { games: [], pagination: { page, limit, total: 0, pages: 0 } };
        }
    }
    invalidateGameCache(gameId) {
        cache_1.cache.delete(`game:${gameId}`);
        logger_1.logger.debug('Invalidated game cache', { gameId });
    }
    invalidateUserCache(userId) {
        cache_1.cache.delete(`user:${userId}`);
        logger_1.logger.debug('Invalidated user cache', { userId });
    }
    getCacheStats() {
        return cache_1.cache.getStats();
    }
}
exports.db = new DatabaseService();
//# sourceMappingURL=database.service.js.map