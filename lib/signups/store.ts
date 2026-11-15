import "server-only";
import { getDb } from "@/db/client";
import { emailSignups } from "@/db/schema";
import { LEGAL_VERSIONS } from "@/lib/legal/versions";

export type SignupList = "gift" | "app_launch";

const memory = new Map<string, { name: string | null }>();

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
}
