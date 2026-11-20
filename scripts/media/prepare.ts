/**
 * Prepares the breathing-player audio for upload.
 *
 *   npm run media:prepare -- <folder-with-the-original-files>
 *
 * Looks (recursively) for intros-v5.mp3, palabras-v3.mp3 and the 13 background songs,
 * cuts each intro and the closing words LOSSLESSLY (whole MP3 frames copied byte-for-byte),
 * writes everything to ./media-out and updates content/breathing-audio.json.
 */
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { BREATHINGS, CLOSE_SOURCE, INTRO_SOURCE, SONGS } from "../../content/breathing.ts";
import { cutMp3, parseMp3 } from "../../lib/media/mp3.ts";

const SOURCE_INTROS = "intros-v5.mp3";
const SOURCE_WORDS = "palabras-v3.mp3";
const OUT = "media-out";

function findAll(dir: string): Map<string, string> {
  const found = new Map<string, string>();
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (!found.has(name)) found.set(name, p);
    }
  };
  walk(dir);
  return found;
}

const src = process.argv[2];
if (!src) {
  console.error("Uso: npm run media:prepare -- <carpeta con los audios originales>");
  process.exit(1);
}
const files = findAll(src);
const need = [SOURCE_INTROS, SOURCE_WORDS, ...SONGS.map((s) => s.file)];
const missing = need.filter((n) => !files.has(n));
if (missing.length) {
  console.error("Faltan estos archivos en la carpeta indicada:\n  " + missing.join("\n  "));
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
const outputs: Record<string, string> = {};
const write = (key: string, bytes: Uint8Array) => {
  const path = join(OUT, key);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, bytes);
  outputs[key] = createHash("sha256").update(bytes).digest("hex");
};
const copy = (from: string, key: string) => write(key, new Uint8Array(readFileSync(from)));

// Masters: kept privately in storage, never served by the app.
copy(files.get(SOURCE_INTROS)!, `originales/${SOURCE_INTROS}`);
copy(files.get(SOURCE_WORDS)!, `originales/${SOURCE_WORDS}`);

// Words: one file shared by every technique (clip offsets unchanged).
copy(files.get(SOURCE_WORDS)!, "respiraciones/palabras.mp3");

// Intros + closing: lossless cut.
const introBytes = new Uint8Array(readFileSync(files.get(SOURCE_INTROS)!));
const info = parseMp3(introBytes);
const intros: Record<string, { clip: [number, number] }> = {};
for (const b of BREATHINGS) {
  const [start, end] = INTRO_SOURCE[b.intro]!;
  const cut = cutMp3(info, introBytes, start, end);
  write(`respiraciones/intros/${b.id}.mp3`, cut.bytes);
  intros[b.id] = { clip: cut.clip };
}
const close = cutMp3(info, introBytes, CLOSE_SOURCE[0], CLOSE_SOURCE[1]);
write("respiraciones/cierre.mp3", close.bytes);

// Background songs: unchanged.
for (const s of SONGS) copy(files.get(s.file)!, `respiraciones/fondos/${s.file}`);

const manifest = {
  generatedFrom: { intros: SOURCE_INTROS, words: SOURCE_WORDS },
  intros,
  close: { clip: close.clip },
  files: outputs,
};
writeFileSync("content/breathing-audio.json", JSON.stringify(manifest, null, 2) + "\n");

const total = Object.keys(outputs).reduce((n, k) => n + statSync(join(OUT, k)).size, 0);
console.log(`Listo: ${Object.keys(outputs).length} archivos en ./${OUT} (${(total / 1048576).toFixed(1)} MB).`);
console.log(`Manifiesto actualizado: ${relative(process.cwd(), "content/breathing-audio.json")}`);
