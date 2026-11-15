/**
 * Design-token checks (brief §5.3):
 *  - WCAG AA contrast for every text/background pair actually used, in both themes.
 *  - The two dark-theme blocks (explicit choice vs. system preference) stay identical.
 *  - No pure black / pure white anywhere in the palette.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../app/styles/tokens.css", import.meta.url), "utf8");

function block(selectorRegex: RegExp): Record<string, string> {
  const match = css.match(selectorRegex);
  assert.ok(match?.[1], `block not found: ${selectorRegex}`);
  const vars: Record<string, string> = {};
  for (const m of match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]!] = m[2]!.trim();
  return vars;
}

const light = block(/^:root\s*\{([^}]*)\}/m);
const darkExplicit = block(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/);
const darkSystem = block(/:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/);
const dark = { ...light, ...darkExplicit };

function resolve(vars: Record<string, string>, name: string, depth = 0): string {
  const value = vars[name];
  assert.ok(value, `token ${name} missing`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref && depth < 10) return resolve(vars, ref[1]!, depth + 1);
  return value;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  assert.match(h, /^[0-9a-f]{6}$/i, `not a 6-digit hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

const BACKGROUNDS = ["--bg", "--surface", "--surface-soft", "--lavender-50", "--lavender-100", "--cream-warm", "--cream-warm-2", "--cream-warm-3", "--tab-active-bg"];
const BODY_TEXT = ["--text", "--text-strong", "--text-muted", "--link", "--link-hover"];
// --text-soft (eyebrows/meta) is used on these backgrounds in the mockup; not on --lavender-100.
const SOFT_BACKGROUNDS = ["--bg", "--surface", "--surface-soft", "--lavender-50", "--cream-warm", "--cream-warm-2", "--cream-warm-3"];

type Pair = [fg: string, bg: string, min: number];
const PAIRS: Pair[] = [
  ...BODY_TEXT.flatMap((fg) => BACKGROUNDS.map((bg): Pair => [fg, bg, 4.5])),
  ...SOFT_BACKGROUNDS.map((bg): Pair => ["--text-soft", bg, 4.5]),
  ["--tab-fg", "--bg", 4.5],
  ["--btn-primary-fg", "--btn-primary-bg", 4.5],
  ["--btn-primary-fg", "--btn-primary-bg-hover", 4.5],
  ["--btn-soft-fg", "--btn-soft-bg", 4.5],
  ["--btn-outline", "--bg", 4.5], // outline button label
  ["--btn-outline", "--surface", 4.5],
  // Inverse band and footer.
  ["--inverse-text", "--inverse-bg", 4.5],
  ["--inverse-text", "--inverse-card", 4.5],
  ["--inverse-text-muted", "--inverse-card", 4.5],
  ["--inverse-eyebrow", "--inverse-bg", 4.5],
  ["--footer-text", "--footer-bg", 4.5],
  ["--footer-heading", "--footer-bg", 4.5],
  ["--footer-small", "--footer-bg", 4.5],
  // Large text (>= 24px): the italic accent in the hero title.
  ["--accent", "--bg", 3],
  // Non-text UI (WCAG 1.4.11): focus indicator and input borders' text.
  ["--focus-ring", "--bg", 3],
];

for (const [themeName, vars] of [["light", light], ["dark", dark]] as const) {
  test(`WCAG AA contrast · ${themeName} theme`, () => {
    const failures: string[] = [];
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(resolve(vars, fg), resolve(vars, bg));
      if (ratio < min) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
    }
    assert.deepEqual(failures, []);
  });
}

test("dark theme blocks are identical", () => {
  assert.deepEqual(darkSystem, darkExplicit);
});

test("no pure black or pure white in the palette", () => {
  for (const vars of [light, darkExplicit]) {
    for (const value of Object.values(vars)) {
      assert.ok(!/#(000000|000|ffffff|fff)\b/i.test(value), `pure black/white found: ${value}`);
    }
  }
});
