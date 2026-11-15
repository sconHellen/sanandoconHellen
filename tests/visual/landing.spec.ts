import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("sections follow the brief order", async ({ page }) => {
    await page.goto("/");
    const headings = await page.locator("main h2").allInnerTexts();
    expect(headings).toEqual([
      "Empieza gratis: una respiración y una meditación",
      "Hola, soy Hellen",
      "Las meditaciones",
      "22 respiraciones guiadas",
      "Una meditación hecha para ti, y una comunidad que te acompaña",
      "Elige cómo quieres acompañarte",
      "Solo una meditación, una sesión o un acompañamiento",
      "Preguntas frecuentes",
      "Empieza hoy, con tu regalo gratis",
    ]);
    await expect(page.locator("h1")).toHaveText("Un lugar para volver a ti, cada vez que lo necesites");
  });

  test("no console errors (CSP, hydration)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("gift form validates, then unlocks the gifts", async ({ page }) => {
    await page.goto("/#regalo");
    await page.getByLabel("Tu correo").fill("no-es-correo");
    await page.getByRole("button", { name: "Quiero mi regalo" }).click();
    await expect(page.getByText("Escribe un correo válido para abrir tu regalo.")).toBeVisible();
    await expect(page.getByText("Necesitamos tu consentimiento")).toBeVisible();

    await page.getByLabel("Tu nombre").fill("Ana");
    await page.getByLabel("Tu correo").fill(`ana+${Date.now()}@correo.com`);
    await page.getByLabel(/Acepto recibir el regalo/).check();
    await page.getByRole("button", { name: "Quiero mi regalo" }).click();
    await expect(page.getByRole("status")).toContainText("¡Listo, Ana!");
    await expect(page.getByText("Se abre con tu correo")).toHaveCount(0);
  });

  test("gift form works without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);
    await page.getByLabel("Tu correo").fill(`sinjs+${Date.now()}@correo.com`);
    await page.getByLabel(/Acepto recibir el regalo/).check();
    await page.getByRole("button", { name: "Quiero mi regalo" }).click();
    await expect(page.getByText("Ya puedes escuchar tus dos regalos")).toBeVisible();
    await context.close();
  });

  test("plans switch between yearly and monthly prices", async ({ page }) => {
    await page.goto("/#planes");
    const basic = page.locator("#planes article").first();
    const premium = page.locator("#planes article").nth(1);
    const visible = (card: typeof basic, text: string) => card.getByText(text, { exact: true });

    await expect(visible(basic, "49")).toBeVisible();
    await expect(basic.getByText("Como pagar 4,08 al mes")).toBeVisible();
    await expect(visible(basic, "7,90")).toBeHidden();

    await page.getByText("Pago mensual").click();
    await expect(visible(basic, "7,90")).toBeVisible();
    await expect(visible(premium, "14,90")).toBeVisible();
    await expect(visible(basic, "49")).toBeHidden();

    // Keyboard: arrow keys move between the native radios.
    await page.getByLabel("Pago mensual").focus();
    await page.keyboard.press("ArrowRight");
    await expect(visible(premium, "99")).toBeVisible();
  });

  test("structured data is valid JSON with the required types", async ({ page }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? "{}");
    const types = data["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(["Organization", "Person", "Product", "FAQPage"]);
    const offers = data["@graph"][2].offers.map((o: { price: string }) => o.price);
    expect(offers).toEqual(["7.90", "49.00", "14.90", "99.00"]);
  });

  test("SEO basics: meta, canonical, OG, sitemap, robots", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Meditaciones guiadas/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /hellen-cuencos/);
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /miembros");
  });

  test("legal placeholder pages exist and are noindex", async ({ page }) => {
    for (const doc of ["terminos", "privacidad", "cookies"]) {
      const res = await page.goto(`/legal/${doc}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
    expect((await page.goto("/legal/otra"))?.status()).toBe(404);
  });
});
