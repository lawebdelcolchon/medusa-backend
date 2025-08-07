import { defineConfig } from 'drizzle-kit';
import { config } from './express-src/config';

export default defineConfig({
  schema: './express-src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.database.url,
  },
  verbose: true,
  strict: true,
});
