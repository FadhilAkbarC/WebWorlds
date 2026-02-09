"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }
    set(key, value, ttlMs = 5000) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        const expiresAt = Date.now() + ttlMs;
        this.cache.set(key, { value, expiresAt });
        const timer = setTimeout(() => {
            this.cache.delete(key);
            this.timers.delete(key);
        }, ttlMs);
        this.timers.set(key, timer);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    delete(key) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }
    clear() {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.cache.clear();
        this.timers.clear();
    }
    getStats() {
        return {
            size: this.cache.size,
            memory: process.memoryUsage().heapUsed,
        };
    }
}
exports.cache = new CacheManager();
//# sourceMappingURL=cache.js.map