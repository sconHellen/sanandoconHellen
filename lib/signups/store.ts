import "server-only";
import { getDb } from "@/db/client";
import { emailSignups } from "@/db/schema";
import { LEGAL_VERSIONS } from "@/lib/legal/versions";

export type SignupList = "gift" | "app_launch";

const memory = new Map<string, { name: string | null }>();

/**
 * Non-secret identifier of the database endpoint (e.g. Neon "ep-cool-name-123456"),
 * logged so the team can tell from Vercel logs which database/branch received a write.
 * Never logs credentials or personal data.
 */
function dbEndpointId(url: string): string {
  try {
    return new URL(url).hostname.split(".")[0] ?? "unknown";
  } catch {
    return "unparseable";
  }
}

/**
 * Upserts a signup. Without DATABASE_URL (local dev / CI) it keeps signups in memory;
 * in a Vercel deployment a missing DATABASE_URL is a hard error, never silent data loss.
 */
export async function saveSignup(list: SignupList, email: string, name: string | null): Promise<void> {
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL_ENV) throw new Error("DATABASE_URL is not set");
    memory.set(`${list}:${email}`, { name });
    return;
  }
  const now = new Date();
  await getDb()
    .insert(emailSignups)
    .values({ list, email, name, consentAt: now, privacyVersion: LEGAL_VERSIONS.privacy })
    .onConflictDoUpdate({
      target: [emailSignups.list, emailSignups.email], // email is always stored lowercase
      set: { name, consentAt: now, privacyVersion: LEGAL_VERSIONS.privacy, unsubscribedAt: null },
    });
  console.info(
    `[signup] saved list=${list} db=${dbEndpointId(process.env.DATABASE_URL)} env=${process.env.VERCEL_ENV ?? "local"} branch=${process.env.VERCEL_GIT_COMMIT_REF ?? "-"}`,
  );
}
