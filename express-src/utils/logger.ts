import { createLogger, format, transports } from 'winston';
import { config } from '../config';

const { combine, timestamp, errors, json, colorize, printf } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Create logger instance
export const logger = createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'express-ecommerce-api'
  },
  transports: [
    // Console transport for development
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
      silent: config.nodeEnv === 'test'
    }),
    
    // File transports
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new transports.File({ 
    filename: 'logs/exceptions.log',
    maxsize: 5242880,
    maxFiles: 5
  })
);

logger.rejections.handle(
  new transports.File({ 
    filename: 'logs/rejections.log',
    maxsize: 5242880,
    maxFiles: 5
  })
);

// Add request ID to logger context
export const createChildLogger = (requestId: string) => {
  return logger.child({ requestId });
};

// Performance timing utility
export const logPerformance = (label: string, startTime: [number, number]) => {
  const diff = process.hrtime(startTime);
  const time = diff[0] * 1000 + diff[1] * 1e-6;
  logger.debug(`${label} took ${time.toFixed(2)}ms`);
};

export default logger;
