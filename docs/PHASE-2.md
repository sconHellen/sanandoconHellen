# Fase 2 · Landing  ✅ cerrada

Publicada en Production: https://sanandoconhellen.vercel.app (Neon `sch-produccion`, Upstash `sch-limites`). Previews con Neon `sch-pruebas`. Guía: [`VERCEL.md`](VERCEL.md).

## Qué se hizo

Todas las secciones del landing, en el orden del brief, con la identidad de SanandoConHellen:

| # | Sección | Notas |
|---|---|---|
| 1 | Cabecera | Qué incluye · Premium · Planes · 1 a 1, menú colapsable en móvil sin JavaScript |
| 2 | Héroe | "Un lugar para volver a ti, cada vez que lo necesites", con el círculo `respira` |
| 3 | Regalo gratis | Respiración cuadrada + Gratitud antes de abrir los ojos; formulario nombre + correo + consentimiento |
| 4 | Hola, soy Hellen | Texto del landing y foto real de Hellen en marco de arco |
| 5 | Las meditaciones | 6 grupos con estado Gratis / candado / Próximamente (`content/catalog.ts`) |
| 6 | 22 respiraciones guiadas | Lista completa del diseño |
| 7 | Premium | Meditación personalizada + comunidad de WhatsApp |
| 8 | Planes | Selector mensual/anual **sin JavaScript** (radios nativos + CSS `:has()`), precios desde `config/plans.ts` |
| 9 | Servicios sueltos | Los del landing: meditación para ti (22 USD), sesión 1 a 1 (55 USD), acompañamiento por WhatsApp |
| 10 | Preguntas frecuentes | Texto del diseño (Calendly + Zoom, garantía de 7 días) |
| 11 | Cierre con regalo | |
| 12 | Pie | Aviso médico + "Pagos seguros con Hotmart" |

### Formulario de regalo

- **Server Action**: funciona incluso sin JavaScript (probado), con protección CSRF integrada de Next.js (verificación de `Origin`).
- **Validación en el servidor** (`lib/signups/validate.ts`, función pura con pruebas): correo válido, nombre opcional sin enlaces ni etiquetas, consentimiento obligatorio.
- **RGPD**: casilla sin marcar por defecto; se guarda fecha del consentimiento y versión de la política de privacidad.
- **Antispam**: campo trampa (*honeypot*) + límite de frecuencia: 5 intentos por IP cada 10 min y 3 por correo cada hora. La IP solo se usa como hash para el contador; no se guarda en la base.
- **Moderación** (`lib/moderation`): interfaz con reglas iniciales (enlaces, etiquetas, lenguaje de crisis que nunca bloquea sino que marca). Lista para sustituir por un clasificador de IA.
- **Base de datos**: tabla `email_signups` (listas `gift` y `app_launch`), un registro por correo y lista; repetir actualiza en vez de duplicar. Probado contra PostgreSQL 16.
- **Límite de frecuencia** (`lib/rate-limit`): Upstash Redis por su API REST (sin SDK extra) cuando hay `RATE_LIMIT_URL`/`RATE_LIMIT_TOKEN`; en memoria solo en desarrollo. En producción sin Upstash, falla a propósito.

### SEO técnico

- HTML semántico, un solo `h1`, `lang="es"`, metadatos y descripción, URL canónica, Open Graph y tarjeta de Twitter/X con la foto de Hellen.
- Datos estructurados schema.org en `@graph`: `Organization`, `Person` (Hellen), `Product` con 4 `Offer` (precios reales) y `FAQPage`. El `<script>` lleva el nonce de la CSP.
- `sitemap.xml` y `robots.txt` (bloquea `/miembros`, `/acceso`, `/api`). Icono SVG con el loto.
- Páginas `/legal/terminos`, `/legal/privacidad`, `/legal/cookies` con `[PENDIENTE]` y `noindex` hasta tener los textos finales.

## Rendimiento medido

Medición propia con Playwright, en un Pixel 7 emulado, CPU 4× más lenta y red de 1,6 Mbps con 150 ms de latencia:

| Métrica | Resultado | Meta |
|---|---|---|
| LCP | 0,81 s | < 2,5 s |
| CLS | 0,028 | < 0,1 |
| JavaScript descargado | ~470 KB sin comprimir (≈ 150 KB gzip), casi todo React + Next | mínimo |

El selector de planes y el menú móvil no usan JavaScript; el único componente de cliente del landing es el formulario de regalo (y el interruptor de tema).

**Lighthouse oficial (PageSpeed Insights, móvil, Production `sanandoconhellen.vercel.app`, 2026-11-15): 100** en Rendimiento, Accesibilidad, Prácticas recomendadas y SEO. ✅ Criterio de cierre cumplido (≥ 90).

## Pruebas

```bash
npm test               # 14 unitarias: contraste, precios, validación del formulario, moderación
npm run build
npm run test:visual    # 36 Playwright: 24 visuales + orden de secciones, formulario (con y sin JS),
                       # selector de planes (ratón y teclado), JSON-LD, SEO, páginas legales, CSP sin errores
```

## Decisiones que necesitan visto bueno

1. **Cierre:** el diseño solo tiene "Ver los planes"; añadí también "Recibir mi regalo gratis" porque el título dice "con tu regalo gratis" y el brief pide "cierre con regalo".
2. **Números alineados:** Cormorant muestra números "antiguos" ("1 a 1" parecía "I a I"). En títulos y precios se usan números alineados.
3. **Texto del consentimiento:** "Acepto recibir el regalo y correos de Sanando con Hellen. Puedo darme de baja cuando quiera. Lee la política de privacidad." Debe revisarse con los textos legales.

## Pendiente

- [ ] Enviar el correo con el regalo: falta el proveedor de correo y el dominio remitente.
- [ ] Videos del regalo (respiración cuadrada y Gratitud antes de abrir los ojos): los botones muestran `[PENDIENTE: video]`.
- [ ] Enlaces de checkout de Hotmart (`config/plans.ts`): los botones apuntan a `#planes` mientras tanto.
- [ ] Enlace de WhatsApp para "Acompañamiento personalizado".
- [ ] Redes sociales del pie.
- [ ] Dominio definitivo: mientras tanto el sitio usa `https://sanandoconhellen.vercel.app` automáticamente (sin `APP_URL`).
- [ ] Textos legales.
