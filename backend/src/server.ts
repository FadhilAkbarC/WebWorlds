import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
import http from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { setupSocket } from './config/socket';
import { config, validateConfig } from './config/env';

async function main() {
  try {
    // ============ Validate Configuration ============
    console.log('\n🔍 Validating configuration...');
    validateConfig();

    // ============ Connect Database ============
    console.log('🔌 Connecting to MongoDB...');
    await connectDatabase();

    // ============ Create Express App ============
    const app = createApp();

    // ============ Create HTTP Server ============
    const httpServer = http.createServer(app);

    // ============ Setup WebSocket ============
    console.log('📡 Setting up Socket.io...');
    const io = setupSocket(httpServer);

    // ============ Start Server ============
    await new Promise<void>((resolve) => {
      httpServer.listen(config.PORT, config.HOST, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 WebWorlds Backend Server Running');
        console.log('='.repeat(50));
        console.log(`📍 Host: ${config.HOST}`);
        console.log(`📍 Port: ${config.PORT}`);
        console.log(`📍 Environment: ${config.NODE_ENV}`);
        console.log(`📍 Database: MongoDB`);
        console.log(`📍 WebSocket: Socket.io enabled`);
        console.log('='.repeat(50));
        console.log('\n📚 API Documentation: http://localhost:${config.PORT}/api');
        console.log('❤️  Health Check: http://localhost:${config.PORT}/health\n');

        resolve();
      });
    });

    // ============ Graceful Shutdown ============
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    async function gracefulShutdown() {
      console.log('\n\n🛑 Shutdown signal received...');
      console.log('🔄 Closing connections gracefully...');

      httpServer.close(async () => {
        console.log('✅ HTTP server closed');
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();
        console.log('✅ Database disconnected');
        console.log('👋 Server shut down complete.\n');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }
  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(error);
    process.exit(1);
  }
}

// Run server
main();
