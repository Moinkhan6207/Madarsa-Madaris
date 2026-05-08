process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'refresh-secret-that-is-at-least-32-characters';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.DIRECT_URL =
  process.env.DIRECT_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
