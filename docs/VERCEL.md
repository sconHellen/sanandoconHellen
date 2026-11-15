# Puesta en marcha en Vercel (Preview y Production)

Guía paso a paso para dejar el sitio funcionando en Vercel con dos entornos:

| Entorno | Qué es | De qué rama sale | Base de datos |
|---|---|---|---|
| **Preview** | Versión de revisión. Cada rama y cada PR tiene su propia dirección. No la indexa Google. | Cualquier rama que no sea `main` | **Pruebas** (`sch-pruebas`) |
| **Production** | El sitio real. | `main` | **Producción** (`sch-produccion`) |

> Los nombres de botones de Vercel y Neon pueden variar un poco con el tiempo; la idea de cada paso se mantiene.
> Ningún secreto se escribe en el repositorio ni en el chat: todo va en las variables de entorno de Vercel.

---

## Paso 1 · Crear el proyecto en Vercel

1. Entra en **vercel.com** con la cuenta que va a ser dueña del proyecto.
2. **Add New… → Project**.
3. En la lista de repositorios de GitHub elige **`sconHellen/sanandoconHellen`** → **Import**.
   - Si no aparece: **Adjust GitHub App Permissions** y da acceso a ese repositorio.
4. Configuración (deja todo por defecto salvo lo indicado):

   | Campo | Valor |
   |---|---|
   | Project Name | `sanandoconhellen` |
   | Framework Preset | **Next.js** |
   | Root Directory | **`./`** (la raíz; no elijas `design/`) |
   | Build / Output / Install | por defecto |
   | Environment Variables | **ninguna por ahora** |

5. **Deploy**.

**Qué esperar:** Vercel construye la rama `main` como Production. Mientras el PR no esté fusionado, `main` solo tiene el commit inicial y **ese primer despliegue puede fallar o salir vacío. Es normal.** Lo que nos interesa es la Preview del PR (paso 2).

6. En **Settings → Build and Deployment → Node.js Version** confirma **22.x** (el proyecto lo pide en `package.json`).

---

## Paso 2 · Ver la primera Preview

1. Abre el PR en GitHub. El bot de Vercel deja un comentario con **Preview: https://…vercel.app**.
   - Si no hay comentario: en Vercel → pestaña **Deployments** → el despliegue de la rama `claude/carpeta-trabajo-fv3r5j`.
2. Abre esa dirección. Debe verse el landing completo.
   - El formulario del regalo todavía dará *"Algo salió mal"*: falta la base de datos (paso 3). Es a propósito, para no perder correos.

**Protección de las Previews:** por defecto Vercel pide iniciar sesión para ver una Preview (*Deployment Protection → Vercel Authentication*). Es bueno mantenerlo, pero herramientas externas como PageSpeed Insights no pueden entrar. Ver paso 8.

---

## Paso 3 · Base de datos de **pruebas** (Preview + Development)

1. En el proyecto de Vercel → pestaña **Storage** → **Create Database** → **Neon** (Serverless Postgres) → **Continue**.
2. Región: la más cercana a Europa, p. ej. **Frankfurt (eu-central-1)** (operamos desde Malta; RGPD).
3. Nombre: **`sch-pruebas`**. Plan gratuito.
4. Al conectarla al proyecto, en **Environments** marca **solo Preview y Development** (desmarca Production).
5. Vercel crea sola la variable **`DATABASE_URL`** (y otras como `DATABASE_URL_UNPOOLED`) para esos entornos.
6. **Desactiva las ramas por Preview** (recomendado por ahora): la integración de Neon puede crear una *rama de base de datos* nueva para cada Preview (`preview/<rama>`). Así los datos de una Preview no aparecen en la rama principal de `sch-pruebas` y cada rama nueva necesita sus propias migraciones. En **Storage → sch-pruebas → Settings** (o en la configuración de la integración de Neon) desactiva la opción tipo *"Create a database branch for each preview deployment"* y vuelve a desplegar la Preview.

## Paso 4 · Base de datos de **producción**

1. Repite: **Storage → Create Database → Neon**, misma región.
2. Nombre: **`sch-produccion`**.
3. En **Environments** marca **solo Production**.
4. Comprueba en **Settings → Environment Variables** que `DATABASE_URL` aparece **dos veces**: una para *Production* y otra para *Preview, Development*, con valores distintos.

> Así un formulario o un webhook de pruebas **nunca** puede escribir en la base real (brief §4.3).

## Paso 5 · Crear las tablas (una vez por base)

Las tablas se crean con las migraciones del repositorio. Se hace desde la computadora donde tienes el proyecto (VS Code), con Node.js 22 instalado:

1. En Neon (desde Vercel: **Storage → sch-pruebas → Open in Neon**) copia la **cadena de conexión directa** (*Connection string*, desmarcando *Connection pooling*). Empieza por `postgresql://`.
2. En la terminal de VS Code, dentro del proyecto:

   ```bash
   npm install
   ```

   ```bash
   DATABASE_URL="postgresql://…pruebas…" npm run db:migrate
   ```

   En Windows PowerShell:

   ```powershell
   $env:DATABASE_URL="postgresql://…pruebas…"; npm run db:migrate
   ```

