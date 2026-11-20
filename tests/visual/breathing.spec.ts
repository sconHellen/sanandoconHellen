import { expect, test, type Page } from "@playwright/test";
import { asNewVisitor } from "./helpers";

const catalog = (page: Page) => page.locator("#que-incluye, #respiraciones");
const item = (page: Page, name: string) => catalog(page).getByRole("button", { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
const dialog = (page: Page) => page.getByRole("dialog");

async function unlockGift(page: Page) {
  await asNewVisitor(page.context());
  await page.goto("/#regalo");
  await page.getByLabel("Tu correo").fill(`respira+${Date.now()}@correo.com`);
  await page.getByLabel(/Acepto recibir el regalo/).check();
  await page.getByRole("button", { name: "Quiero mi regalo" }).click();
  await expect(page.getByRole("status")).toContainText("¡Listo");
}

test.describe("catalogue with dialogs", () => {
  test("breathings have their own section, separate from the meditations", async ({ page }) => {
    await page.goto("/");
    const groups = await page.locator("#que-incluye article h3").allInnerTexts();
    expect(groups).toEqual(["Sanar heridas", "Propósito y nueva vida", "Amor", "Mañanas cortas", "Calma y estrés", "Dormir"]);
    const breathing = page.locator("#respiraciones");
    await expect(breathing.getByRole("heading", { name: "22 respiraciones guiadas" })).toBeVisible();
    await expect(breathing.locator("li")).toHaveCount(22);
    for (const name of ["Respiración reducida", "Respiración de fuego", "Respiración triángulo", "Respiración del zumbido"]) {
      await expect(breathing.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(page.locator("#respirar")).toHaveCount(0); // no always-visible player
  });

  test("without the gift everything is locked; gift items say so", async ({ page }) => {
    await page.goto("/");
    await expect(catalog(page).getByText("Disponible")).toHaveCount(0);
    await expect(item(page, "Respiración cuadrada")).toContainText("Con tu regalo");
    await expect(item(page, "Gratitud antes de abrir los ojos")).toContainText("Con tu regalo");
    await expect(item(page, "Sanando a mamá").getByRole("img", { name: "Bloqueada" })).toBeVisible();
  });

  test("a locked breathing opens in a dialog with its details and a plan link that closes it", async ({ page }) => {
    await page.goto("/");
    await item(page, "Respiración 4 · 7 · 8").click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByRole("heading", { name: "Respiración 4 · 7 · 8" })).toBeVisible();
    await expect(dialog(page).getByText(/Andrew Weil/)).toBeVisible();
    await dialog(page).getByRole("link", { name: "Ábrela con un plan" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(/#planes$/);
  });

  test("the dialog closes with Escape and with the close button", async ({ page }) => {
    await page.goto("/");
    await item(page, "La vela").click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await item(page, "La vela").click();
    await dialog(page).getByRole("button", { name: "Cerrar" }).click();
    await expect(dialog(page)).toBeHidden();
  });

  test("the fire breathing shows its safety warning", async ({ page }) => {
    await page.goto("/");
    await item(page, "Respiración de fuego").click();
    await expect(dialog(page).getByText(/No se recomienda en el embarazo/)).toBeVisible();
  });

  test("player controls follow the reference rules", async ({ page }) => {
    await page.goto("/");
    await item(page, "Respiración cuadrada").click();
    const d = dialog(page);
    await d.getByRole("button", { name: "10 min" }).click();
    await expect(d.getByRole("button", { name: "10 min" })).toHaveAttribute("aria-pressed", "true");
    await expect(d.getByText("10:00")).toBeVisible();
    await expect(d.locator("#bgsel option", { hasText: "Mañana que baila" })).toHaveCount(0); // calming: no energetic songs
    await page.keyboard.press("Escape");
    await item(page, "Suspiro que abre el pecho").click();
    await expect(d.locator("#bgsel option", { hasText: "Mañana que baila" })).toHaveCount(1);
  });

  test("media access is enforced by the server", async ({ page, request }) => {
    expect((await request.get("/api/media/respiraciones/palabras")).status()).toBe(403);
    expect((await request.get("/api/media/respiraciones/originales/intros-v5.mp3")).status()).toBe(404);
    expect((await request.get("/api/media/respiraciones/intro/no-existe")).status()).toBe(404);
    await unlockGift(page);
    for (const path of ["palabras", "cierre", "intro/cuadrada", "fondo/rio"]) {
      const res = await page.request.get(`/api/media/respiraciones/${path}`);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"]).toBe("audio/mpeg");
      expect(res.headers()["cache-control"]).toContain("no-store");
    }
    expect((await page.request.get("/api/media/respiraciones/intro/478")).status()).toBe(403);
    expect((await page.request.get("/api/media/respiraciones/fondo/seda")).status()).toBe(403);
  });

  test("with the gift only the gift items open; the square breathing plays in the dialog", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await unlockGift(page);
    await expect(item(page, "Respiración cuadrada")).toContainText("Disponible");
    await expect(item(page, "Gratitud antes de abrir los ojos")).toContainText("Disponible");
    await expect(catalog(page).getByText("Disponible")).toHaveCount(2);

    await page.getByRole("button", { name: /Respirar ahora/ }).click();
    const d = dialog(page);
    await expect(d.getByRole("heading", { name: "Respiración cuadrada" })).toBeVisible();
    await d.getByRole("button", { name: "Empezar" }).click();
    await expect(d.getByText("Escucha la explicación")).toBeVisible({ timeout: 10_000 });
    await d.getByRole("button", { name: "Saltar intro" }).click();
    await expect(d.getByText("Inhala", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(d.getByText(/Ronda 1 de \d+/)).toBeVisible();
    await d.getByRole("button", { name: "Pausar" }).click();
    await expect(d.getByRole("button", { name: "Continuar" })).toBeVisible();
    await d.getByRole("button", { name: "Terminar" }).click();
    await expect(d.getByText("Gracias por darte este momento")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(d).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("the gift meditation opens and announces its video", async ({ page }) => {
    await unlockGift(page);
    await item(page, "Gratitud antes de abrir los ojos").click();
    await expect(dialog(page).getByText(/El video llega muy pronto/)).toBeVisible();
  });

  test("a returning visitor keeps the gift unlocked", async ({ page }) => {
    await unlockGift(page);
    await page.reload();
    await expect(item(page, "Respiración cuadrada")).toContainText("Disponible");
    await expect(page.getByText("Se abre con tu correo")).toHaveCount(0);
  });
});
