"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentController_1 = __importDefault(require("../controllers/commentController"));
const auth_1 = require("../middleware/auth");
const responseCache_1 = require("../middleware/responseCache");
const router = (0, express_1.Router)();
router.get('/games/:gameId/comments', auth_1.optionalAuth, (0, responseCache_1.cacheResponse)({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
}), commentController_1.default.getGameComments);
router.post('/games/:gameId/comments', auth_1.authenticateToken, commentController_1.default.createComment);
router.delete('/comments/:commentId', auth_1.authenticateToken, commentController_1.default.deleteComment);
router.post('/comments/:commentId/like', auth_1.authenticateToken, commentController_1.default.likeComment);
router.post('/comments/:commentId/unlike', auth_1.authenticateToken, commentController_1.default.unlikeComment);
exports.default = router;
//# sourceMappingURL=comments.js.map