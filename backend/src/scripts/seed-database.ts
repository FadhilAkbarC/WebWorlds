import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Game } from '../models';
import { logger } from '../utils/logger';

/**
 * Seed Database with Sample Data
 * Creates demo users and games for testing
 */

const SEED_DATA = {
  users: [
    {
      username: 'demo',
      email: 'demo@example.com',
      passwordHash: 'Password123', // Will be hashed by pre-save hook
      bio: 'Demo user for testing',
      stats: {
        gamesCreated: 2,
        gamesPlayed: 5,
        followers: 10,
        totalPlaytime: 3600,
      },
    },
    {
      username: 'testcreator',
      email: 'creator@example.com',
      passwordHash: 'CreatorPass123',
      bio: 'Game creator user',
      stats: {
        gamesCreated: 1,
        gamesPlayed: 2,
        followers: 5,
        totalPlaytime: 1800,
      },
    },
  ],
  games: [
    {
      title: 'Flappy Bird Clone',
      description: 'A fun bird flying game inspired by the classic Flappy Bird',
      category: 'action',
      settings: {
        width: 400,
        height: 600,
        fps: 60,
        isMultiplayer: false,
      },
      stats: {
        plays: 42,
        likes: 15,
        averageRating: 4.2,
        totalRatings: 5,
      },
      tags: ['bird', 'flying', 'casual'],
      published: true,
      code: `
// Flappy Bird Game
const bird = { x: 50, y: 300, velocity: 0 };
const pipes = [];

function update() {
  bird.velocity += 0.2; // Gravity
  bird.y += bird.velocity;
  
  if (isKeyPressed('Space')) {
    bird.velocity = -5;
  }
}

function render() {
  drawCircle(bird.x, bird.y, 10, 'yellow');
}
      `,
    },
    {
      title: 'Snake Puzzle',
      description: 'Classic snake game with a twist - solve puzzles to level up',
      category: 'puzzle',
      settings: {
        width: 800,
        height: 600,
        fps: 10,
        isMultiplayer: false,
      },
      stats: {
        plays: 128,
        likes: 45,
        averageRating: 4.7,
        totalRatings: 18,
      },
      tags: ['snake', 'puzzle', 'retro'],
      published: true,
      code: `
// Snake Game
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};

function handleInput() {
  if (isKeyPressed('ArrowUp')) snake.direction = 'up';
  if (isKeyPressed('ArrowDown')) snake.direction = 'down';
  if (isKeyPressed('ArrowLeft')) snake.direction = 'left';
  if (isKeyPressed('ArrowRight')) snake.direction = 'right';
}
      `,
    },
    {
      title: 'Space Explorer',
      description: 'Adventure through space and explore distant planets',
      category: 'adventure',
      settings: {
        width: 1024,
        height: 768,
        fps: 60,
        isMultiplayer: true,
        maxPlayers: 4,
      },
      stats: {
        plays: 87,
        likes: 32,
        averageRating: 4.1,
        totalRatings: 9,
      },
      tags: ['space', 'adventure', 'multiplayer'],
      published: true,
      code: `
// Space Explorer Game
const player = { x: 512, y: 384, speed: 5 };
const asteroids = [];

function handleMovement() {
  if (isKeyPressed('w')) player.y -= player.speed;
  if (isKeyPressed('a')) player.x -= player.speed;
  if (isKeyPressed('s')) player.y += player.speed;
  if (isKeyPressed('d')) player.x += player.speed;
}
      `,
    },
  ],
};

async function seedDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webworlds';

    logger.info('🌱 Seeding database with demo data...');
    await mongoose.connect(mongoUri);

    // Clear existing data (optional - comment out to preserve)
    // await User.deleteMany({});
    // await Game.deleteMany({});

    // Check if demo user already exists
    const existingUser = await User.findOne({ username: 'demo' });
    if (existingUser) {
      logger.warn('⚠️ Demo user already exists, skipping seed');
      return;
    }

    // Create users
    logger.info('👥 Creating demo users...');
    const createdUsers = await User.insertMany(SEED_DATA.users);
    logger.info(`✅ Created ${createdUsers.length} users`);

    // Create games
    logger.info('🎮 Creating demo games...');
    const gamesToCreate = SEED_DATA.games.map((game, idx) => ({
      ...game,
      creator: createdUsers[idx % createdUsers.length]._id,
    }));

    const createdGames = await Game.insertMany(gamesToCreate);
    logger.info(`✅ Created ${createdGames.length} games`);

    // Update user's created games
    for (let i = 0; i < createdUsers.length; i++) {
      const userGames = createdGames
        .map((game, idx) => (idx % createdUsers.length === i ? game._id : null))
        .filter(Boolean);

      if (userGames.length > 0) {
        await User.findByIdAndUpdate(createdUsers[i]._id, {
          createdGames: userGames,
          'stats.gamesCreated': userGames.length,
        });
      }
    }

    logger.info('🎉 Database seeding complete!');
    logger.info('📊 Demo users:');
    createdUsers.forEach(user => {
      logger.info(`  - ${user.username} (${user.email})`);
    });
    logger.info('🎮 Demo games:');
    createdGames.forEach(game => {
      logger.info(`  - ${game.title}`);
    });

  } catch (error) {
    logger.error('❌ Seeding failed', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run seeding
seedDatabase();
