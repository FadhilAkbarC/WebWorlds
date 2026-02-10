"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController_1 = __importDefault(require("../controllers/groupController"));
const auth_1 = require("../middleware/auth");
const responseCache_1 = require("../middleware/responseCache");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, responseCache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
    varyByAuth: true,
    privateCache: true,
}), groupController_1.default.list);
router.get('/mine', auth_1.authenticateToken, groupController_1.default.mine);
router.get('/:id', auth_1.optionalAuth, (0, responseCache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
    varyByAuth: true,
    privateCache: true,
}), groupController_1.default.get);
router.post('/', auth_1.authenticateToken, groupController_1.default.create);
router.post('/:id/join', auth_1.authenticateToken, groupController_1.default.join);
router.post('/:id/leave', auth_1.authenticateToken, groupController_1.default.leave);
exports.default = router;
//# sourceMappingURL=groups.js.map