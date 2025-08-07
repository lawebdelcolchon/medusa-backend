import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { connectDatabase } from './database/connection';
import { connectRedis } from './utils/redis';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import storeRoutes from './routes/store';
import healthRoutes from './routes/health';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      ...config.cors.storeCors.split(','),
      ...config.cors.adminCors.split(','),
      ...config.cors.authCors.split(',')
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-publishable-api-key', 'x-medusa-access-token']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.security.cookieSecret));

// Compression middleware
app.use(compression());

// Request ID middleware
app.use(requestId);

// Logging middleware
app.use(morgan(config.logging.format, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/store', storeRoutes);

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connections
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Global error handlers
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis (optional)
    if (config.redis.url) {
      await connectRedis();
      logger.info('Redis connected successfully');
    }

    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Server running on ${config.server.host}:${config.server.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🗄️  Database: ${config.database.host}:${config.database.port}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

let server: any;
startServer().then(s => server = s);

export { app, startServer };
