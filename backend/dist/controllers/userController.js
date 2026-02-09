"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const response_1 = require("../utils/response");
exports.userController = {
    list: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
        const search = req.query.search?.trim().toLowerCase() || '';
        const query = {};
        if (search) {
            query.username = { $regex: search, $options: 'i' };
        }
        const total = await models_1.User.countDocuments(query);
        const pages = Math.max(1, Math.ceil(total / limit));
        const users = await models_1.User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('username avatar bio stats createdAt')
            .lean();
        res.json((0, response_1.successResponse)(users, {
            page,
            limit,
            total,
            pages,
        }));
    }),
};
exports.default = exports.userController;
//# sourceMappingURL=userController.js.map