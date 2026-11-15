import { test } from "node:test";
import assert from "node:assert/strict";
import { validateGiftSignup } from "../../lib/signups/validate.ts";
import { ruleModerator } from "../../lib/moderation/index.ts";

const base = { name: "Ana", email: "ana@correo.com", consent: "on", website: "" };

test("accepts a valid signup and normalises the email", () => {
  const r = validateGiftSignup({ ...base, email: "  Ana@Correo.COM " });
  assert.deepEqual(r, { ok: true, data: { name: "Ana", email: "ana@correo.com" } });
});

test("name is optional", () => {
  assert.equal(validateGiftSignup({ ...base, name: "" }).ok, true);
});

test("rejects invalid email", () => {
  for (const email of ["", "ana", "ana@", "ana@correo", "a b@c.com", "<x>@y.com"]) {
    const r = validateGiftSignup({ ...base, email });
    assert.equal(r.ok, false, email);
  }
});

test("requires explicit consent (GDPR)", () => {
  const r = validateGiftSignup({ ...base, consent: null });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errors.consent);
});

test("rejects links and markup in the name", () => {
  for (const name of ["visita www.spam.com", "http://x.y", "<script>"]) {
    assert.equal(validateGiftSignup({ ...base, name }).ok, false, name);
  }
});

test("honeypot marks bots as spam", () => {
  const r = validateGiftSignup({ ...base, website: "http://bot" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.spam, true);
});

test("crisis language is flagged, never rejected", () => {
  assert.equal(ruleModerator.check("a veces no quiero vivir", "free_text").verdict, "flag_crisis");
  assert.equal(ruleModerator.check("quiero dormir mejor", "free_text").verdict, "allow");
});
