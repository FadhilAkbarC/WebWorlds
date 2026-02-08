import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Game, GameSession, Leaderboard } from '../models';
import { logger } from '../utils/logger';

/**
 * Database Initialization Script
 * Creates collections, indexes, and seed data if needed
 */

async function initializeDatabase(): Promise<void> {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webworlds';

    logger.info('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    logger.info('✅ Connected to MongoDB');

    // Create collections
    logger.info('📦 Creating collections...');

    // User collection
    if (!(await mongoose.connection.db?.listCollections({ name: 'users' }).toArray())?.length) {
      await User.collection.createIndex({ username: 1 });
      await User.collection.createIndex({ email: 1 });
      await User.collection.createIndex({ createdAt: -1 });
      logger.info('✅ Users collection created with indexes');
    }

    // Game collection
    if (!(await mongoose.connection.db?.listCollections({ name: 'games' }).toArray())?.length) {
      await Game.collection.createIndex({ creator: 1 });
      await Game.collection.createIndex({ createdAt: -1 });
      await Game.collection.createIndex({ 'stats.plays': -1 });
      await Game.collection.createIndex({ category: 1 });
      await Game.collection.createIndex({ published: 1 });
      logger.info('✅ Games collection created with indexes');
    }

    // GameSession collection
    if (
      !(await mongoose.connection.db?.listCollections({ name: 'gamesessions' }).toArray())
        ?.length
    ) {
      await GameSession.collection.createIndex({ game: 1, createdAt: -1 });
      await GameSession.collection.createIndex({ player: 1, createdAt: -1 });
      logger.info('✅ GameSessions collection created with indexes');
    }

    // Leaderboard collection
    if (
      !(await mongoose.connection.db?.listCollections({ name: 'leaderboards' }).toArray())
        ?.length
    ) {
      await Leaderboard.collection.createIndex({ game: 1, rank: 1 });
      await Leaderboard.collection.createIndex({ player: 1, game: 1 }, { unique: true });
      logger.info('✅ Leaderboards collection created with indexes');
    }

    logger.info('🎉 Database initialization complete!');
    logger.info('📊 Collections and indexes ready for use');

  } catch (error) {
    logger.error('❌ Database initialization failed', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  }
}

// Run initialization
initializeDatabase();
