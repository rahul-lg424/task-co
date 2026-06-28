import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

// Load .env into process.env for tests (the `test` npm script doesn't pass
// --env-file). Integration tests need DATABASE_URL and JWT_SECRET; the empty
// prefix loads all keys, not just VITE_-prefixed ones.
export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, process.cwd(), ''),
  },
}));
