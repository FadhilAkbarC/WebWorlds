"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
exports.gameController = {
    list: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
        const search = req.query.search?.trim() || '';
        const category = req.query.category?.trim() || '';
        const skip = (page - 1) * limit;
        const query = { published: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        if (category && validation_1.validators.category(category)) {
            query.category = category;
        }
        const [games, total] = await Promise.all([
            models_1.Game.find(query)
                .populate('creator', 'username avatar')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            models_1.Game.countDocuments(query),
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
    get: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const game = await models_1.Game.findById(id).populate('creator', 'username avatar');
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        await models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.plays': 1 } });
        res.json({
            success: true,
            data: game,
        });
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
        await models_1.User.findByIdAndUpdate(req.userId, {
            $push: { createdGames: game._id },
            $inc: { 'stats.gamesCreated': 1 },
        });
        res.status(201).json({
            success: true,
            data: game,
        });
    }),
    update: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const { title, description, code, settings, scripts, assets } = req.body;
        const game = await models_1.Game.findById(id);
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        if (game.creator.toString() !== req.userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to update this game');
        }
        if (title && !validation_1.validators.title(title)) {
            throw new errorHandler_1.AppError(400, 'Invalid title');
        }
        if (settings && !validation_1.validators.gameSettings(settings)) {
            throw new errorHandler_1.AppError(400, 'Invalid game settings');
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
        res.json({
            success: true,
            data: game,
        });
    }),
    publish: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const game = await models_1.Game.findById(id);
        if (!game) {
            throw new errorHandler_1.AppError(404, 'Game not found');
        }
        if (game.creator.toString() !== req.userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized');
        }
        game.published = true;
        await game.save();
        res.json({
            success: true,
            data: game,
        });
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
            throw new errorHandler_1.AppError(403, 'Not authorized');
        }
        await models_1.User.findByIdAndUpdate(game.creator, {
            $pull: { createdGames: game._id },
            $inc: { 'stats.gamesCreated': -1 },
        });
        await models_1.Game.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Game deleted',
        });
    }),
    like: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const user = await models_1.User.findById(req.userId);
        if (user?.likedGames.includes(id)) {
            throw new errorHandler_1.AppError(409, 'Already liked this game');
        }
        const game = await models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.likes': 1 } }, { new: true });
        await models_1.User.findByIdAndUpdate(req.userId, {
            $push: { likedGames: id },
        });
        res.json({
            success: true,
            data: game,
        });
    }),
    unlike: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const game = await models_1.Game.findByIdAndUpdate(id, { $inc: { 'stats.likes': -1 } }, { new: true });
        await models_1.User.findByIdAndUpdate(req.userId, {
            $pull: { likedGames: id },
        });
        res.json({
            success: true,
            data: game,
        });
    }),
    getByCreator: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { creatorId } = req.params;
        const games = await models_1.Game.find({ creator: creatorId, published: true })
            .populate('creator', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            success: true,
            data: games,
        });
    }),
};
exports.default = exports.gameController;
//# sourceMappingURL=gameController.js.map