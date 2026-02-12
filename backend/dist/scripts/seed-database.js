"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
const SEED_DATA = {
    users: [
        {
            username: 'demo',
            email: 'demo@example.com',
            passwordHash: 'Password123',
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
async function seedDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webworlds';
        logger_1.logger.info('🌱 Seeding database with demo data...');
        await mongoose_1.default.connect(mongoUri);
        const existingUser = await models_1.User.findOne({ username: 'demo' });
        if (existingUser) {
            logger_1.logger.warn('⚠️ Demo user already exists, skipping seed');
            return;
        }
        logger_1.logger.info('👥 Creating demo users...');
        const createdUsers = await models_1.User.insertMany(SEED_DATA.users);
        logger_1.logger.info(`✅ Created ${createdUsers.length} users`);
        logger_1.logger.info('🎮 Creating demo games...');
        const gamesToCreate = SEED_DATA.games.map((game, idx) => ({
            ...game,
            creator: createdUsers[idx % createdUsers.length]._id,
        }));
        const createdGames = await models_1.Game.insertMany(gamesToCreate);
        logger_1.logger.info(`✅ Created ${createdGames.length} games`);
        for (let i = 0; i < createdUsers.length; i++) {
            const userGames = createdGames
                .map((game, idx) => (idx % createdUsers.length === i ? game._id : null))
                .filter(Boolean);
            if (userGames.length > 0) {
                await models_1.User.findByIdAndUpdate(createdUsers[i]._id, {
                    createdGames: userGames,
                    'stats.gamesCreated': userGames.length,
                });
            }
        }
        logger_1.logger.info('🎉 Database seeding complete!');
        logger_1.logger.info('📊 Demo users:');
        createdUsers.forEach(user => {
            logger_1.logger.info(`  - ${user.username} (${user.email})`);
        });
        logger_1.logger.info('🎮 Demo games:');
        createdGames.forEach(game => {
            logger_1.logger.info(`  - ${game.title}`);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Seeding failed', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
seedDatabase();
//# sourceMappingURL=seed-database.js.map