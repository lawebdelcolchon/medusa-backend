import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  if (!config.redis.url) {
    logger.info('Redis URL not configured, skipping Redis connection');
    return null;
  }

  try {
    if (!redisClient) {
      redisClient = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 20) {
              logger.error('Redis reconnection failed after 20 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 50, 2000);
          }
        }
      });

      redisClient.on('error', (error) => {
        logger.error('Redis error:', error);
      });

      redisClient.on('connect', () => {
        logger.info('Redis connection established');
      });

      redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      redisClient.on('reconnecting', () => {
        logger.warn('Redis client reconnecting...');
      });

      redisClient.on('end', () => {
        logger.info('Redis connection ended');
      });

      await redisClient.connect();
    }

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.disconnect();
      redisClient = null;
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

// Cache utilities
export const setCache = async (key: string, value: any, expireInSeconds = 3600): Promise<void> => {
  try {
    if (!redisClient?.isOpen) return;
    
    await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    logger.debug(`Cache set for key: ${key}`);
  } catch (error) {
    logger.error(`Error setting cache for key ${key}:`, error);
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!redisClient?.isOpen) return null;
    
    const value = await redisClient.get(key);
    if (!value) return null;
    
    logger.debug(`Cache hit for key: ${key}`);
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient?.isOpen) return;
    
    await redisClient.del(key);
    logger.debug(`Cache deleted for key: ${key}`);
  } catch (error) {
    logger.error(`Error deleting cache for key ${key}:`, error);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient?.isOpen) return;
    
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug(`Cache deleted for pattern: ${pattern}, keys: ${keys.length}`);
    }
  } catch (error) {
    logger.error(`Error deleting cache pattern ${pattern}:`, error);
  }
};

// Session utilities
export const setSession = async (sessionId: string, data: any, expireInSeconds = 86400): Promise<void> => {
  await setCache(`session:${sessionId}`, data, expireInSeconds);
};

export const getSession = async <T>(sessionId: string): Promise<T | null> => {
  return await getCache<T>(`session:${sessionId}`);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await deleteCache(`session:${sessionId}`);
};

// Rate limiting utilities
export const incrementRateLimit = async (key: string, windowMs: number): Promise<number> => {
  try {
    if (!redisClient?.isOpen) return 0;
    
    const pipeline = redisClient.multi();
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    return results ? (results[0] as number) : 0;
  } catch (error) {
    logger.error(`Error incrementing rate limit for key ${key}:`, error);
    return 0;
  }
};

export default {
  connectRedis,
  getRedisClient,
  closeRedis,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  setSession,
  getSession,
  deleteSession,
  incrementRateLimit
};
