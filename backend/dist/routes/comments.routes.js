"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = __importDefault(require("../controllers/comment.controller"));
const auth_1 = require("../middleware/auth");
const response_cache_1 = require("../middleware/response-cache");
const router = (0, express_1.Router)();
router.get('/games/:gameId/comments', auth_1.optionalAuth, (0, response_cache_1.cacheResponse)({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
}), comment_controller_1.default.getGameComments);
router.post('/games/:gameId/comments', auth_1.authenticateToken, comment_controller_1.default.createComment);
router.delete('/comments/:commentId', auth_1.authenticateToken, comment_controller_1.default.deleteComment);
router.post('/comments/:commentId/like', auth_1.authenticateToken, comment_controller_1.default.likeComment);
router.post('/comments/:commentId/unlike', auth_1.authenticateToken, comment_controller_1.default.unlikeComment);
exports.default = router;
//# sourceMappingURL=comments.routes.js.map