/**
 * Uploads ./media-out to the private Cloudflare R2 bucket.
 *
 *   npm run media:upload
 *
 * Reads R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and (optional)
 * R2_JURISDICTION from the environment or from .env.local (never committed).
 * Uses presigned PUT URLs: no SDK needed. Stops at the first configuration error and
 * retries transient network errors.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { r2HostFromEnv } from "../../lib/media/r2.ts";
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
const host = r2HostFromEnv();
if (!host) {
  console.error("R2_ACCOUNT_ID no parece válido (deben ser 32 caracteres hexadecimales) o R2_JURISDICTION tiene un valor raro.");
  process.exit(1);
}
const bucket = process.env.R2_BUCKET!.trim();
const OUT = "media-out";
if (!existsSync(OUT)) {
  console.error("No existe ./media-out. Corre primero: npm run media:prepare -- <carpeta>");
  process.exit(1);
}

const files: string[] = [];
const walk = (d: string) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : files.push(join(d, n))));
walk(OUT);

const HELP: Record<string, string> = {
  NoSuchBucket: `Cloudflare no encuentra el bucket "${bucket}" en ${host}.
  • Revisa que el nombre en R2_BUCKET sea exactamente el del bucket.
  • Si al crear el bucket elegiste una jurisdicción (por ejemplo EU), agrega R2_JURISDICTION=eu
    en .env.local y en Vercel. Lo ves en Cloudflare → R2 → el bucket → Settings → "S3 API".`,
  SignatureDoesNotMatch: "La clave secreta (R2_SECRET_ACCESS_KEY) no coincide con R2_ACCESS_KEY_ID. Cópialas de nuevo.",
  InvalidAccessKeyId: "R2_ACCESS_KEY_ID no existe en esta cuenta. Revisa que la clave sea de la misma cuenta que R2_ACCOUNT_ID.",
  AccessDenied: `La clave no tiene permiso de escritura en "${bucket}". Crea una clave "Object Read & Write" para ese bucket.`,
};

async function put(key: string, body: Buffer): Promise<{ ok: true } | { ok: false; code: string; detail: string }> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const url = presignUrl({
      method: "PUT",
      host: host!,
      path: `/${bucket}/${key}`,
      region: "auto",
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
      expiresSeconds: 600,
    });
    try {
      const res = await fetch(url, { method: "PUT", body: new Uint8Array(body), headers: { "Content-Type": "audio/mpeg" } });
      if (res.ok) return { ok: true };
      const text = await res.text();
      const code = text.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? `HTTP ${res.status}`;
      if (res.status < 500) return { ok: false, code, detail: text };
    } catch (e) {
      if (attempt === 4) return { ok: false, code: "NetworkError", detail: String(e) };
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt)); // 2, 4, 8 s
  }
  return { ok: false, code: "NetworkError", detail: "sin respuesta tras 4 intentos" };
}

console.log(`Subiendo ${files.length} archivos a ${bucket} (${host})…\n`);
let ok = 0;
for (const file of files) {
  const key = relative(OUT, file).split(sep).join("/");
  const body = readFileSync(file);
  const r = await put(key, body);
  if (!r.ok) {
    console.error(`✗ ${key}: ${r.code}`);
    console.error("\n" + (HELP[r.code] ?? `Detalle: ${r.detail.slice(0, 400)}`));
    console.error(`\nSe detuvo la subida (${ok} de ${files.length} subidos). Corrige y vuelve a correr: npm run media:upload`);
    process.exit(1);
  }
  ok++;
  console.log(`✓ ${key} (${(body.length / 1024).toFixed(0)} KB)`);
}
console.log(`\nSubidos ${ok} de ${files.length} archivos a ${bucket}.`);
