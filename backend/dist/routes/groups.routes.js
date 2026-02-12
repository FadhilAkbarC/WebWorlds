"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const group_controller_1 = __importDefault(require("../controllers/group.controller"));
const auth_1 = require("../middleware/auth");
const response_cache_1 = require("../middleware/response-cache");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, response_cache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
    varyByAuth: true,
    privateCache: true,
}), group_controller_1.default.list);
router.get('/mine', auth_1.authenticateToken, group_controller_1.default.mine);
router.get('/:id', auth_1.optionalAuth, (0, response_cache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
    varyByAuth: true,
    privateCache: true,
}), group_controller_1.default.get);
router.post('/', auth_1.authenticateToken, group_controller_1.default.create);
router.post('/:id/join', auth_1.authenticateToken, group_controller_1.default.join);
router.post('/:id/leave', auth_1.authenticateToken, group_controller_1.default.leave);
exports.default = router;
//# sourceMappingURL=groups.routes.js.map