"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
async function main() {
    try {
        console.log('\n🔍 Validating configuration...');
        (0, env_1.validateConfig)();
        console.log('🔌 Connecting to MongoDB...');
        await (0, database_1.connectDatabase)();
        const app = (0, app_1.createApp)();
        const httpServer = http_1.default.createServer(app);
        console.log('📡 Setting up Socket.io...');
        const io = (0, socket_1.setupSocket)(httpServer);
        await new Promise((resolve) => {
            httpServer.listen(env_1.config.PORT, env_1.config.HOST, () => {
                console.log('\n' + '='.repeat(50));
                console.log('🚀 WebWorlds Backend Server Running');
                console.log('='.repeat(50));
                console.log(`📍 Host: ${env_1.config.HOST}`);
                console.log(`📍 Port: ${env_1.config.PORT}`);
                console.log(`📍 Environment: ${env_1.config.NODE_ENV}`);
                console.log(`📍 Database: MongoDB`);
                console.log(`📍 WebSocket: Socket.io enabled`);
                console.log('='.repeat(50));
                console.log('\n📚 API Documentation: http://localhost:${config.PORT}/api');
                console.log('❤️  Health Check: http://localhost:${config.PORT}/health\n');
                resolve();
            });
        });
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        async function gracefulShutdown() {
            console.log('\n\n🛑 Shutdown signal received...');
            console.log('🔄 Closing connections gracefully...');
            httpServer.close(async () => {
                console.log('✅ HTTP server closed');
                const { disconnectDatabase } = await Promise.resolve().then(() => __importStar(require('./config/database')));
                await disconnectDatabase();
                console.log('✅ Database disconnected');
                console.log('👋 Server shut down complete.\n');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('❌ Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        }
    }
    catch (error) {
        console.error('\n❌ Failed to start server:');
        console.error(error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=server.js.map