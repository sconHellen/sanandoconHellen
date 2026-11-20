import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  reporter: [["list"]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  webServer: {
    command: `npx next start -p ${PORT}`,
    // Breathing audio served from tiny silent fixtures (no real media in tests).
    env: { VIDEO_PROVIDER: "local", MEDIA_LOCAL_DIR: "tests/fixtures/media" },
    url: `http://localhost:${PORT}`,
    // Always start a fresh server: a stale one (other env vars) would give misleading results.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
