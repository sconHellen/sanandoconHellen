/**
 * Uploads ./media-out to the private Cloudflare R2 bucket.
 *
 *   npm run media:upload
 *
 * Reads R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET from the
 * environment or from .env.local (never committed). Uses presigned PUT URLs: no SDK needed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { presignUrl } from "../../lib/media/sigv4.ts";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"] as const;
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Faltan variables (ponlas en .env.local): " + missing.join(", "));
  process.exit(1);
}
const env = Object.fromEntries(need.map((k) => [k, process.env[k]!])) as Record<(typeof need)[number], string>;
const OUT = "media-out";
if (!existsSync(OUT)) {
  console.error("No existe ./media-out. Corre primero: npm run media:prepare -- <carpeta>");
  process.exit(1);
}

const files: string[] = [];
const walk = (d: string) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : files.push(join(d, n))));
walk(OUT);

const host = `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
let ok = 0;
for (const file of files) {
  const key = relative(OUT, file).split(sep).join("/");
  const url = presignUrl({
    method: "PUT",
    host,
    path: `/${env.R2_BUCKET}/${key}`,
    region: "auto",
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    expiresSeconds: 600,
  });
  const body = readFileSync(file);
  const res = await fetch(url, { method: "PUT", body, headers: { "Content-Type": "audio/mpeg" } });
  if (!res.ok) {
    console.error(`✗ ${key}: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    continue;
  }
  ok++;
  console.log(`✓ ${key} (${(body.length / 1024).toFixed(0)} KB)`);
}
console.log(`\nSubidos ${ok} de ${files.length} archivos a ${env.R2_BUCKET}.`);
