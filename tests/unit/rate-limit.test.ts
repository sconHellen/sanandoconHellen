import { test } from "node:test";
import assert from "node:assert/strict";

// lib/rate-limit imports "server-only", which throws outside React Server Components.
// Load the module with that import stubbed so the logic itself can be tested.
async function loadRateLimit() {
  const { readFileSync, writeFileSync, mkdtempSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const src = readFileSync(new URL("../../lib/rate-limit/index.ts", import.meta.url), "utf8").replace('import "server-only";', "");
  const dir = mkdtempSync(join(tmpdir(), "rl-"));
  const file = join(dir, "rate-limit.ts");
  writeFileSync(file, src);
  return (await import(file)) as typeof import("../../lib/rate-limit/index.ts");
}

test("in-memory limiter counts per key (development)", async () => {
  delete process.env.VERCEL_ENV;
  const { rateLimit } = await loadRateLimit();
  const key = `t-${Date.now()}`;
  assert.equal((await rateLimit(key, 2, 60)).allowed, true);
  assert.equal((await rateLimit(key, 2, 60)).allowed, true);
  assert.equal((await rateLimit(key, 2, 60)).allowed, false);
});

test("production without a backend never blocks people (fails open, logs)", async () => {
  process.env.VERCEL_ENV = "production";
  delete process.env.KV_REST_API_URL;
  delete process.env.RATE_LIMIT_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  const { rateLimit } = await loadRateLimit();
  const original = console.error;
  console.error = () => undefined;
  try {
    assert.equal((await rateLimit("x", 1, 60)).allowed, true);
    assert.equal((await rateLimit("x", 1, 60)).allowed, true);
  } finally {
    console.error = original;
    delete process.env.VERCEL_ENV;
  }
});

test("a failing Upstash backend fails open instead of crashing the form", async () => {
  process.env.KV_REST_API_URL = "http://127.0.0.1:9";
  process.env.KV_REST_API_TOKEN = "x";
  const { rateLimit } = await loadRateLimit();
  const original = console.error;
  console.error = () => undefined;
  try {
    assert.equal((await rateLimit("y", 1, 60)).allowed, true);
  } finally {
    console.error = original;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  }
});
