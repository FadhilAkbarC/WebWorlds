"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() {
        this.logLevelMap = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.currentLevel = process.env.LOG_LEVEL || 'info';
        this.isDev = process.env.NODE_ENV !== 'production';
    }
    shouldLog(level) {
        return this.logLevelMap[level] >= this.logLevelMap[this.currentLevel];
    }
    debug(message, context) {
        if (!this.isDev || !this.shouldLog('debug'))
            return;
        console.log(`[DEBUG] ${message}`, context || '');
    }
    info(message, context) {
        if (!this.shouldLog('info'))
            return;
        if (this.isDev)
            console.log(`[INFO] ${message}`, context || '');
    }
    warn(message, context) {
        if (!this.shouldLog('warn'))
            return;
        console.warn(`[WARN] ${message}`, context || '');
    }
    error(message, error, context) {
        if (!this.shouldLog('error'))
            return;
        const errorInfo = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: this.isDev ? error.stack : undefined,
        } : error;
        console.error(`[ERROR] ${message}`, { ...context, error: errorInfo });
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map