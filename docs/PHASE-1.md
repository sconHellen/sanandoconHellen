# Fase 1 · Base

## Qué se hizo

| Área | Estado | Dónde |
|---|---|---|
| Proyecto Next.js 16 + React 19 + TypeScript estricto | ✅ | `package.json`, `tsconfig.json` |
| Tokens de diseño: **los 22 colores** de `SanandoConHellen/Main.dc.html` mapeados, tipografía, radios, bordes y animaciones; modo oscuro equivalente para cada uno | ✅ | `app/styles/tokens.css` |
| Tema claro/oscuro: sistema por defecto + interruptor sol/luna + cookie pintada por el servidor (sin parpadeo) | ✅ | `lib/theme`, `components/ThemeToggle.tsx`, `app/layout.tsx` |
| Fuentes Cormorant Garamond + Nunito Sans autoalojadas con `next/font` (`display: swap`) | ✅ | `app/layout.tsx` |
| Layout responsive mobile-first, tipografía fluida `clamp()`, rango TV (≥1920px) con tipografía 1.5× y foco reforzado | ✅ | `app/styles/globals.css` |
| Esqueleto del landing (cabecera con logo de loto, menú colapsable sin JS, héroe con los textos del landing, círculo `respira`, grupos del catálogo) | ✅ estructura · contenido en Fase 2 | `app/(marketing)` |
| Inicio de la app con la foto de Hellen (arco, `flota`), pie oscuro y encabezados de cada pestaña según la maqueta | ✅ | `app/(members)/miembros` |
| Maquetas guardadas como referencia | ✅ | `design/` |
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
4. **Modo oscuro.** Se usa la propuesta del brief y se completa un equivalente para cada color de la maqueta (incluida la banda morada "Explora" y el pie). Todos los pares pasan AA.
8. **Sin sombras.** La maqueta no usa sombras: separa con bordes de 1 px `#E6DCEF`. Se respeta; la única sombra es la del menú desplegable móvil (necesaria para distinguirlo).
9. **Móvil < 480 px:** el lema "Meditación · Respiración · Calma" se oculta y el nombre baja a 22 px para que la cabecera quepa sin desbordar.
10. **Animación `respira`** con el ritmo exacto de la maqueta (0.62 → 1 al 40 %, se sostiene hasta el 55 %, vuelve; 12 s). `flota`: 7 s.
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

- [ ] Conectar el proyecto de Vercel y las bases Neon (pasos arriba).
- [ ] Navegación con flechas del control remoto en TV: el foco visible ya está; la navegación espacial llega con el reproductor (Fase 5).
- [ ] Probar en Safari iOS/macOS, Firefox, Samsung Internet y Smart TV reales (Playwright cubre Chromium).
- [ ] `sitemap.xml`, Open Graph y datos estructurados → Fase 2.
- [ ] Todo lo de la sección 14 del brief (textos legales, precios, ids de Hotmart, videos, dominio, redes).

## Diferencias entre las maquetas y el brief (necesitan decisión antes de la Fase 2)

| # | Tema | Qué dice cada fuente | Pregunta |
|---|---|---|---|
| 1 | Precios | El landing muestra Básico 7,90 USD/mes o 49/año, Premium 14,90/mes o 99/año, meditación personalizada 22 USD y sesión 1 a 1 55 USD. El brief (§14) dice que los precios están pendientes. | ¿Son definitivos o se dejan como `[PENDIENTE]`? |
| 2 | Reserva de sesiones 1 a 1 | La app trae una reserva propia en 3 pasos (horario de Costa Rica, GMT-6). Las FAQ del landing dicen que se agenda con **Calendly** y se hace por **Zoom**. | ¿Reserva propia o Calendly? (Calendly es menos trabajo y ya maneja zonas horarias.) |
| 3 | Zona horaria | La app usa Costa Rica (GMT-6); el brief dice que el negocio opera desde Malta (RGPD). | ¿Qué zona horaria y qué país figuran como responsable legal? |
| 4 | Biografía de Hellen | Hay dos textos distintos: en el landing, la historia de la enfermedad; en la app, el inicio en pandemia (2020) y la línea de tiempo de formación. | Se propone: landing = texto del landing, app = texto de la app. ¿De acuerdo? |
| 5 | Garantía | Las FAQ prometen "7 días de garantía" con devolución. | Confirmar que coincide con la configuración de Hotmart y los términos. |
| 6 | Tipos de sesión | La app tiene "Sesión individual", "Programa de 4 sesiones" y "Primera conversación (gratis)"; el landing tiene "Meditación creada para ti", "Sesión 1 a 1" y "Acompañamiento personalizado". | ¿Cuál es la lista final de servicios sueltos? |
| 7 | Testimonios | La app trae 2 testimonios reales (Enoc y Andrea) y 1 marcador. | ¿Hay permiso por escrito para publicarlos (RGPD)? |
| 8 | Aviso de la app móvil | La app trae una sección "Muy pronto: la app de Sanando con Hellen" con formulario de correo. | ¿Se mantiene? Requiere consentimiento y almacenamiento de correos. |
