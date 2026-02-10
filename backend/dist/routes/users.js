"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const responseCache_1 = require("../middleware/responseCache");
const router = (0, express_1.Router)();
router.get('/', (0, responseCache_1.cacheResponse)({
    ttlMs: 15000,
    maxAgeSeconds: 20,
    staleWhileRevalidateSeconds: 120,
}), userController_1.default.list);
exports.default = router;
//# sourceMappingURL=users.js.map