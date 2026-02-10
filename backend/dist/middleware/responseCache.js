"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheResponse = void 0;
const cache_1 = require("../utils/cache");
const DEFAULT_TTL_MS = 15000;
const DEFAULT_MAX_AGE = 30;
const DEFAULT_STALE = 300;
const pickHeaders = (res) => {
    const contentType = res.getHeader('content-type');
    const cacheControl = res.getHeader('cache-control');
    const etag = res.getHeader('etag');
    return {
        ...(contentType ? { 'content-type': String(contentType) } : {}),
        ...(cacheControl ? { 'cache-control': String(cacheControl) } : {}),
        ...(etag ? { etag: String(etag) } : {}),
    };
};
const cacheResponse = (options = {}) => (req, res, next) => {
    if (req.method !== 'GET')
        return next();
    const { ttlMs = DEFAULT_TTL_MS, varyByAuth = false, cacheKeyPrefix = 'http-cache', maxAgeSeconds = DEFAULT_MAX_AGE, staleWhileRevalidateSeconds = DEFAULT_STALE, privateCache = false, } = options;
    const userId = varyByAuth ? req.userId || 'anon' : 'public';
    const cacheKey = `${cacheKeyPrefix}:${req.originalUrl}:${userId}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        Object.entries(cached.headers).forEach(([key, value]) => res.setHeader(key, value));
        return res.status(cached.status).json(cached.body);
    }
    const cacheControl = `${privateCache ? 'private' : 'public'}, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`;
    if (!res.getHeader('cache-control')) {
        res.setHeader('cache-control', cacheControl);
    }
    if (varyByAuth) {
        res.setHeader('vary', 'authorization');
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache_1.cache.set(cacheKey, {
                status: res.statusCode,
                body,
                headers: pickHeaders(res),
            }, ttlMs);
        }
        return originalJson(body);
    };
    next();
};
exports.cacheResponse = cacheResponse;
//# sourceMappingURL=responseCache.js.map