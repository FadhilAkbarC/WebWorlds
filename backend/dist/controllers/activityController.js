"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityController = void 0;
const Activity_1 = require("../models/Activity");
const errorHandler_1 = require("../middleware/errorHandler");
exports.activityController = {
    getUserActivities: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { userId } = req.params;
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20')));
        const skip = (page - 1) * limit;
        const [activities, total] = await Promise.all([
            Activity_1.Activity.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Activity_1.Activity.countDocuments({ user: userId }),
        ]);
        res.json({
            success: true,
            data: activities,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }),
};
exports.default = exports.activityController;
//# sourceMappingURL=activityController.js.map