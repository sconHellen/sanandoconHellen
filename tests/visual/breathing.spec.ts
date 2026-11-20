import { expect, test, type Page } from "@playwright/test";

const player = (page: Page) => page.locator("#respirar");
const card = (page: Page, name: string) => page.locator("button", { hasText: name }).filter({ has: page.locator("span") }).first();

async function unlockGift(page: Page) {
  await page.goto("/#regalo");
  await page.getByLabel("Tu correo").fill(`respira+${Date.now()}@correo.com`);
  await page.getByLabel(/Acepto recibir el regalo/).check();
  await page.getByRole("button", { name: "Quiero mi regalo" }).click();
  await expect(page.getByRole("status")).toContainText("¡Listo");
}

test.describe("breathing player", () => {
  test("renders the 22 techniques with the new names and the square one selected", async ({ page }) => {
    await page.goto("/");
    const lib = page.getByRole("region", { name: "Respiraciones", exact: true });
    await expect(lib.locator("button")).toHaveCount(22);
    for (const name of ["Respiración reducida", "Respiración de fuego", "Respiración triángulo", "Respiración del zumbido"]) {
      await expect(lib.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(player(page).getByRole("heading", { name: "Respiración cuadrada" })).toBeVisible();
    await expect(player(page).getByText("Lista para empezar")).toBeVisible();
  });

  test("anonymous visitors are invited to the gift or a plan", async ({ page }) => {
    await page.goto("/");
    await expect(player(page).getByRole("link", { name: "Ábrela con tu regalo gratis" })).toHaveAttribute("href", "#regalo");
    await page.getByRole("region", { name: "Respiraciones", exact: true }).getByText("Respiración 4 · 7 · 8", { exact: true }).click();
    await expect(player(page).getByRole("heading", { name: "Respiración 4 · 7 · 8" })).toBeVisible();
    await expect(player(page).getByText(/Andrew Weil/)).toBeVisible();
    await expect(player(page).getByRole("link", { name: "Ábrela con un plan" })).toHaveAttribute("href", "#planes");
  });

  test("the fire breathing shows its safety warning", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("region", { name: "Respiraciones", exact: true }).getByText("Respiración de fuego", { exact: true }).click();
    await expect(player(page).getByText(/No se recomienda en el embarazo/)).toBeVisible();
  });

  test("chips and background list follow the reference rules", async ({ page }) => {
    await page.goto("/");
    const p = player(page);
    await p.getByRole("button", { name: "10 min" }).click();
    await expect(p.getByRole("button", { name: "10 min" })).toHaveAttribute("aria-pressed", "true");
    await expect(p.getByText("10:00")).toBeVisible();
    await p.getByRole("button", { name: "Silencio" }).click();
    await expect(p.getByRole("button", { name: "Silencio" })).toHaveAttribute("aria-pressed", "true");
    // Calming technique: no energetic songs listed.
    await expect(p.locator("#bgsel option", { hasText: "Mañana que baila" })).toHaveCount(0);
    await page.getByRole("region", { name: "Respiraciones", exact: true }).getByText("Suspiro que abre el pecho", { exact: true }).click();
    await expect(p.locator("#bgsel option", { hasText: "Mañana que baila" })).toHaveCount(1);
  });

  test("media access is enforced by the server", async ({ page, request }) => {
    expect((await request.get("/api/media/respiraciones/palabras")).status()).toBe(403);
    expect((await request.get("/api/media/respiraciones/originales/intros-v5.mp3")).status()).toBe(404);
    expect((await request.get("/api/media/respiraciones/intro/no-existe")).status()).toBe(404);

    await unlockGift(page);
    const api = page.request;
    for (const path of ["palabras", "cierre", "intro/cuadrada", "fondo/rio"]) {
      const res = await api.get(`/api/media/respiraciones/${path}`);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"]).toBe("audio/mpeg");
      expect(res.headers()["cache-control"]).toContain("no-store");
    }
    expect((await api.get("/api/media/respiraciones/intro/478")).status()).toBe(403);
    expect((await api.get("/api/media/respiraciones/fondo/seda")).status()).toBe(403);
  });

  test("after the gift, the square breathing runs: intro, skip, stop", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await unlockGift(page);
    const p = player(page);
    await page.getByRole("link", { name: /Respirar ahora/ }).click();
    await p.getByRole("button", { name: "Empezar" }).click();
    await expect(p.getByText("Escucha la explicación")).toBeVisible({ timeout: 10_000 });
    await p.getByRole("button", { name: "Saltar intro" }).click();
    await expect(p.getByText("Inhala", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(p.getByText(/Ronda 1 de \d+/)).toBeVisible();
    await p.getByRole("button", { name: "Pausar" }).click();
    await expect(p.getByRole("button", { name: "Continuar" })).toBeVisible();
    await p.getByRole("button", { name: "Terminar" }).click();
    await expect(p.getByText("Gracias por darte este momento")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("a returning visitor keeps the gift unlocked", async ({ page }) => {
    await unlockGift(page);
    await page.reload();
    await expect(player(page).getByRole("button", { name: "Empezar" })).toBeVisible();
    await expect(page.getByText("Se abre con tu correo")).toHaveCount(0);
  });
});
