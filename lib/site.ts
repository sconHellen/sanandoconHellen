/**
 * Canonical site URL, without trailing slash.
 * Order: APP_URL (set it once the final domain exists) → Vercel's own URLs → localhost.
 * Vercel exposes VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_BRANCH_URL and VERCEL_URL
 * automatically (without protocol).
 */
function resolveSiteUrl(): string {
  const env = process.env;
  if (env.APP_URL) return env.APP_URL;
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.VERCEL_BRANCH_URL) return `https://${env.VERCEL_BRANCH_URL}`;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");
export const SITE_NAME = "Sanando con Hellen";

/** Only the production deployment may be indexed by search engines. */
export const IS_INDEXABLE = process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";
