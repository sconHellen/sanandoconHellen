import "server-only";

/**
 * Fixed-window rate limiter. Uses Upstash Redis over its REST API (plain fetch, no SDK)
 * when RATE_LIMIT_URL/RATE_LIMIT_TOKEN are set; otherwise an in-memory map that is only
 * acceptable for local development and tests (it is per-instance on serverless).
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

const memory = new Map<string, { count: number; resetAt: number }>();

async function hitUpstash(key: string, windowSec: number): Promise<number> {
  const res = await fetch(`${process.env.RATE_LIMIT_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RATE_LIMIT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`rate limit backend error ${res.status}`);
  const data = (await res.json()) as [{ result: number }, unknown];
  return data[0].result;
}

function hitMemory(key: string, windowSec: number): number {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const useUpstash = Boolean(process.env.RATE_LIMIT_URL && process.env.RATE_LIMIT_TOKEN);
  if (!useUpstash && process.env.VERCEL_ENV === "production") {
    throw new Error("RATE_LIMIT_URL/RATE_LIMIT_TOKEN must be set in production");
  }
  const count = useUpstash ? await hitUpstash(`rl:${key}`, windowSec) : hitMemory(key, windowSec);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