3. Debe terminar con **migrations applied successfully**.
   - Si la cadena termina en `&channel_binding=require`, **quita ese trozo** y deja solo `?sslmode=require`: el conector postgres.js no lo admite y `drizzle-kit` puede quedarse esperando o cerrarse sin mostrar error.
   - Para confirmar: Vercel → **Storage → la base → Browse data** debe mostrar las tablas (`users`, `email_signups`, `audit_log`…).
4. Repite con la cadena de **`sch-produccion`**.
5. Cierra la terminal (para que la cadena no quede en memoria) y no la pegues en ningún archivo.

Cada vez que una fase añada tablas nuevas, se repite este paso en las dos bases (se indica en el documento de la fase).

## Paso 6 · Límite de intentos (Upstash Redis)

1. **Storage → Create Database → Upstash → Redis**. Región: Frankfurt. Nombre: **`sch-limites`**. Plan gratuito.
2. Conéctalo a **Production** (y, si quieres, también a Preview).
3. Vercel crea `KV_REST_API_URL` y `KV_REST_API_TOKEN`; el código ya los reconoce (no hace falta crear `RATE_LIMIT_URL`).

> Sin esto, en Production el formulario falla a propósito: un límite que solo vive en memoria no protege en Vercel.

## Paso 7 · Volver a desplegar la Preview y comprobar

Las variables nuevas solo se aplican en despliegues nuevos:

1. **Deployments** → el último de la rama del PR → menú **⋯** → **Redeploy**.
2. Comprueba en la dirección de la Preview:

   - [ ] El landing se ve completo, en claro y en oscuro (botón sol/luna).
   - [ ] El formulario del regalo responde **"¡Listo…!"** con un correo de prueba.
   - [ ] En Neon → `sch-pruebas` → **Tables → email_signups** aparece ese correo.
   - [ ] `/robots.txt` dice `Disallow: /` (las Previews no se indexan).
   - [ ] `/miembros` muestra la app (todavía sin login: llega en la Fase 4).

## Paso 8 · Medir con PageSpeed (cierre de la Fase 2)

1. **Settings → Deployment Protection**: desactiva temporalmente *Vercel Authentication* para Preview **o** mide directamente en Production (paso 9).
2. Abre **pagespeed.web.dev**, pega la dirección y elige **Móvil**.
3. Objetivo: **≥ 90** en Rendimiento, Accesibilidad, Prácticas recomendadas y SEO.
   - En una Preview, SEO puede salir más bajo **a propósito** (está bloqueada a buscadores); el SEO se mide en Production.
4. Vuelve a activar la protección si la desactivaste.
5. Comparte los cuatro números (o una captura) para dejarlos en `docs/PHASE-2.md`.

## Paso 9 · Publicar en Production

1. En GitHub, **Merge pull request** del PR hacia `main`.
2. Vercel despliega `main` en Production automáticamente (**Deployments** → *Production*, estado *Ready*).
3. Comprueba en la dirección de Production (`https://sanandoconhellen.vercel.app` o la que muestre Vercel):

   - [ ] El landing se ve completo.
   - [ ] El formulario del regalo funciona y el correo aparece en `sch-produccion` (no en pruebas).
   - [ ] `/robots.txt` permite indexar y enlaza a `/sitemap.xml`.
   - [ ] `/sitemap.xml` usa la dirección de Production.

4. Borra el correo de prueba de `sch-produccion` (Neon → Tables → `email_signups` → eliminar fila).

## Paso 10 · Dominio propio (cuando lo tengan)

1. **Settings → Domains → Add** → escribe el dominio → sigue las instrucciones de DNS que da Vercel.
2. **Settings → Environment Variables → Add**: `APP_URL` = `https://tu-dominio` **solo en Production** → **Redeploy** de Production.
3. El correo remitente (SPF, DKIM, DMARC) se configura con el proveedor de correo en una fase posterior.

---

## Referencia rápida de variables

| Variable | Production | Preview / Development | La crea |
|---|---|---|---|
| `DATABASE_URL` | base `sch-produccion` | base `sch-pruebas` | Integración de Neon |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | sí | opcional | Integración de Upstash |
| `APP_URL` | cuando haya dominio | no hace falta (usa la dirección de Vercel) | A mano |
| Hotmart, correo, video, sesión | Fases 3–5 | Fases 3–5 | A mano (ver `.env.example`) |

## Si algo falla

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El build falla con *"No Next.js version detected"* | Root Directory mal puesto, o `main` sin fusionar | Root Directory = `./`; mirar la Preview de la rama |
| Formulario: *"Algo salió mal"* | Falta `DATABASE_URL` en ese entorno, o no se crearon las tablas | Pasos 3–5 y **Redeploy** |
| Formulario falla solo en Production | Falta Upstash | Paso 6 y **Redeploy** |
| `/sitemap.xml` con `localhost` | Despliegue anterior a esta guía | **Redeploy** |
| Una variable nueva "no hace nada" | Las variables solo aplican a despliegues nuevos | **Redeploy** |
