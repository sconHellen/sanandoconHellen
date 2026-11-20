import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cutMp3, parseMp3 } from "../../lib/media/mp3.ts";

// 3 s, 440 Hz, mono, 96 kbps, generated with ffmpeg (has an Info frame with a Lavc tag).
const bytes = new Uint8Array(readFileSync(new URL("../fixtures/tone.mp3", import.meta.url)));

test("parses every audio frame (same count as ffprobe) and skips the Info frame", () => {
  const info = parseMp3(bytes);
  assert.equal(info.sampleRate, 44100);
  assert.equal(info.samplesPerFrame, 1152);
  assert.equal(info.frames.length, 116); // ffprobe -count_frames
  assert.ok(info.startDelaySamples > 529, "reads the encoder delay from the tag");
});

test("cuts are byte-for-byte copies of the original frames (lossless)", () => {
  const info = parseMp3(bytes);
  const cut = cutMp3(info, bytes, 1, 2, 0.1);
  assert.notEqual(Buffer.from(bytes).indexOf(Buffer.from(cut.bytes)), -1);
  assert.ok(cut.bytes.length < bytes.length);
});

test("the clip keeps the requested length and compensates the encoder delay", () => {
  const info = parseMp3(bytes);
  const cut = cutMp3(info, bytes, 1, 2, 0.1);
  assert.equal(Math.round((cut.clip[1] - cut.clip[0]) * 1000), 1000);
  const fd = info.frameDuration;
  const firstFrame = Math.floor(0.9 / fd);
  const expectedStart = 1 - firstFrame * fd + info.startDelaySamples / info.sampleRate;
  assert.ok(Math.abs(cut.clip[0] - expectedStart) < 0.001);
});

test("rejects data that is not MP3", () => {
  assert.throws(() => parseMp3(new TextEncoder().encode("hola, esto no es audio")));
});
