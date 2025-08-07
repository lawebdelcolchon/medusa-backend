import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config';
import { schema } from './schema';
import { logger } from '../utils/logger';

// Global connection pool
let pool: Pool | null = null;
let db: any = null;

export const createPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.database.url,
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
      connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Handle pool errors
    pool.on('error', (error: Error) => {
      logger.error('PostgreSQL pool error:', error);
    });

    pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    pool.on('remove', () => {
      logger.debug('Database connection removed from pool');
    });
  }
  
  return pool;
};

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!pool) {
      pool = createPool();
    }

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    // Initialize Drizzle ORM
    db = drizzle(pool, { schema });
    
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      db = null;
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!pool) {
      return false;
    }

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    if (!pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await pool.connect();
    
    const [connectionStats, tableStats] = await Promise.all([
      client.query(`
        SELECT 
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rolled_back
        FROM pg_stat_database 
        WHERE datname = $1
      `, [config.database.name]),
      
      client.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC
        LIMIT 10
      `)
    ]);

    client.release();

    return {
      connection: connectionStats.rows[0] || {},
      tables: tableStats.rows || [],
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      }
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
};

export { schema };
