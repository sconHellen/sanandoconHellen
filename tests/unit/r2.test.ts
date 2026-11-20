import { test } from "node:test";
import assert from "node:assert/strict";
import { r2HostFor } from "../../lib/media/r2.ts";

const acc = "0123456789abcdef0123456789abcdef";

test("standard and jurisdiction-specific R2 hosts", () => {
  assert.equal(r2HostFor(acc, undefined), `${acc}.r2.cloudflarestorage.com`);
  assert.equal(r2HostFor(acc, ""), `${acc}.r2.cloudflarestorage.com`);
  assert.equal(r2HostFor(acc, "EU"), `${acc}.eu.r2.cloudflarestorage.com`);
  assert.equal(r2HostFor(` ${acc} `, " eu "), `${acc}.eu.r2.cloudflarestorage.com`);
});

test("rejects malformed values (no host injection)", () => {
  assert.equal(r2HostFor(undefined, undefined), null);
  assert.equal(r2HostFor("not-an-account", undefined), null);
  assert.equal(r2HostFor(acc, "eu.evil.com/"), null);
});
