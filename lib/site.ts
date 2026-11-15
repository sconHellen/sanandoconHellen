/** Canonical site URL, without trailing slash. [PENDIENTE: dominio definitivo] */
export const SITE_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Sanando con Hellen";
