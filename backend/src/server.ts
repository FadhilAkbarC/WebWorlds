import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import http from 'http';
import { createApp } from './create-app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { setupSocket } from './config/socket';
import { config, validateConfig } from './config/env';
import { logger } from './utils/logger';
import { sessionManager } from './services';

let httpServer: http.Server;

async function main() {
  try {
    // ============ Validate Configuration ============
    logger.info('Validating configuration...');
    validateConfig();

    // ============ Connect Database ============
    logger.info('Connecting to MongoDB...');
    await connectDatabase();

    // ============ Create Express App ============
    const app = createApp();

    // ============ Create HTTP Server ============
    httpServer = http.createServer(app);

    // ============ Setup WebSocket ============
    logger.info('Setting up Socket.io...');
    const io = setupSocket(httpServer);

    // ============ Start Server ============
    await new Promise<void>((resolve) => {
      httpServer.listen(config.PORT, config.HOST, () => {
        const startupLog = [
          '',
          '='.repeat(50),
          '🚀 WebWorlds Backend Server Running',
          '='.repeat(50),
          `📍 Host: ${config.HOST}`,
          `📍 Port: ${config.PORT}`,
          `📍 Environment: ${config.NODE_ENV}`,
          `📍 Database: MongoDB`,
          `📍 WebSocket: Socket.io enabled`,
          '='.repeat(50),
          `📚 API Docs: http://${config.HOST}:${config.PORT}/api`,
          `❤️  Health: http://${config.HOST}:${config.PORT}/health`,
          '',
        ];

        if (process.env.NODE_ENV === 'development') {
          console.log(startupLog.join('\n'));
        } else {
          logger.info('Server started', {
            host: config.HOST,
            port: config.PORT,
            environment: config.NODE_ENV,
          });
        }

        resolve();
      });
    });

    // ============ Graceful Shutdown ============
    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  let shutdown = false;

  const shutdown_handler = async () => {
    if (shutdown) return; // Prevent multiple shutdowns
    shutdown = true;

    logger.info('Shutdown signal received');

    // Close server
    if (httpServer) {
      httpServer.close(async () => {
        logger.info('HTTP server closed');

        // Close database
        await disconnectDatabase();

        // Cleanup session manager
        sessionManager.shutdown();

        logger.info('Server shutdown complete');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown - timeout exceeded');
        process.exit(1);
      }, 30000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown_handler);
  process.on('SIGINT', shutdown_handler);

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    shutdown_handler();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason instanceof Error ? reason : new Error(String(reason)));
    shutdown_handler();
  });
}

// Run server
main();
