import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from '../utils/redis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RateLimitError } from './errorHandler';

// Rate limiter configuration
const rateLimiterConfig = {
  keyPrefix: 'rl',
  points: config.rateLimiting.max, // Number of requests
  duration: Math.floor(config.rateLimiting.windowMs / 1000), // Per duration in seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
};

// Create rate limiter instance
let globalRateLimiter: RateLimiterMemory | RateLimiterRedis;

const redisClient = getRedisClient();
if (redisClient && redisClient.isOpen) {
  globalRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    ...rateLimiterConfig,
  });
  logger.info('Using Redis rate limiter');
} else {
  globalRateLimiter = new RateLimiterMemory(rateLimiterConfig);
  logger.info('Using in-memory rate limiter');
}

// Main rate limiter middleware
export const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const key = `${req.ip}_${req.method}_${req.route?.path || req.path}`;
    
    await globalRateLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const totalPoints = rateLimiterConfig.points;
    const remainingPoints = rateLimiterRes?.remainingPoints || 0;
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
    
    // Set rate limit headers
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': totalPoints.toString(),
      'X-RateLimit-Remaining': Math.max(0, remainingPoints).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    });

    logger.warn(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.path}`);
    next(new RateLimitError());
  }
};

// Strict rate limiter for sensitive endpoints
export const strictRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const strictLimiter = redisClient && redisClient.isOpen 
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'strict_rl',
        points: 5, // 5 requests
        duration: 60, // per 60 seconds
        blockDuration: 300, // Block for 5 minutes
      })
    : new RateLimiterMemory({
        keyPrefix: 'strict_rl',
        points: 5,
        duration: 60,
        blockDuration: 300,
      });

  try {
    const key = `${req.ip}_${req.method}_${req.route?.path || req.path}`;
    await strictLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    });

    logger.warn(`Strict rate limit exceeded for ${req.ip} on ${req.method} ${req.path}`);
    next(new RateLimitError('Too many requests. Please try again later.'));
  }
};

// Login rate limiter (prevents brute force attacks)
export const loginRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const loginLimiter = redisClient && redisClient.isOpen
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'login_rl',
        points: 5, // 5 attempts
        duration: 900, // per 15 minutes
        blockDuration: 900, // Block for 15 minutes
      })
    : new RateLimiterMemory({
        keyPrefix: 'login_rl',
        points: 5,
        duration: 900,
        blockDuration: 900,
      });

  try {
    const key = `login_${req.ip}`;
    await loginLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
    });

    logger.warn(`Login rate limit exceeded for ${req.ip}`);
    next(new RateLimitError('Too many login attempts. Please try again later.'));
  }
};

// Password reset rate limiter
export const passwordResetRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const passwordResetLimiter = redisClient && redisClient.isOpen
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'pwd_reset_rl',
        points: 3, // 3 attempts
        duration: 3600, // per 1 hour
        blockDuration: 3600, // Block for 1 hour
      })
    : new RateLimiterMemory({
        keyPrefix: 'pwd_reset_rl',
        points: 3,
        duration: 3600,
        blockDuration: 3600,
      });

  try {
    const key = `pwd_reset_${req.ip}`;
    await passwordResetLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
    });

    logger.warn(`Password reset rate limit exceeded for ${req.ip}`);
    next(new RateLimitError('Too many password reset attempts. Please try again later.'));
  }
};

// Create custom rate limiter
export const createRateLimiter = (points: number, duration: number, blockDuration: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const customLimiter = redisClient && redisClient.isOpen
      ? new RateLimiterRedis({
          storeClient: redisClient,
          keyPrefix: 'custom_rl',
          points,
          duration,
          blockDuration,
        })
      : new RateLimiterMemory({
          keyPrefix: 'custom_rl',
          points,
          duration,
          blockDuration,
        });

    try {
      const key = `${req.ip}_${req.method}_${req.route?.path || req.path}`;
      await customLimiter.consume(key);
      next();
    } catch (rateLimiterRes: any) {
      const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;
      
      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': points.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      logger.warn(`Custom rate limit exceeded for ${req.ip} on ${req.method} ${req.path}`);
      next(new RateLimitError());
    }
  };
};
