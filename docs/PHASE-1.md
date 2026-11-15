# Fase 1 · Base

## Qué se hizo

| Área | Estado | Dónde |
|---|---|---|
| Proyecto Next.js 16 + React 19 + TypeScript estricto | ✅ | `package.json`, `tsconfig.json` |
| Tokens de diseño (paleta clara del brief + modo oscuro) | ✅ con valores del brief · ⏳ falta extracción completa de las maquetas | `app/styles/tokens.css` |
| Tema claro/oscuro: sistema por defecto + interruptor sol/luna + cookie pintada por el servidor (sin parpadeo) | ✅ | `lib/theme`, `components/ThemeToggle.tsx`, `app/layout.tsx` |
| Fuentes Cormorant Garamond + Nunito Sans autoalojadas con `next/font` (`display: swap`) | ✅ | `app/layout.tsx` |
| Layout responsive mobile-first, tipografía fluida `clamp()`, rango TV (≥1920px) con tipografía 1.5× y foco reforzado | ✅ | `app/styles/globals.css` |
| Esqueleto del landing (cabecera con menú colapsable sin JS, héroe con animación `respira`, grupos del catálogo) | ✅ estructura · contenido en Fase 2 | `app/(marketing)` |
| Esqueleto de la app de miembros (5 pestañas, `noindex`) | ✅ estructura · contenido en Fase 5 | `app/(members)/miembros` |
| Cabeceras de seguridad + CSP estricta con nonce por petición (sin `unsafe-inline` en scripts) | ✅ | `next.config.ts`, `proxy.ts` |
| Modelo de datos: las 13 tablas del §8.2 + migración inicial | ✅ | `db/schema.ts`, `db/migrations/0000_init.sql` |
| `.env.example` | ✅ | raíz |
| `robots.txt` (bloquea `/miembros`, `/acceso`, `/api`) | ✅ | `app/robots.ts` |
| Aviso "no sustituye atención médica o psicológica" en el pie | ✅ (§9) | `components/SiteFooter.tsx` |

## Decisiones que necesitan visto bueno

1. **ORM: Drizzle** (no Prisma). Motivo en `docs/DEPENDENCIES.md`.
2. **Estilos: CSS Modules + tokens** (no Tailwind). Una dependencia menos y los tokens son CSS puro.
3. **Ajustes de contraste.** La prueba automática encontró dos fallos WCAG en la paleta clara original:
   - El anillo de foco en `--lavender-400` (#9C86C4) daba 2.87:1 sobre el fondo. Ahora usa `--link` (#5B4880).
   - `--text-soft` (#6E5C8C) sobre `--lavender-100` da 4.38:1. Se conserva el color, pero **solo se usa sobre fondos crema y superficies**.
4. **Modo oscuro.** Se usa la propuesta del brief y se completan los tokens que faltaban (lavandas, cremas, bordes). Todos los pares pasan AA.
5. **Rutas en español:** `/miembros`, `/miembros/meditaciones`, `/miembros/respiraciones`, `/miembros/sonidos`, `/miembros/sesiones`.
6. **CSP:** se permiten atributos `style=""` en línea (`style-src-attr 'unsafe-inline'`) porque `next/image` los emite. Los scripts siguen estrictos.
7. **Unicidad en la base de datos:** un solo dispositivo activo por cuenta (índice único parcial) y correo único sin distinguir mayúsculas.

## Pruebas

```bash
npm test               # tokens: contraste AA en ambos temas, paridad de bloques oscuros, sin negro/blanco puros
npm run build
npm run test:visual    # 6 anchos × 2 temas × landing y app + cabeceras, noindex y tema
```

Resultado actual: 4/4 unitarias y 28/28 Playwright. La migración se aplicó contra PostgreSQL 16 local (13 tablas) y se verificaron las restricciones de dispositivo activo y correo único.

Las capturas de referencia están en `tests/visual/__screenshots__/`. Se generan en Linux/Chromium; para regenerarlas: `npm run test:visual -- --update-snapshots`.

## Cómo conectar Vercel (requiere tu cuenta; no se puede hacer desde aquí)

1. En vercel.com → **Add New → Project** → importa `sconHellen/sanandoconHellen`. Framework: Next.js (se detecta solo).
2. **Storage → Marketplace → Neon (Postgres)**. Crea dos bases: una para Production y otra para Preview/Development. Vercel inyecta `DATABASE_URL` en cada entorno.
3. En **Settings → Environment Variables** añade el resto de nombres de `.env.example` por entorno. `HOTMART_ENV=sandbox` en Preview y Development.
4. Aplica la migración a cada base: `DATABASE_URL=... npm run db:migrate`.
5. Cada rama genera una Preview automática.

## Pendiente

- [ ] **Carpetas de diseño** `Landing page-html v1/` y `SanandoConHellen/`: no están en el repo. Sin ellas faltan los valores exactos de sombras, espaciados y otros tonos, las imágenes de `assets/` y los textos de apoyo.
- [ ] Conectar el proyecto de Vercel y las bases Neon (pasos arriba).
- [ ] Navegación con flechas del control remoto en TV: el foco visible ya está; la navegación espacial llega con el reproductor (Fase 5).
- [ ] Probar en Safari iOS/macOS, Firefox, Samsung Internet y Smart TV reales (Playwright cubre Chromium).
- [ ] `sitemap.xml`, Open Graph y datos estructurados → Fase 2.
- [ ] Todo lo de la sección 14 del brief (textos legales, precios, ids de Hotmart, videos, dominio, redes).
