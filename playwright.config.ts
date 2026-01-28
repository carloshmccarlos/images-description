import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.005,
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
  },
});
