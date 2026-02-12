"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activity_controller_1 = __importDefault(require("../controllers/activity.controller"));
const response_cache_1 = require("../middleware/response-cache");
const router = express_1.default.Router();
router.get('/users/:userId/activities', (0, response_cache_1.cacheResponse)({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
}), activity_controller_1.default.getUserActivities);
exports.default = router;
//# sourceMappingURL=activities.routes.js.map