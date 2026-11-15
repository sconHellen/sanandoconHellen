import { test } from "node:test";
import assert from "node:assert/strict";
import { PLANS, formatUsd, monthlyEquivalent } from "../../config/plans.ts";

test("prices match the landing design", () => {
  assert.equal(formatUsd(PLANS.basic_monthly.priceUsd), "7,90");
  assert.equal(formatUsd(PLANS.basic_yearly.priceUsd), "49");
  assert.equal(formatUsd(PLANS.premium_monthly.priceUsd), "14,90");
  assert.equal(formatUsd(PLANS.premium_yearly.priceUsd), "99");
});

test("yearly plans show the monthly equivalent from the design", () => {
  assert.equal(formatUsd(monthlyEquivalent(PLANS.basic_yearly.priceUsd)), "4,08");
  assert.equal(formatUsd(monthlyEquivalent(PLANS.premium_yearly.priceUsd)), "8,25");
});

test("premium includes everything in basic", () => {
  for (const e of PLANS.basic_monthly.entitlements) assert.ok(PLANS.premium_monthly.entitlements.includes(e));
});
