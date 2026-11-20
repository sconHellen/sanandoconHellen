import { test } from "node:test";
import assert from "node:assert/strict";
import { breathingState, meditationState } from "../../lib/catalog-access.ts";

const none = { gift: false, breathing: false };
const gift = { gift: true, breathing: false };
const plan = { gift: false, breathing: true };

test("without anything, everything is locked (gift items invite to the gift)", () => {
  assert.equal(breathingState("cuadrada", none), "locked-gift");
  assert.equal(breathingState("478", none), "locked-plan");
  assert.equal(meditationState("free", none), "locked-gift");
  assert.equal(meditationState("locked", none), "locked-plan");
});

test("with the gift, only the gift items open", () => {
  assert.equal(breathingState("cuadrada", gift), "available");
  assert.equal(meditationState("free", gift), "available");
  assert.equal(breathingState("fuelle", gift), "locked-plan");
  assert.equal(meditationState("locked", gift), "locked-plan");
});

test("with a plan, everything opens except what is not published yet", () => {
  assert.equal(breathingState("fuelle", plan), "available");
  assert.equal(meditationState("locked", plan), "available");
  assert.equal(meditationState("soon", plan), "soon");
});
