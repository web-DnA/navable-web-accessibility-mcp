import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Tests are pure-function unit tests — no browser, no network.
    testTimeout: 5_000,
  },
});
