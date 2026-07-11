import { createServer } from 'http';
import logger from './utils/logger';

// Initialize queue processors
// import taskPollerService from './infrastructure/scheduler/task-poller';
import app from './app';
import config from './config';
import cached from './infrastructure/cache/cache';


const startServer = async () => {
  try {
    // Connect to Redis
    await cached.connect();

    // Create HTTP server
    const httpServer = createServer(app);


    // Start HTTP server
    httpServer.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on http://localhost:${config.port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      httpServer.close(async () => {
        logger.info('HTTP server closed');

        // Close Redis connection
        await cached.disconnect();

        logger.info('All connections closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
