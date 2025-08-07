import { Router } from 'express';
import { checkDatabaseHealth, getDatabaseStats } from '../database/connection';
import { getRedisClient } from '../utils/redis';
import { config } from '../config';
import { successResponse, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req: any, res: any) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    node_version: process.version,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    pid: process.pid,
  };

  successResponse(res, health, 'Service is healthy');
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req: any, res: any) => {
  const startTime = process.hrtime();
  
  // Check database health
  const dbHealthy = await checkDatabaseHealth();
  
  // Check Redis health
  const redisClient = getRedisClient();
  let redisHealthy = false;
  if (redisClient) {
    try {
      await redisClient.ping();
      redisHealthy = true;
    } catch (error) {
      logger.warn('Redis health check failed:', error);
    }
  }

  const [seconds, nanoseconds] = process.hrtime(startTime);
  const responseTime = seconds * 1000 + nanoseconds / 1000000;

  const health = {
    status: dbHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime.toFixed(2)}ms`,
    services: {
      database: {
        status: dbHealthy ? 'UP' : 'DOWN',
        type: 'PostgreSQL',
      },
      redis: {
        status: redisHealthy ? 'UP' : 'DOWN',
        type: 'Redis',
        configured: !!config.redis.url,
      },
    },
    system: {
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
    },
  };

  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode);
  successResponse(res, health, 'Health check completed', statusCode);
}));

// Database specific health check
router.get('/db', asyncHandler(async (req: any, res: any) => {
  const dbHealthy = await checkDatabaseHealth();
  
  if (dbHealthy) {
    try {
      const stats = await getDatabaseStats();
      successResponse(res, {
        status: 'UP',
        type: 'PostgreSQL',
        stats,
      }, 'Database is healthy');
    } catch (error) {
      logger.error('Error getting database stats:', error);
      successResponse(res, {
        status: 'UP',
        type: 'PostgreSQL',
        error: 'Could not retrieve stats',
      }, 'Database is healthy but stats unavailable');
    }
  } else {
    res.status(503);
    successResponse(res, {
      status: 'DOWN',
      type: 'PostgreSQL',
    }, 'Database is unhealthy', 503);
  }
}));

// Redis specific health check
router.get('/redis', asyncHandler(async (req: any, res: any) => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    res.status(503);
    return successResponse(res, {
      status: 'NOT_CONFIGURED',
      type: 'Redis',
    }, 'Redis is not configured', 503);
  }

  try {
    const info = await redisClient.info();
    const ping = await redisClient.ping();
    
    successResponse(res, {
      status: 'UP',
      type: 'Redis',
      ping,
      connected: redisClient.isOpen,
      info: {
        version: info.match(/redis_version:([^\r\n]*)/)?.[1],
        mode: info.match(/redis_mode:([^\r\n]*)/)?.[1],
        uptime: info.match(/uptime_in_seconds:([^\r\n]*)/)?.[1],
      },
    }, 'Redis is healthy');
  } catch (error) {
    logger.error('Redis health check failed:', error);
    res.status(503);
    successResponse(res, {
      status: 'DOWN',
      type: 'Redis',
      error: (error as Error).message,
    }, 'Redis is unhealthy', 503);
  }
}));

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (req: any, res: any) => {
  const dbHealthy = await checkDatabaseHealth();
  
  if (dbHealthy) {
    successResponse(res, { ready: true }, 'Service is ready');
  } else {
    res.status(503);
    successResponse(res, { ready: false }, 'Service is not ready', 503);
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', asyncHandler(async (req: any, res: any) => {
  successResponse(res, { alive: true }, 'Service is alive');
}));

export default router;
