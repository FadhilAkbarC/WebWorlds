"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
function getEnv(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value || defaultValue || '';
}
exports.config = {
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    PORT: parseInt(getEnv('PORT', '5000'), 10),
    HOST: getEnv('HOST', '0.0.0.0'),
    MONGODB_URI: getEnv('MONGODB_URI'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_EXPIRY: getEnv('JWT_EXPIRY', '7d'),
    CORS_ORIGIN: process.env.NODE_ENV === 'production' ? getEnv('CORS_ORIGIN') : getEnv('CORS_ORIGIN', 'http://localhost:3000'),
    RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
    IS_PRODUCTION: getEnv('NODE_ENV', 'development') === 'production',
};
function validateConfig() {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
        console.error('📋 Copy .env.example to .env.local and fill in values');
        process.exit(1);
    }
    console.log('✅ Configuration validated');
}
exports.default = exports.config;
//# sourceMappingURL=env.js.map