/**
 * Cloudflare R2 endpoint. Buckets created with a jurisdiction (e.g. EU) live on a
 * jurisdiction-specific host: <account>.<jurisdiction>.r2.cloudflarestorage.com.
 * Set R2_JURISDICTION=eu for those; leave it empty for standard buckets.
 */
export function r2HostFor(accountId: string | undefined, jurisdiction: string | undefined): string | null {
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId.trim())) return null;
  const j = (jurisdiction ?? "").trim().toLowerCase();
  if (j && !/^[a-z]+$/.test(j)) return null;
  return `${accountId.trim()}${j ? `.${j}` : ""}.r2.cloudflarestorage.com`;
}

export function r2HostFromEnv(env: Record<string, string | undefined> = process.env): string | null {
  return r2HostFor(env.R2_ACCOUNT_ID, env.R2_JURISDICTION);
}
