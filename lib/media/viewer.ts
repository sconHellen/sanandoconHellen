import "server-only";
import { cookies } from "next/headers";
import type { ViewerAccess } from "./breathing-assets";

export const GIFT_COOKIE = "sch_gift";

/**
 * What the current visitor may hear. The gift cookie only unlocks free content
 * (it is not a security boundary). Paid access arrives with real sessions in Phase 4.
 */
export async function getViewerAccess(): Promise<ViewerAccess> {
  const jar = await cookies();
  return { gift: jar.get(GIFT_COOKIE)?.value === "1", breathing: false };
}
