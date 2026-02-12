"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, next) {
    console.error(`❌ Error [${new Date().toISOString()}]:`, err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({ error: messages.join(', ') });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        res.status(409).json({ error: `${field} already exists` });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method,
    });
}
//# sourceMappingURL=error-handler.js.map