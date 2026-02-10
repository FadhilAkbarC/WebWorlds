"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
exports.authController = {
    register: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const body = typeof req.body === 'string'
            ? (() => {
                try {
                    return JSON.parse(req.body);
                }
                catch {
                    return {};
                }
            })()
            : req.body || {};
        const usernameInput = typeof body.username === 'string' ? body.username.trim() : '';
        const emailInput = typeof body.email === 'string' ? body.email.trim() : '';
        const passwordInput = typeof body.password === 'string' ? body.password : '';
        const username = usernameInput.toLowerCase();
        const email = emailInput.toLowerCase();
        const password = passwordInput;
        if (!username || !email || !password) {
            throw new errorHandler_1.AppError(400, 'Missing required fields: username, email, password');
        }
        if (!validation_1.validators.username(username)) {
            throw new errorHandler_1.AppError(400, 'Username must be 3-30 chars, letters, numbers, _, or -');
        }
        if (!validation_1.validators.email(email)) {
            throw new errorHandler_1.AppError(400, 'Invalid email format');
        }
        if (!validation_1.validators.password(password)) {
            throw new errorHandler_1.AppError(400, 'Password must be 8+ chars with uppercase, lowercase, and number');
        }
        const existing = await models_1.User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        });
        if (existing) {
            throw new errorHandler_1.AppError(409, 'Username or email already registered');
        }
        const user = new models_1.User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            passwordHash: password,
        });
        await user.save();
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                stats: user.stats,
                createdAt: user.createdAt,
            },
        });
    }),
    login: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError(400, 'Email and password required');
        }
        const user = await models_1.User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.json({
            token,
            user: {
                _id: user._id,
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats,
                bio: user.bio,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    }),
    me: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const user = await models_1.User.findById(req.userId);
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        res.json({
            _id: user._id,
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            stats: user.stats,
            createdGames: user.createdGames.length,
            followers: user.followers.length,
            createdAt: user.createdAt,
        });
    }),
    getProfile: (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const user = await models_1.User.findById(id)
            .select('username email bio avatar stats createdAt followers following')
            .lean();
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        res.json(user);
    }),
};
exports.default = exports.authController;
//# sourceMappingURL=authController.js.map