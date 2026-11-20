import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { canAccess, resolveBreathingAsset } from "@/lib/media/breathing-assets";
import { deliverMedia } from "@/lib/media/storage";
import { getViewerAccess } from "@/lib/media/viewer";
import { rateLimit } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Breathing-player audio. Checks access, then redirects to a 5-minute signed URL. */
export async function GET(_req: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const asset = resolveBreathingAsset((await params).asset);
  if (!asset) return Response.json({ error: "not_found" }, { status: 404, headers: NO_STORE });

  const viewer = await getViewerAccess();
  if (!canAccess(asset, viewer)) {
    return Response.json({ error: "locked", requires: asset.requires }, { status: 403, headers: NO_STORE });
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipKey = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  const limit = await rateLimit(`media:ip:${ipKey}`, 120, 600);
  if (!limit.allowed) return Response.json({ error: "rate_limited" }, { status: 429, headers: NO_STORE });

  const delivery = await deliverMedia(asset.key);
  if (!delivery) return Response.json({ error: "unavailable" }, { status: 503, headers: NO_STORE });
  if (delivery.kind === "redirect") return new Response(null, { status: 302, headers: { ...NO_STORE, Location: delivery.url } });
  return new Response(Buffer.from(delivery.body), { status: 200, headers: { ...NO_STORE, "Content-Type": "audio/mpeg" } });
}
