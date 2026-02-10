"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const services_1 = require("../services");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
exports.gameController = {
    list: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
        const search = req.query.search?.trim() || '';
        const category = req.query.category?.trim() || '';
        const sortParam = req.query.sort?.trim().toLowerCase() || '';
        const query = { published: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }
        if (category && validation_1.validators.category(category)) {
            query.category = category;
        }
        const sortMap = {
            trending: { 'stats.plays': -1 },
            plays: { 'stats.plays': -1 },
            '-plays': { 'stats.plays': -1 },
            likes: { 'stats.likes': -1 },
            '-likes': { 'stats.likes': -1 },
            newest: { createdAt: -1 },
            recent: { createdAt: -1 },
            '-created': { createdAt: -1 },
            created: { createdAt: -1 },
        };
        const sort = sortMap[sortParam] || { createdAt: -1 };
        const result = await services_1.db.getGames(query, page, limit, { sort });
        res.json((0, response_1.successResponse)(result.games, result.pagination));
    }),
    get: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const game = await services_1.db.getGameById(id, { populate: true });
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.plays': 1 } }).catch((e) => logger_1.logger.warn('Failed to update play count', { gameId: id }));
        if (req.userId) {
            models_1.Activity.create({
                user: req.userId,
                type: 'play',
                targetId: id,
                targetType: 'Game',
                meta: { title: game.title },
            }).catch((e) => logger_1.logger.warn('Failed to create play activity'));
        }
        res.json((0, response_1.successResponse)(game));
    }),
    create: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { title, description, code } = req.body;
        if (!title) {
            throw new errorHandler_1.AppError(400, 'Title is required');
        }
        if (!validation_1.validators.title(title)) {
            throw new errorHandler_1.AppError(400, 'Title must be 3-100 characters');
        }
        if (description && !validation_1.validators.description(description)) {
            throw new errorHandler_1.AppError(400, 'Description max 1000 characters');
        }
        const game = new models_1.Game({
            title,
            description,
            code: code || '// Your game code here',
            creator: req.userId,
            published: false,
        });
        await game.save();
        models_1.Activity.create({
            user: req.userId,
            type: 'create_game',
            targetId: game._id,
            targetType: 'Game',
            meta: { title: game.title },
        }).catch(() => logger_1.logger.warn('Failed to create activity'));
        models_1.User.findByIdAndUpdate(req.userId, {
            $push: { createdGames: game._id },
            $inc: { 'stats.gamesCreated': 1 },
        }).then(() => {
            services_1.db.invalidateUserCache(req.userId);
        });
        res.status(201).json((0, response_1.successResponse)(game));
    }),
    update: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_1.AppError(400, 'Invalid game id');
        }
        const body = typeof req.body === 'string'
            ? (() => {
                try {
                    return JSON.parse(req.body);
                }
                catch {
                    throw new errorHandler_1.AppError(400, 'Invalid JSON body');
                }
            })()
            : req.body || {};
        const { title, description, code, settings, scripts, assets, category, tags, thumbnail, } = body;
        const game = await models_1.Game.findById(id);
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        if (game.creator.toString() !== req.userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to update this game');
        }
        if (title !== undefined && typeof title !== 'string') {
            throw new errorHandler_1.AppError(400, 'Invalid title');
        }
        if (title && !validation_1.validators.title(title)) {
            throw new errorHandler_1.AppError(400, 'Invalid title');
        }
        if (settings !== undefined && (typeof settings !== 'object' || !settings)) {
            throw new errorHandler_1.AppError(400, 'Invalid game settings');
        }
        if (settings && !validation_1.validators.gameSettings(settings)) {
            throw new errorHandler_1.AppError(400, 'Invalid game settings');
        }
        if (category !== undefined) {
            if (typeof category !== 'string') {
                throw new errorHandler_1.AppError(400, 'Invalid category');
            }
            const normalizedCategory = category.trim().toLowerCase();
            if (!validation_1.validators.category(normalizedCategory)) {
                throw new errorHandler_1.AppError(400, 'Invalid category');
            }
            game.category = normalizedCategory;
        }
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                throw new errorHandler_1.AppError(400, 'Invalid tags');
            }
            const normalizedTags = tags
                .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
                .filter((tag) => tag.length > 0);
            game.tags = normalizedTags;
        }
        if (thumbnail !== undefined) {
            if (thumbnail === null || thumbnail === '') {
                game.thumbnail = '';
            }
            else if (typeof thumbnail !== 'string') {
                throw new errorHandler_1.AppError(400, 'Invalid thumbnail');
            }
            else {
                const isDataUrl = thumbnail.startsWith('data:image/');
                if (!isDataUrl && !validation_1.validators.url(thumbnail)) {
                    throw new errorHandler_1.AppError(400, 'Invalid thumbnail URL');
                }
                game.thumbnail = thumbnail;
            }
        }
        if (title)
            game.title = title;
        if (description !== undefined)
            game.description = description;
        if (code)
            game.code = code;
        if (settings)
            game.settings = { ...game.settings, ...settings };
        if (scripts)
            game.scripts = scripts;
        if (assets)
            game.assets = assets;
        await game.save();
        services_1.db.invalidateGameCache(id);
        res.json((0, response_1.successResponse)(game));
    }),
    publish: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_1.AppError(400, 'Invalid game id');
        }
        const game = await models_1.Game.findById(id);
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        if (game.creator.toString() !== req.userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to publish this game');
        }
        game.published = true;
        await game.save();
        services_1.db.invalidateGameCache(id);
        logger_1.logger.info('Game published', { gameId: id, userId: req.userId });
        res.json((0, response_1.successResponse)(game));
    }),
    delete: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const game = await models_1.Game.findById(id);
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        if (game.creator.toString() !== req.userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to delete this game');
        }
        models_1.User.findByIdAndUpdate(game.creator, {
            $pull: { createdGames: game._id },
            $inc: { 'stats.gamesCreated': -1 },
        }).then(() => {
            services_1.db.invalidateUserCache(game.creator.toString());
        });
        await models_1.Game.findByIdAndDelete(id);
        services_1.db.invalidateGameCache(id);
        logger_1.logger.info('Game deleted', { gameId: id, userId: req.userId });
        res.json((0, response_1.successResponse)({ message: 'Game deleted successfully' }));
    }),
    like: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const user = await models_1.User.findById(req.userId).select('likedGames').lean();
        if (user && user.likedGames.includes(id)) {
            throw new errorHandler_1.AppError(409, 'Already liked this game');
        }
        const game = await models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.likes': 1 } }, { new: true });
        models_1.User.findByIdAndUpdate(req.userId, {
            $push: { likedGames: id },
        }).then(() => {
            services_1.db.invalidateUserCache(req.userId);
        });
        models_1.Activity.create({
            user: req.userId,
            type: 'like',
            targetId: id,
            targetType: 'Game',
            meta: { title: game?.title },
        }).catch(() => logger_1.logger.warn('Failed to create like activity'));
        services_1.db.invalidateGameCache(id);
        res.json((0, response_1.successResponse)(game));
    }),
    unlike: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const game = await models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.likes': -1 } }, { new: true });
        models_1.User.findByIdAndUpdate(req.userId, {
            $pull: { likedGames: id },
        }).then(() => {
            services_1.db.invalidateUserCache(req.userId);
        });
        models_1.Activity.deleteMany({
            user: req.userId,
            targetId: id,
            type: 'like',
        }).catch(() => logger_1.logger.warn('Failed to remove like activity'));
        services_1.db.invalidateGameCache(id);
        res.json((0, response_1.successResponse)(game));
    }),
    likeStatus: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        let isLiked = false;
        if (req.userId) {
            const user = await models_1.User.findById(req.userId).select('likedGames').lean();
            if (user && user.likedGames) {
                isLiked = user.likedGames.some((g) => g.toString() === id);
            }
        }
        res.json((0, response_1.successResponse)({ isLiked }));
    }),
    getByCreator: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { creatorId } = req.params;
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12')));
        const result = await services_1.db.getUserGames(creatorId, page, limit);
        res.json((0, response_1.successResponse)(result.games, result.pagination));
    }),
};
exports.default = exports.gameController;
//# sourceMappingURL=gameController.js.map