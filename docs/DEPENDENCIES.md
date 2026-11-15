# Dependencias

Regla del proyecto: cada dependencia se justifica aquí. Versiones fijadas exactas (sin `^`) y con al menos dos semanas de publicación.

## Producción

| Paquete | Versión | Para qué | Alternativa descartada | Licencia |
|---|---|---|---|---|
| `next` | 16.4.3 | Framework (App Router, Route Handlers, Proxy, `next/font`, `next/image`) | Remix / Astro: el brief pide Next.js en Vercel | MIT |
| `react`, `react-dom` | 19.3.1 | UI | — (requerido por Next) | MIT |
| `drizzle-orm` | 0.45.4 | ORM tipado + consultas parametrizadas | **Prisma**: motor binario aparte, cliente generado más pesado y arranque en frío más lento en serverless. Drizzle es SQL-first, sin binario, y las migraciones son SQL legible y revisable en cada PR | Apache-2.0 |
| `postgres` (postgres.js) | 3.4.9 | Driver PostgreSQL | `@neondatabase/serverless`: nos ataría a Neon. postgres.js funciona con cualquier Postgres gestionado (Neon incluido vía URL con pooler). Se usa la 3.4.x estable en lugar de la 4.x (publicada hace < 3 semanas) | Unlicense |

## Desarrollo

| Paquete | Versión | Para qué | Alternativa descartada | Licencia |
|---|---|---|---|---|
| `typescript` | 5.9.3 | Tipado | TS 7 (nativo): demasiado nuevo para el ecosistema de Next | Apache-2.0 |
| `@types/node`, `@types/react`, `@types/react-dom` | 22.20.5 / 19.3.0 | Tipos | — | MIT |
| `drizzle-kit` | 0.31.11 | Generar y aplicar migraciones | Escribir SQL a mano: más propenso a desincronizarse del esquema | MIT |
| `@playwright/test` | 1.63.0 | Pruebas visuales y de extremo a extremo (6 rangos × 2 temas) | Cypress: sin WebKit; Playwright cubre Chromium, Firefox y WebKit (Safari) | Apache-2.0 |

Las pruebas unitarias usan el ejecutor nativo `node:test`: **cero dependencias** extra (sin Jest ni Vitest).

## Auditoría (`npm audit`)

- 4 avisos *moderate* en `esbuild` ≤ 0.24.2, arrastrado por `drizzle-kit` (vía `@esbuild-kit/*`). Afecta solo al **servidor de desarrollo de esbuild**, que no usamos; `drizzle-kit` es dependencia de desarrollo y no llega a producción. `npm audit fix --force` bajaría `drizzle-kit` a 0.18 (rompe). Se revisa en cada actualización de `drizzle-kit`.
