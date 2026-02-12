"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const response_cache_1 = require("../middleware/response-cache");
const router = (0, express_1.Router)();
router.get('/', (0, response_cache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
}), user_controller_1.default.list);
exports.default = router;
//# sourceMappingURL=users.routes.js.map