"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
async function initializeDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webworlds';
        logger_1.logger.info('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        logger_1.logger.info('✅ Connected to MongoDB');
        logger_1.logger.info('📦 Creating collections...');
        if (!(await mongoose_1.default.connection.db?.listCollections({ name: 'users' }).toArray())?.length) {
            await models_1.User.collection.createIndex({ username: 1 });
            await models_1.User.collection.createIndex({ email: 1 });
            await models_1.User.collection.createIndex({ createdAt: -1 });
            logger_1.logger.info('✅ Users collection created with indexes');
        }
        if (!(await mongoose_1.default.connection.db?.listCollections({ name: 'games' }).toArray())?.length) {
            await models_1.Game.collection.createIndex({ creator: 1 });
            await models_1.Game.collection.createIndex({ createdAt: -1 });
            await models_1.Game.collection.createIndex({ 'stats.plays': -1 });
            await models_1.Game.collection.createIndex({ category: 1 });
            await models_1.Game.collection.createIndex({ published: 1 });
            logger_1.logger.info('✅ Games collection created with indexes');
        }
        if (!(await mongoose_1.default.connection.db?.listCollections({ name: 'gamesessions' }).toArray())
            ?.length) {
            await models_1.GameSession.collection.createIndex({ game: 1, createdAt: -1 });
            await models_1.GameSession.collection.createIndex({ player: 1, createdAt: -1 });
            logger_1.logger.info('✅ GameSessions collection created with indexes');
        }
        if (!(await mongoose_1.default.connection.db?.listCollections({ name: 'leaderboards' }).toArray())
            ?.length) {
            await models_1.Leaderboard.collection.createIndex({ game: 1, rank: 1 });
            await models_1.Leaderboard.collection.createIndex({ player: 1, game: 1 }, { unique: true });
            logger_1.logger.info('✅ Leaderboards collection created with indexes');
        }
        logger_1.logger.info('🎉 Database initialization complete!');
        logger_1.logger.info('📊 Collections and indexes ready for use');
    }
    catch (error) {
        logger_1.logger.error('❌ Database initialization failed', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        logger_1.logger.info('✅ Disconnected from MongoDB');
    }
}
initializeDatabase();
//# sourceMappingURL=initialize-database.js.map