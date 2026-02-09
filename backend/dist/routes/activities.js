"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = __importDefault(require("../controllers/activityController"));
const router = express_1.default.Router();
router.get('/users/:userId/activities', activityController_1.default.getUserActivities);
exports.default = router;
//# sourceMappingURL=activities.js.map