import "server-only";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { r2HostFromEnv } from "./r2";
import { presignUrl } from "./sigv4";

/**
 * Media storage behind one interface (brief §3 "VideoProvider"; also used for audio).
 *  - "r2":    private Cloudflare R2 bucket, short-lived presigned URLs.
 *  - "local": files on disk (development and automated tests only).
 */
export type MediaDelivery = { kind: "redirect"; url: string } | { kind: "bytes"; body: Uint8Array };

const SIGNED_URL_SECONDS = 300;

export function mediaProvider(): "r2" | "local" | null {
  const p = process.env.VIDEO_PROVIDER?.trim().toLowerCase();
  if (p === "r2") return "r2";
  if (p === "local" || (!p && !process.env.VERCEL_ENV)) return "local";
  return null; // misconfigured deployment: refuse rather than guess
}

export function r2Host(): string | null {
  return r2HostFromEnv();
}

export async function deliverMedia(key: string): Promise<MediaDelivery | null> {
  const provider = mediaProvider();
  if (provider === "r2") {
    const host = r2Host();
    // Trim: values pasted into the Vercel dashboard often carry a trailing space or newline,
    // which makes R2 reject the request (400). The upload script trims them the same way.
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const R2_BUCKET = process.env.R2_BUCKET?.trim();
    if (!host || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
      const missing = [
        !host && "R2_ACCOUNT_ID (o R2_JURISDICTION con valor raro)",
        !R2_ACCESS_KEY_ID && "R2_ACCESS_KEY_ID",
        !R2_SECRET_ACCESS_KEY && "R2_SECRET_ACCESS_KEY",
        !R2_BUCKET && "R2_BUCKET",
      ].filter(Boolean);
      console.error(`[media] R2 not configured; missing: ${missing.join(", ")}`);
      return null;
    }
    const url = presignUrl({
      method: "GET",
      host,
      path: `/${R2_BUCKET}/${key}`,
      region: "auto",
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      expiresSeconds: SIGNED_URL_SECONDS,
    });
    return { kind: "redirect", url };
  }
  if (provider === "local") {
    // Dev/test only: the turbopackIgnore hint keeps this dynamic path out of output tracing,
    // so local audio files are never bundled into the deployed functions.
    const root = resolve(/* turbopackIgnore: true */ process.cwd(), process.env.MEDIA_LOCAL_DIR ?? "media-out");
    const path = resolve(join(root, key));
    if (!path.startsWith(root)) return null;
    try {
      return { kind: "bytes", body: new Uint8Array(await readFile(path)) };
    } catch {
      return null;
    }
  }
  console.error(`[media] VIDEO_PROVIDER is "${process.env.VIDEO_PROVIDER ?? ""}" (expected "r2" on Vercel)`);
  return null;
}
