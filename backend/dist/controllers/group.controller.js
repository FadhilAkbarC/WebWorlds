"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const error_handler_1 = require("../middleware/error-handler");
const validation_1 = require("../middleware/validation");
const response_1 = require("../utils/response");
const normalizeBody = (body) => typeof body === 'string'
    ? (() => {
        try {
            return JSON.parse(body);
        }
        catch {
            return {};
        }
    })()
    : body || {};
exports.groupController = {
    list: (0, error_handler_1.asyncHandler)(async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
        const search = req.query.search?.trim() || '';
        const visibilityFilter = req.userId
            ? {
                $or: [
                    { privacy: 'public' },
                    { owner: new mongoose_1.default.Types.ObjectId(req.userId) },
                    { members: new mongoose_1.default.Types.ObjectId(req.userId) },
                ],
            }
            : { privacy: 'public' };
        const searchFilter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ],
            }
            : null;
        const query = searchFilter ? { $and: [visibilityFilter, searchFilter] } : visibilityFilter;
        const total = await models_1.Group.countDocuments(query);
        const pages = Math.max(1, Math.ceil(total / limit));
        const groups = await models_1.Group.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('name description icon privacy owner members membersCount createdAt')
            .lean();
        const userId = req.userId ? String(req.userId) : null;
        const withFlags = groups.map((group) => ({
            ...group,
            isOwner: userId ? String(group.owner) === userId : false,
            isMember: userId
                ? String(group.owner) === userId ||
                    (group.members || []).some((member) => String(member) === userId)
                : false,
            members: undefined,
        }));
        res.json((0, response_1.successResponse)(withFlags, {
            page,
            limit,
            total,
            pages,
        }));
    }),
    get: (0, error_handler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_handler_1.AppError(400, 'Invalid group id');
        }
        const group = await models_1.Group.findById(id).lean();
        if (!group) {
            throw new error_handler_1.AppError(404, 'Group not found');
        }
        const userId = req.userId ? String(req.userId) : null;
        const isMember = userId
            ? String(group.owner) === userId ||
                (group.members || []).some((member) => String(member) === userId)
            : false;
        if (group.privacy === 'private' && !isMember) {
            throw new error_handler_1.AppError(403, 'Group is private');
        }
        res.json((0, response_1.successResponse)({
            ...group,
            isOwner: userId ? String(group.owner) === userId : false,
            isMember,
            members: undefined,
        }));
    }),
    create: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const body = normalizeBody(req.body);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const description = typeof body.description === 'string' ? body.description.trim() : '';
        const privacy = typeof body.privacy === 'string' ? body.privacy.trim().toLowerCase() : 'public';
        const icon = typeof body.icon === 'string' ? body.icon.trim() : '';
        if (!name) {
            throw new error_handler_1.AppError(400, 'Group name is required');
        }
        if (!validation_1.validators.title(name)) {
            throw new error_handler_1.AppError(400, 'Group name must be 3-100 characters');
        }
        if (description && !validation_1.validators.description(description)) {
            throw new error_handler_1.AppError(400, 'Description max 1000 characters');
        }
        if (privacy !== 'public' && privacy !== 'private') {
            throw new error_handler_1.AppError(400, 'Invalid privacy setting');
        }
        if (icon) {
            const isDataUrl = icon.startsWith('data:image/');
            if (!isDataUrl && !validation_1.validators.url(icon)) {
                throw new error_handler_1.AppError(400, 'Invalid icon URL');
            }
        }
        const group = new models_1.Group({
            name,
            description,
            privacy,
            icon: icon || undefined,
            owner: req.userId,
            members: [req.userId],
            membersCount: 1,
        });
        await group.save();
        res.status(201).json((0, response_1.successResponse)(group));
    }),
    join: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_handler_1.AppError(400, 'Invalid group id');
        }
        const group = await models_1.Group.findById(id);
        if (!group) {
            throw new error_handler_1.AppError(404, 'Group not found');
        }
        if (group.privacy === 'private') {
            throw new error_handler_1.AppError(403, 'Group is private');
        }
        const alreadyMember = group.members.some((member) => String(member) === String(req.userId));
        if (!alreadyMember) {
            group.members.push(new mongoose_1.default.Types.ObjectId(req.userId));
            group.membersCount = Math.max(1, group.membersCount + 1);
            await group.save();
        }
        res.json((0, response_1.successResponse)({ joined: true }));
    }),
    leave: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_handler_1.AppError(400, 'Invalid group id');
        }
        const group = await models_1.Group.findById(id);
        if (!group) {
            throw new error_handler_1.AppError(404, 'Group not found');
        }
        const beforeCount = group.members.length;
        group.members = group.members.filter((member) => String(member) !== String(req.userId));
        if (group.members.length !== beforeCount) {
            group.membersCount = Math.max(0, group.membersCount - 1);
            await group.save();
        }
        res.json((0, response_1.successResponse)({ left: true }));
    }),
    mine: (0, error_handler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new error_handler_1.AppError(401, 'Not authenticated');
        }
        const groups = await models_1.Group.find({
            $or: [{ owner: req.userId }, { members: req.userId }],
        })
            .sort({ createdAt: -1 })
            .select('name description icon privacy owner membersCount createdAt')
            .lean();
        res.json((0, response_1.successResponse)(groups));
    }),
};
exports.default = exports.groupController;
//# sourceMappingURL=group.controller.js.map