"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const database_1 = require("./config/database");
const socket_1 = require("./config/socket");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const services_1 = require("./services");
let httpServer;
async function main() {
    try {
        logger_1.logger.info('Validating configuration...');
        (0, env_1.validateConfig)();
        logger_1.logger.info('Connecting to MongoDB...');
        await (0, database_1.connectDatabase)();
        const app = (0, app_1.createApp)();
        httpServer = http_1.default.createServer(app);
        logger_1.logger.info('Setting up Socket.io...');
        const io = (0, socket_1.setupSocket)(httpServer);
        await new Promise((resolve) => {
            httpServer.listen(env_1.config.PORT, env_1.config.HOST, () => {
                const startupLog = [
                    '',
                    '='.repeat(50),
                    '🚀 WebWorlds Backend Server Running',
                    '='.repeat(50),
                    `📍 Host: ${env_1.config.HOST}`,
                    `📍 Port: ${env_1.config.PORT}`,
                    `📍 Environment: ${env_1.config.NODE_ENV}`,
                    `📍 Database: MongoDB`,
                    `📍 WebSocket: Socket.io enabled`,
                    '='.repeat(50),
                    `📚 API Docs: http://${env_1.config.HOST}:${env_1.config.PORT}/api`,
                    `❤️  Health: http://${env_1.config.HOST}:${env_1.config.PORT}/health`,
                    '',
                ];
                if (process.env.NODE_ENV === 'development') {
                    console.log(startupLog.join('\n'));
                }
                else {
                    logger_1.logger.info('Server started', {
                        host: env_1.config.HOST,
                        port: env_1.config.PORT,
                        environment: env_1.config.NODE_ENV,
                    });
                }
                resolve();
            });
        });
        setupGracefulShutdown();
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', error);
        process.exit(1);
    }
}
function setupGracefulShutdown() {
    let shutdown = false;
    const shutdown_handler = async () => {
        if (shutdown)
            return;
        shutdown = true;
        logger_1.logger.info('Shutdown signal received');
        if (httpServer) {
            httpServer.close(async () => {
                logger_1.logger.info('HTTP server closed');
                await (0, database_1.disconnectDatabase)();
                services_1.sessionManager.shutdown();
                logger_1.logger.info('Server shutdown complete');
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown - timeout exceeded');
                process.exit(1);
            }, 30000);
        }
        else {
            process.exit(0);
        }
    };
    process.on('SIGTERM', shutdown_handler);
    process.on('SIGINT', shutdown_handler);
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught exception', error);
        shutdown_handler();
    });
    process.on('unhandledRejection', (reason) => {
        logger_1.logger.error('Unhandled rejection', reason instanceof Error ? reason : new Error(String(reason)));
        shutdown_handler();
    });
}
main();
//# sourceMappingURL=server.js.map