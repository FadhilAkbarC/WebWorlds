"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.currentLevel = process.env.LOG_LEVEL || 'info';
    }
    shouldLog(level) {
        return this.levels[level] >= this.levels[this.currentLevel];
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        const emoji = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
        }[level];
        return `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`;
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message), data || '');
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message), data || '');
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), data || '');
        }
    }
    error(message, error) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message));
            if (error instanceof Error) {
                console.error('Error:', error.message);
                if (process.env.NODE_ENV === 'development') {
                    console.error('Stack:', error.stack);
                }
            }
            else if (error) {
                console.error('Details:', error);
            }
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map