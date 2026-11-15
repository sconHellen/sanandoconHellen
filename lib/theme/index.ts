export const THEME_COOKIE = "theme";
export type Theme = "light" | "dark";

/** Returns the stored theme, or null when the user follows the system preference. */
export function parseTheme(value: string | undefined | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}
