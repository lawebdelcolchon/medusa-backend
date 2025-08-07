// Jest setup file for Express.js e-commerce API

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging in tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_ecommerce';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
process.env.COOKIE_SECRET = 'test-cookie-secret-for-testing-purposes';

// Global test setup
beforeAll(async () => {
  // Setup test database connections, etc.
});

afterAll(async () => {
  // Cleanup test database connections, etc.
});

// Global test utilities
(global as any).testTimeout = 10000;
