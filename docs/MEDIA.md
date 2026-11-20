# Audios y videos: Cloudflare R2

Los audios del reproductor "Espacio para respirar" (y más adelante los videos de las meditaciones) viven en un **bucket privado de Cloudflare R2**. El sitio nunca expone el bucket: cada vez que alguien con permiso va a escuchar, el servidor comprueba su acceso y le entrega un **enlace firmado que caduca en 5 minutos**.

```
Navegador ──► /api/media/respiraciones/<audio> ──► ¿tiene acceso? ──► 302 a R2 (enlace de 5 min)
                                                      └─ no ──► 403
```

## Qué hay en el bucket

| Ruta en R2 | Qué es | Quién la escucha |
|---|---|---|
| `respiraciones/palabras.mp3` | Palabras sueltas y números (un archivo, tramos por segundo) | Regalo y planes |
| `respiraciones/cierre.mp3` | Palabras de cierre | Regalo y planes |
| `respiraciones/intros/<id>.mp3` (22) | Explicación de cada respiración, **cortada sin pérdida** del original | `cuadrada`: regalo. Las demás: planes |
| `respiraciones/fondos/<canción>.mp3` (13) | Canciones de fondo | `rio-sereno`: regalo. Las demás: planes |
| `originales/intros-v5.mp3`, `originales/palabras-v3.mp3` | Copias maestras | **Nadie** (el sitio no tiene ruta hacia ellas) |

"Sin pérdida" significa que cada explicación es una copia exacta, byte por byte, de los bloques de audio del original: misma calidad, mismo formato (MP3 96 kbps, 44,1 kHz). El corte compensa además el retardo del codificador, así que la voz empieza en el mismo instante que en el original (comprobado: diferencia menor a 1 ms).

---

## Paso 1 · Crear el bucket (una vez)

1. **dash.cloudflare.com** → **R2 Object Storage** → **Create bucket**.
2. Nombre: **`sch-media`** · Ubicación: **Europe (EU)** (jurisdicción UE, RGPD) · **sin acceso público** (no actives *Public access* ni un dominio público).

## Paso 2 · CORS del bucket (obligatorio)

El navegador descarga los audios directamente desde R2, así que el bucket debe aceptar peticiones desde el sitio.

**R2 → `sch-media` → Settings → CORS Policy → Add CORS policy** y pega:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

> `*` es seguro aquí: CORS no es lo que protege los audios; los protege la firma del enlace, que solo emite nuestro servidor y caduca en 5 minutos. Permite además que funcionen las Previews (cada una tiene una dirección distinta).

## Paso 3 · Clave de API

1. **R2 → Manage API tokens → Create API token**.
2. Permisos: **Object Read & Write** · Aplicar a: **solo el bucket `sch-media`** · Sin fecha de expiración (o la que prefieran, anotándola para rotarla).
3. Cloudflare muestra **una sola vez**: *Access Key ID* y *Secret Access Key*. El *Account ID* está en la página principal de R2.
4. **No los pegues en chats, correos ni archivos del repositorio.**

## Paso 4 · Variables en Vercel

**Settings → Environment Variables**, para **Production, Preview y Development**:

| Variable | Valor |
|---|---|
| `VIDEO_PROVIDER` | `r2` |
| `R2_ACCOUNT_ID` | Account ID |
| `R2_ACCESS_KEY_ID` | Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key |
| `R2_BUCKET` | `sch-media` |

Después: **Redeploy** de Production (y de la Preview que quieras probar).

## Paso 5 · Subir los audios (desde tu computadora)

**No los subas a mano por el panel de Cloudflare**: el script corta las 22 explicaciones y pone cada archivo en la ruta que el sitio espera.

1. Junta en **una carpeta** los audios que envió el equipo de diseño. Pueden estar en subcarpetas; el script los busca por nombre:
   - `intros-v5.mp3`, `palabras-v3.mp3`
   - las 13 canciones: `rio-sereno.mp3`, `sueno-de-seda.mp3`, … (las del paquete *fondos*)
2. En VS Code, en la carpeta del proyecto (con `git pull` hecho para tener esta versión):

   ```powershell
   npm install
   ```

   ```powershell
   npm run media:prepare -- "C:\ruta\a\la\carpeta-de-audios"
   ```

   Debe decir **`Listo: 39 archivos en ./media-out (49.1 MB)`**. Si falta un archivo, te dice cuál.
3. Crea en la raíz del proyecto un archivo **`.env.local`** (git lo ignora; nunca se sube) con:

   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=sch-media
   ```

4. Sube:

   ```powershell
   npm run media:upload
   ```

   Verás una línea `✓` por archivo y al final **`Subidos 39 de 39 archivos a sch-media`**.
5. En Cloudflare → `sch-media` → **Objects** deben aparecer las carpetas `respiraciones/` y `originales/`.

## Paso 6 · Comprobar en el sitio

En la Preview o en Production, después del Redeploy:

- [ ] Sin dejar el correo: la Respiración cuadrada muestra **"Ábrela con tu regalo gratis"**; las demás, **"Ábrela con un plan"**.
- [ ] Deja el correo en el regalo → **Respirar ahora** → **Empezar**: se oye la explicación, luego "Inhala", la campana y "Río sereno" de fondo.
- [ ] **Saltar intro**, **Pausar**, **Continuar** y **Terminar** funcionan.
- [ ] Si no suena: abre las herramientas del navegador (F12) → **Consola**. Un error de *CORS* = falta el paso 2; un 503 en `/api/media/...` = faltan variables del paso 4.

---

## Cambiar a la cuenta definitiva de Cloudflare (migración)

El sitio no guarda enlaces a Cloudflare, solo las rutas de cada archivo. Para migrar:

1. En la cuenta nueva: pasos 1 a 3 (mismo nombre de bucket o uno nuevo).
2. `npm run media:upload` con las claves nuevas en `.env.local` (la carpeta `media-out` se puede regenerar con `media:prepare`).
3. Cambia las cinco variables del paso 4 en Vercel → **Redeploy**.
4. Comprueba (paso 6) y, cuando todo funcione, borra el bucket y la clave de la cuenta personal.

## Rotar la clave (cada 6–12 meses o si se filtra)

1. Cloudflare: crea una clave nueva (paso 3).
2. Vercel: reemplaza `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY` → **Redeploy**.
3. Cloudflare: **revoca** la clave anterior.

## Para desarrolladores

| Pieza | Dónde |
|---|---|
| Corte MP3 sin pérdida (marcos MPEG + retardo del codificador) | `lib/media/mp3.ts` · pruebas `tests/unit/mp3.test.ts` |
| Firma de enlaces S3/R2 (SigV4, sin SDK) | `lib/media/sigv4.ts` · probado con el ejemplo oficial de AWS |
| Reglas de acceso (regalo / plan) | `lib/media/breathing-assets.ts` · `tests/unit/breathing-access.test.ts` |
| Ruta de entrega | `app/api/media/respiraciones/[...asset]/route.ts` (límite: 120 peticiones / 10 min por IP) |
| Proveedor (`r2` o `local`) | `lib/media/storage.ts`. `local` lee `media-out/` (o `MEDIA_LOCAL_DIR`) y solo se usa fuera de Vercel |
| Tiempos de cada explicación cortada | `content/breathing-audio.json` (lo genera `media:prepare`; se versiona) |
| Datos del reproductor | `content/breathing.ts` (portado 1:1 de `design/respiraciones/index.html`) |

En local: `npm run media:prepare -- <carpeta>` y `npm run dev`: el reproductor usa `media-out/` sin R2.
