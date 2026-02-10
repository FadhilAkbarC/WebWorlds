"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = __importDefault(require("../controllers/activityController"));
const responseCache_1 = require("../middleware/responseCache");
const router = express_1.default.Router();
router.get('/users/:userId/activities', (0, responseCache_1.cacheResponse)({
    ttlMs: 10000,
    maxAgeSeconds: 10,
    staleWhileRevalidateSeconds: 60,
}), activityController_1.default.getUserActivities);
exports.default = router;
//# sourceMappingURL=activities.js.map