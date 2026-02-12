"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = void 0;
const models_1 = require("../models");
const error_handler_1 = require("../middleware/error-handler");
exports.commentController = {
    getGameComments: (0, error_handler_1.asyncHandler)(async (req, res) => {
        const { gameId } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            models_1.Comment.find({ gameId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.Comment.countDocuments({ gameId }),
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
    createComment: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { gameId } = req.params;
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            throw new error_handler_1.AppError(400, 'Comment text is required');
        }
        if (text.length > 500) {
            throw new error_handler_1.AppError(400, 'Comment must be 500 characters or less');
        }
        const user = await models_1.User.findById(req.userId);
        if (!user) {
            throw new error_handler_1.AppError(404, 'User not found');
        }
        const comment = new models_1.Comment({
            gameId,
            userId: req.userId,
            username: user.username,
            avatar: user.avatar,
            text: text.trim(),
        });
        await comment.save();
        try {
            const game = await models_1.Game.findById(gameId).select('title').lean();
            await models_1.Activity.create({
                user: req.userId,
                type: 'comment',
                targetId: comment._id,
                targetType: 'Comment',
                meta: { gameId, gameTitle: game?.title },
            });
        }
        catch (e) {
            console.warn('Failed to create activity for comment', e);
        }
        res.status(201).json({
            success: true,
            data: comment,
        });
    }),
    deleteComment: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { commentId } = req.params;
        const comment = await models_1.Comment.findById(commentId);
        if (!comment) {
            throw new error_handler_1.AppError(404, 'Comment not found');
        }
        if (comment.userId.toString() !== req.userId) {
            throw new error_handler_1.AppError(403, 'Not authorized to delete this comment');
        }
        await models_1.Comment.findByIdAndDelete(commentId);
        try {
            await models_1.Activity.deleteMany({ targetId: commentId, type: 'comment' });
        }
        catch (e) {
            console.warn('Failed to cleanup activities for deleted comment', e);
        }
        res.json({
            success: true,
            message: 'Comment deleted',
        });
    }),
    likeComment: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { commentId } = req.params;
        const comment = await models_1.Comment.findById(commentId);
        if (!comment) {
            throw new error_handler_1.AppError(404, 'Comment not found');
        }
        if (comment.likedBy.includes(req.userId)) {
            throw new error_handler_1.AppError(409, 'Already liked this comment');
        }
        comment.likes += 1;
        comment.likedBy.push(req.userId);
        await comment.save();
        try {
            await models_1.Activity.create({
                user: req.userId,
                type: 'like',
                targetId: comment._id,
                targetType: 'Comment',
                meta: {},
            });
        }
        catch (e) {
            console.warn('Failed to create activity for comment like', e);
        }
        res.json({
            success: true,
            data: comment,
        });
    }),
    unlikeComment: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { commentId } = req.params;
        const comment = await models_1.Comment.findById(commentId);
        if (!comment) {
            throw new error_handler_1.AppError(404, 'Comment not found');
        }
        const likedIndex = comment.likedBy.findIndex((id) => id.toString() === req.userId);
        if (likedIndex === -1) {
            throw new error_handler_1.AppError(409, 'Haven\'t liked this comment');
        }
        comment.likes = Math.max(0, comment.likes - 1);
        comment.likedBy.splice(likedIndex, 1);
        await comment.save();
        try {
            await models_1.Activity.deleteMany({ user: req.userId, targetId: comment._id, type: 'like' });
        }
        catch (e) {
            console.warn('Failed to remove comment like activity', e);
        }
        res.json({
            success: true,
            data: comment,
        });
    }),
};
exports.default = exports.commentController;
//# sourceMappingURL=comment.controller.js.map