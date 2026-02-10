"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = __importDefault(require("../controllers/gameController"));
const auth_1 = require("../middleware/auth");
const responseCache_1 = require("../middleware/responseCache");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, responseCache_1.cacheResponse)({
    ttlMs: 20000,
    maxAgeSeconds: 30,
    staleWhileRevalidateSeconds: 300,
}), gameController_1.default.list);
router.get('/creator/:creatorId', auth_1.optionalAuth, (0, responseCache_1.cacheResponse)({
    ttlMs: 20000,
    maxAgeSeconds: 30,
    staleWhileRevalidateSeconds: 300,
}), gameController_1.default.getByCreator);
router.get('/:id', auth_1.optionalAuth, gameController_1.default.get);
router.get('/:id/like-status', auth_1.optionalAuth, gameController_1.default.likeStatus);
router.post('/', auth_1.authenticateToken, gameController_1.default.create);
router.put('/:id', auth_1.authenticateToken, gameController_1.default.update);
router.post('/:id/publish', auth_1.authenticateToken, gameController_1.default.publish);
router.delete('/:id', auth_1.authenticateToken, gameController_1.default.delete);
router.post('/:id/like', auth_1.authenticateToken, gameController_1.default.like);
router.post('/:id/unlike', auth_1.authenticateToken, gameController_1.default.unlike);
exports.default = router;
//# sourceMappingURL=games.js.map