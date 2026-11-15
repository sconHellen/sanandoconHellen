"use client";

import { THEME_COOKIE, type Theme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const ONE_YEAR = 60 * 60 * 24 * 365;

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Sun/moon switch. The icon shown is decided purely by CSS from the active theme,
 * so server and client markup are identical (no hydration mismatch, no flash).
 * The choice is stored in a cookie so the server paints the right theme next time.
 */
export function ThemeToggle() {
  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
  }

  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label="Cambiar entre tema claro y oscuro">
      <svg className={styles.moon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg className={styles.sun} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
