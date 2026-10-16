import { defineConfig } from "@playwright/test";

// End-to-end tests against a production build, using the locally installed Chrome (no browser
// download). They write real orders to the DATABASE_URL in .env, which must be the development
// branch, and e2e/global-teardown.ts deletes them afterwards.

const PORT = 3200;

// Upstash off (empty values aren't overridden by .env): rate limits are skipped and the cache is
// in-memory, so repeated runs aren't throttled. Rate limits are covered by hand.
const serverEnv = {
  ...Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)),
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
};

export default defineConfig({
  testDir: "e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  // Neon and Upstash can be flaky from slow networks.
  retries: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chrome", use: { browserName: "chromium", channel: "chrome" } }],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/robots.txt`,
    env: serverEnv,
    reuseExistingServer: false,
    timeout: 600_000,
  },
});
