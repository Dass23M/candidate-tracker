import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 20000,
    fileParallelism: false, // run test files sequentially — they share one real Postgres DB
  },
});