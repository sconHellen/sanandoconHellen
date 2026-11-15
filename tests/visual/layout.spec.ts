import { expect, test } from "@playwright/test";

// One width per responsive range (brief §6), incl. the 480–767 range.
const WIDTHS = [390, 600, 768, 1280, 1440, 1920] as const;
const THEMES = ["light", "dark"] as const;
const PAGES = [
  { name: "landing", path: "/" },
  { name: "miembros", path: "/miembros" },
] as const;

for (const page of PAGES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`${page.name} · ${theme} · ${width}px`, async ({ browser, baseURL }) => {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
        // Theme comes from the cookie and must be painted by the server (no flash).
        await context.addCookies([{ name: "theme", value: theme, url: baseURL! }]);
        const tab = await context.newPage();
        const response = await tab.goto(page.path);

        expect(response?.status()).toBe(200);
        await expect(tab.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(tab.locator("html")).toHaveAttribute("lang", "es");
        await expect(tab.locator("h1")).toHaveCount(1);

        // No horizontal page scroll at any width.
        const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);

        // Fonts from the design are applied.
        const headingFont = await tab.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
        expect(headingFont).toMatch(/Cormorant/i);

        await tab.evaluate(() => document.fonts.ready);
        await expect(tab).toHaveScreenshot(`${page.name}-${theme}-${width}.png`, { fullPage: true });
        await context.close();
      });
    }
  }
}

test("security headers and strict CSP", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(h["content-security-policy"]).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toBeTruthy();
  expect(h["x-powered-by"]).toBeUndefined();
});

test("members area is noindex", async ({ page }) => {
  await page.goto("/miembros");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("theme toggle switches and persists in a cookie", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: /tema claro y oscuro/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const cookie = (await context.cookies()).find((c) => c.name === "theme");
  expect(cookie?.value).toBe("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("system dark preference applies with no cookie", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(27, 21, 38)"); // --bg dark #1b1526
});
