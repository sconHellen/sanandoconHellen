import type { BrowserContext } from "@playwright/test";

/**
 * Each test behaves like a different visitor for the gift form's per-IP rate limit
 * (5 per 10 min), so the suite does not trip it. On Vercel the edge sets the real IP.
 */
export async function asNewVisitor(context: BrowserContext) {
  const n = () => Math.floor(Math.random() * 250) + 1;
  await context.setExtraHTTPHeaders({ "x-forwarded-for": `10.${n()}.${n()}.${n()}` });
}
