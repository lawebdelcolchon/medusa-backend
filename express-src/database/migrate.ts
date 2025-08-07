import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { connectDatabase, getDatabase, closeDatabase } from './connection';
import { logger } from '../utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    await connectDatabase();
    const db = getDatabase();
    
    await migrate(db, { migrationsFolder: './drizzle' });
    
    logger.info('✅ Migrations completed successfully');
    
    await closeDatabase();
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
