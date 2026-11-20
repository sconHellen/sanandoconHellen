import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccess, canPractise, resolveBreathingAsset } from "../../lib/media/breathing-assets.ts";
import { BREATHINGS, SONGS, cycleLength } from "../../content/breathing.ts";

const anon = { gift: false, breathing: false };
const gift = { gift: true, breathing: false };
const member = { gift: false, breathing: true };

test("only whitelisted assets resolve (no path tricks, originals never exposed)", () => {
  assert.equal(resolveBreathingAsset(["palabras"])?.key, "respiraciones/palabras.mp3");
  assert.equal(resolveBreathingAsset(["intro", "478"])?.key, "respiraciones/intros/478.mp3");
  assert.equal(resolveBreathingAsset(["fondo", "rio"])?.key, "respiraciones/fondos/rio-sereno.mp3");
  for (const bad of [["originales", "intros-v5.mp3"], ["intro", "../originales"], ["fondo", "nope"], ["palabras", "x"], ["intro"], []]) {
    assert.equal(resolveBreathingAsset(bad), null, bad.join("/"));
  }
});

test("anonymous visitors hear nothing", () => {
  assert.equal(canAccess(resolveBreathingAsset(["palabras"])!, anon), false);
});

test("the gift unlocks exactly the square breathing, the words, the closing and 'Río sereno'", () => {
  const allowed = [["palabras"], ["cierre"], ["intro", "cuadrada"], ["fondo", "rio"]];
  for (const a of allowed) assert.equal(canAccess(resolveBreathingAsset(a)!, gift), true, a.join("/"));
  assert.equal(canAccess(resolveBreathingAsset(["intro", "478"])!, gift), false);
  assert.equal(canAccess(resolveBreathingAsset(["fondo", "seda"])!, gift), false);
  assert.equal(canPractise("cuadrada", gift), true);
  assert.equal(canPractise("478", gift), false);
});

test("members hear everything", () => {
  for (const b of BREATHINGS) assert.equal(canAccess(resolveBreathingAsset(["intro", b.id])!, member), true);
  for (const s of SONGS) assert.equal(canAccess(resolveBreathingAsset(["fondo", s.id])!, member), true);
});

test("data integrity: 22 techniques, unique ids, every intro index and cue exists", async () => {
  const { WORDS, INTRO_SOURCE, SUGGESTED } = await import("../../content/breathing.ts");
  assert.equal(BREATHINGS.length, 22);
  assert.equal(new Set(BREATHINGS.map((b) => b.id)).size, 22);
  for (const b of BREATHINGS) {
    assert.ok(INTRO_SOURCE[b.intro], b.id);
    assert.ok(SONGS.some((s) => s.id === SUGGESTED[b.id]), `suggested song for ${b.id}`);
    assert.ok(cycleLength(b) > 0);
    for (const p of b.ph) if (p.cue) assert.ok(WORDS[p.cue], `${b.id}: cue ${p.cue}`);
  }
});
