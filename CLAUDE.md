# Sanando con Hellen · Brief para Claude Code

> Lee este documento completo antes de escribir una sola línea de código.
> Es la fuente de verdad del proyecto. Si algo aquí choca con lo que ves en los archivos, pregunta antes de decidir.

---

## 0. Tu rol

Actúas como **desarrollador senior full-stack** a cargo de convertir dos maquetas de diseño en un producto real, seguro y en producción. Trabajas con tres sombreros a la vez:

| Rol | Qué se espera de ti en este proyecto |
|---|---|
| **Moderador de IA** | Revisar todo texto que escriba un usuario (formularios, pedidos de meditación personalizada, notas de sesión) y todo texto que genere una IA dentro del producto. Detectar lenguaje de crisis, spam, abuso y promesas médicas. Ver sección 9. |
| **Developer senior React / Node.js, DBA, HTML, CSS, ciberseguridad** | Arquitectura, código, modelo de datos, migraciones, seguridad de pagos, acceso y contenido. Ver secciones 3 a 8 y 10. |
| **SEO senior y analista de KPIs** | SEO técnico y de contenido del landing, medición de conversión y retención, y comparación contra los mejores landings del sector **sin copiarlos**. Ver sección 11. |

Escribe código y comentarios en inglés; todo texto visible para el usuario va en **español neutro**, cercano y profesional.

---

## 1. Reglas del taller (obligatorias)

1. **Foco exclusivo.** Trabajas solo en lo que pide este documento. Nada de funciones extra "porque quedarían bien" sin preguntar.
2. **Referencias sí, copias no.** Puedes estudiar otros sitios de meditación o bienestar para medir calidad, velocidad o claridad, pero **no copies formatos, textos, estructuras de sección, nombres de funciones ni ideas de producto**. Todo debe salir de las ideas de este brief y de las dos maquetas.
3. **Nada de proyectos existentes.** No clones repositorios, plantillas, *starters*, *boilerplates* ni temas de terceros. Se escribe desde cero.
   - Sí puedes usar librerías y SDK oficiales y mantenidos (React, Next.js, el driver de la base de datos, el SDK del proveedor de correo, etc.).
   - Cada dependencia nueva debe justificarse en `docs/DEPENDENCIES.md` (para qué, alternativa descartada, licencia). Menos dependencias = menos superficie de ataque.
4. **Las dos carpetas son referencia, no código de producción.** Ver sección 2.
5. **Entregable justo y detallado.** Cada fase termina con: código, pruebas, documentación actualizada y una lista de lo pendiente. Nada de "TODO" escondidos en el código.
6. **Ante la duda, pregunta.** Especialmente en pagos, acceso, textos legales y cualquier cosa irreversible.

---

## 2. Las dos carpetas y en qué se diferencian

Ambas carpetas son **exportaciones de una herramienta de diseño visual** (archivos `Main.dc.html` con una plantilla `<x-dc>` y una pequeña clase de lógica). `support.js` y `vendor/react*.js` son solo el visor de la maqueta: **no forman parte del producto, no los reutilices**. Los valores a replicar están en los atributos `style="…"` y en el bloque `<helmet><style>`.

Para verlas: sirve la carpeta (`python3 -m http.server`) y abre `Main.dc.html`.

### 2.1 `Landing page-html v1/` → **la página pública de venta**

- Qué es: el landing que diseñó Hellen. Define **el contenido, el orden de las secciones y el embudo de venta**.
- Secciones (en este orden): cabecera con navegación (Qué incluye · Premium · Planes · 1 a 1) → héroe *"Un lugar para volver a ti, cada vez que lo necesites"* → regalo gratis (respiración cuadrada + *Gratitud antes de abrir los ojos*, con formulario nombre + correo) → *Hola, soy Hellen* → catálogo de meditaciones por grupos → 22 respiraciones guiadas → Premium (meditación personalizada + comunidad de WhatsApp) → planes (Básico y Premium, con selector mensual/anual) → servicios sueltos (meditación creada para ti, sesión 1 a 1, acompañamiento) → preguntas frecuentes → cierre con regalo → pie *"Pagos seguros con Hotmart"*.
- Grupos del catálogo que ya aparecen: Sanar heridas · Propósito y nueva vida · Amor · Mañanas cortas · Calma y estrés · Dormir. Algunas meditaciones están marcadas como gratis, bloqueadas o "pronto".
- **Lo que NO se conserva del landing:** su identidad visual. Hoy usa una paleta nocturna (morado muy oscuro `#120c26`/`#1a1030` con dorado `#f2c46d`) y las fuentes *Instrument Serif* + *Figtree*. **Se reemplazan por la identidad de `SanandoConHellen`** (sección 5). Su paleta oscura puede servir de inspiración para el modo oscuro, pero los colores finales salen de la paleta del proyecto.

### 2.2 `SanandoConHellen/` → **la app de miembros y la identidad visual**

- Qué es: el diseño del producto completo de meditaciones, el lugar donde vive la persona **después de comprar**.
- Pestañas: Inicio · Meditaciones (con filtros por categoría) · Respiraciones conscientes (*"Tu respiración es tu ancla"*) · Sonidos (*"Sin palabras, solo calma"*) · Sesiones 1 a 1 (reserva en 3 pasos: tipo de sesión → día → hora → datos → confirmación).
- Incluye además: héroe *"Respira. Suelta."*, *Hola, soy Hellen*, *Mi camino*, testimonios de la comunidad, aviso de la app, pie con YouTube, Instagram y TikTok, y dos imágenes en `assets/`.
- **Es la fuente de verdad de fuentes, colores, radios, sombras y animaciones** para todo el producto, landing incluido.

### 2.3 Cómo se relacionan

```
Visitante ──► LANDING (público, SEO) ──► Hotmart (checkout) ──► webhook ──► nuestra API
                                                                              │
Persona compradora ◄── correo con enlace único ◄──────────────────────────────┘
        │
        ▼
 Acepta términos y políticas ──► Vincula su dispositivo ──► APP DE MIEMBROS (SanandoConHellen)
```

Un solo repositorio, una sola base de datos, una sola identidad visual, todo sincronizado.

---

## 3. Arquitectura propuesta

| Capa | Decisión | Por qué |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** en un único repo | Front y backend (Route Handlers / Server Actions) en un solo despliegue de Vercel |
| Hosting | **Vercel** (Production + Preview por rama) | Pedido explícito; previews para revisar cada cambio |
| Base de datos | **PostgreSQL** gestionado (desde el Marketplace de Vercel, p. ej. Neon) + ORM con migraciones versionadas (Drizzle o Prisma, elige uno y justifícalo) | Datos relacionales: usuarios, suscripciones, dispositivos, eventos |
| Correo transaccional | Proveedor con SDK oficial (p. ej. Resend o Postmark) y dominio propio con SPF, DKIM y DMARC | Los enlaces de acceso deben llegar y no caer en spam |
| Video | Proveedor de streaming con **URLs firmadas de vida corta** y HLS (p. ej. Mux, Cloudflare Stream o almacenamiento S3/R2 + firma). Encapsúlalo detrás de una interfaz `VideoProvider` | Las meditaciones son MP4; nunca deben quedar con una URL pública descargable |
| Rate limiting | Almacén clave-valor (p. ej. Upstash Redis desde el Marketplace) | Límites en login, webhooks y formularios |
| Estilos | CSS con **variables de diseño** (tokens) + CSS Modules o Tailwind configurado con esos tokens | Tema claro/oscuro sin duplicar estilos |

Estructura sugerida:

```
/app
  /(marketing)        → landing público (rutas SEO)
  /(members)          → app de miembros, protegida
  /acceso             → canje del enlace único + términos + vínculo de dispositivo
  /legal              → términos, privacidad, cookies (versionados)
  /api/hotmart/webhook
  /api/auth/*
  /api/media/*        → emite URLs firmadas de video
/lib
  /hotmart            → cliente API + verificación de webhooks + mapeo de planes
  /auth               → tokens, sesiones, dispositivos
  /video              → VideoProvider
  /moderation
/config
  plans.ts            → ÚNICO lugar donde se mapean productos/ofertas de Hotmart a planes
/content
  meditations.manifest.json
/docs                 → HOTMART.md, SECURITY.md, CONTENT-IMPORT.md, DEPENDENCIES.md, KPIS.md
```

---

## 4. Vercel

1. Conecta el repo a un proyecto de Vercel con entornos **Development, Preview y Production**.
2. Todos los secretos van en **variables de entorno de Vercel**, nunca en el repo. Crea `.env.example` con los nombres y sin valores:

```
DATABASE_URL=
HOTMART_CLIENT_ID=
HOTMART_CLIENT_SECRET=
HOTMART_BASIC_TOKEN=
HOTMART_WEBHOOK_HOTTOK=
HOTMART_ENV=sandbox            # sandbox | production
EMAIL_API_KEY=
EMAIL_FROM=
VIDEO_PROVIDER=                # mux | cloudflare | s3
VIDEO_*=                       # credenciales del proveedor elegido
SESSION_SECRET=
RATE_LIMIT_URL=
RATE_LIMIT_TOKEN=
APP_URL=
```

3. Previews con base de datos y Hotmart **de prueba** (sandbox); producción con los reales. Un webhook de sandbox nunca debe poder escribir en la base de producción.
4. Cabeceras de seguridad en `next.config` o middleware: CSP estricta, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
5. El backend crece dentro del mismo proyecto (Route Handlers). Si en el futuro hace falta un servicio aparte, documenta el motivo antes de separarlo.

---

## 5. Identidad visual: se mantiene la de SanandoConHellen

### 5.1 Fuentes

- Títulos: **Cormorant Garamond** (400, 500, 600 e itálicas 400 y 500), con respaldo `Georgia, serif`.
- Texto e interfaz: **Nunito Sans** (400, 600, 700), con respaldo `system-ui, sans-serif`.
- Cárgalas con `next/font` (autoalojadas, sin petición a Google en tiempo de ejecución, `display: swap`).
- **Elimina** *Instrument Serif* y *Figtree* del landing.

### 5.2 Paleta clara (la actual, extraída del proyecto)

| Token | Valor | Uso en la maqueta |
|---|---|---|
| `--bg` | `#F8F3EA` | fondo de página |
| `--surface` | `#FFFCF7` | tarjetas |
| `--surface-soft` | `#FBF7F0` | bloques alternos |
| `--lavender-50` | `#EEE6F6` | fondos suaves |
| `--lavender-100` | `#E5DAF2` | pestaña activa, chips |
| `--lavender-200` | `#D9CBEE` | acentos suaves |
| `--lavender-300` | `#B9A3D6` | acentos |
| `--lavender-400` | `#9C86C4` | acentos fuertes |
| `--cream-warm` | `#EFE4D3`, `#F2E9DC` | tonos cálidos alternos de tarjetas |
| `--text-strong` | `#3A2C55` | títulos |
| `--text` | `#4B3B6B` | texto principal, botón primario |
| `--text-muted` | `#54466E`, `#6E5C8C` | texto secundario |
| `--link` | `#5B4880` | enlaces (hover `#3A2C55`) |

Radios: botones y pastillas `999px`; tarjetas `24px`, `22px` y `14px`; avatares `50%`. Animaciones existentes: `respira` (escala 0.62 → 1 → 0.62) y `flota` (sube 10px). Respeta `prefers-reduced-motion`.

Recorre ambos `Main.dc.html` y pasa **todos** los valores a `tokens.css`; esta tabla es el punto de partida, no la lista completa.

### 5.3 Modo oscuro (nuevo)

- Requisitos: mismo formato, mismas proporciones, mismas fuentes y misma calidez; solo cambian los colores. Nada de negro puro ni blanco puro.
- Funcionamiento: sigue `prefers-color-scheme` por defecto, con un interruptor visible (sol/luna) en la cabecera de landing y app. La elección se guarda en una cookie para que el servidor pinte el tema correcto sin parpadeo.
- Implementación: los componentes **solo** usan tokens. El tema oscuro redefine los tokens bajo `[data-theme="dark"]`.
- Propuesta de partida, derivada de los morados del proyecto (valídala y ajústala):

| Token | Oscuro propuesto |
|---|---|
| `--bg` | `#1B1526` |
| `--surface` | `#251D33` |
| `--surface-soft` | `#2D2340` |
| `--lavender-100` (pestaña activa) | `#3A2C55` |
| `--text-strong` | `#F6F0FA` |
| `--text` | `#E6DCEF` |
| `--text-muted` | `#B7ABC9` |
| `--link` | `#C9B8E3` |
| botón primario | fondo `#D9CBEE`, texto `#2A1F3D` |

- Criterio de aceptación: contraste WCAG AA (4.5:1 en texto normal, 3:1 en texto de 24px o más) en ambos temas, verificado con una prueba automática.

---

## 6. Responsive: del móvil a la televisión

| Rango | Dispositivo | Notas |
|---|---|---|
| < 480px | móvil | menú colapsado, una columna, zonas táctiles ≥ 44px |
| 480–767px | móvil grande | |
| 768–1023px | tablet | 2 columnas en catálogos |
| 1024–1439px | laptop | |
| 1440–1919px | PC | contenedor con ancho máximo |
| ≥ 1920px | **TV / pantallas grandes** | "interfaz de 3 metros": tipografía ~1.5×, navegación con flechas del control remoto o teclado, foco muy visible, reproductor a pantalla completa por defecto |

- Diseña *mobile-first* con tipografía fluida (`clamp()`).
- Prueba en Chrome, Safari (iOS y macOS), Firefox, Samsung Internet y el navegador de una Smart TV o Chromecast si es posible.
- Pruebas visuales automatizadas (Playwright) en 390, 768, 1280, 1440 y 1920px, en los dos temas.

---

## 7. Hotmart: pagos y suscripciones

**Antes de implementar, verifica cada endpoint, nombre de evento y cabecera en la documentación oficial vigente de Hotmart para desarrolladores** (developers.hotmart.com). Lo que sigue es el diseño; los detalles exactos de la API pueden haber cambiado.

### 7.1 Qué se vende

- Planes de suscripción: **Básico** y **Premium**, cada uno en **mensual** y **anual** (como en el landing).
- Productos sueltos: meditación creada para ti, sesión 1 a 1, acompañamiento.
- El checkout es **siempre** el de Hotmart; los botones del landing llevan a los enlaces de pago de Hotmart. Nunca tocamos datos de tarjeta.

### 7.2 Un solo archivo de configuración

`/config/plans.ts` es el **único** lugar donde se relacionan productos y ofertas de Hotmart con lo que desbloquea cada plan:

```ts
// Ejemplo de forma, no valores reales
export const PLANS = {
  basic_monthly:   { hotmartProductId: "", hotmartOfferCode: "", checkoutUrl: "", entitlements: ["catalog", "breathing", "sounds"] },
  basic_yearly:    { ... },
  premium_monthly: { ..., entitlements: ["catalog", "breathing", "sounds", "custom_meditation", "community"] },
  premium_yearly:  { ... },
} as const;
```

Cambiar un precio, un plan o una oferta en Hotmart = cambiar este archivo (o sus variables de entorno) y nada más.

### 7.3 Webhook (postback)

- Ruta: `POST /api/hotmart/webhook`.
- Verifica el token secreto que Hotmart envía en la cabecera (hottok) contra `HOTMART_WEBHOOK_HOTTOK` con comparación de tiempo constante. Si no coincide: 401 y registro.
- **Idempotencia:** guarda cada evento en `hotmart_events` con su id único; si llega repetido, responde 200 sin reprocesarlo.
- Responde rápido (2xx) y procesa la lógica de forma confiable; si falla, el evento queda pendiente para reintento.
- Eventos a manejar (confirma los nombres exactos en la documentación): compra aprobada o completa, cancelación, reembolso, contracargo, reclamo, pago atrasado, cancelación de suscripción, cambio de plan y cambio de fecha de cobro.
- Efecto de cada evento sobre `subscriptions` y `entitlements`, en una tabla dentro de `docs/HOTMART.md`. Ejemplo: reembolso o contracargo → acceso revocado de inmediato y todas las sesiones cerradas; pago atrasado → periodo de gracia configurable.

### 7.4 API de Hotmart

- Autenticación OAuth con credenciales de cliente (client id, secret y basic token desde el panel de Hotmart), con el token en caché hasta que expire.
- Uso: conciliación diaria (tarea programada de Vercel) que compara las suscripciones de Hotmart con nuestra base y corrige diferencias por webhooks perdidos.
- Entorno **sandbox** para todo el desarrollo y las previews.

### 7.5 Entregable obligatorio: `docs/HOTMART.md`

Debe explicar paso a paso, para alguien no técnico y para un desarrollador:

1. Cómo crear las credenciales en Hotmart y dónde pegarlas en Vercel.
2. Cómo registrar la URL del webhook y su token en Hotmart.
3. Cómo cambiar planes, precios, ofertas o enlaces de checkout (qué archivo, qué variable).
4. Cómo pasar de sandbox a producción.
5. Cómo reenviar un evento fallido y cómo leer el registro de eventos.
6. Qué hacer si Hotmart cambia su API (dónde está el cliente, qué pruebas correr).

---

## 8. Acceso: términos, enlace único y un solo dispositivo

Objetivo: que **solo la persona que compró** pueda entrar, desde **un dispositivo a la vez**, aunque comparta su correo de Gmail o Hotmail.

### 8.1 Flujo

1. **Compra aprobada** (webhook) → se crea o actualiza el usuario con el correo del comprador y se activan sus permisos.
2. **Correo de bienvenida** con un **enlace de acceso único**:
   - token aleatorio de 32 bytes o más; en la base se guarda **solo su hash**;
   - un solo uso, expira en 15 minutos;
   - el enlace lleva a una página que pide confirmar con un botón (así los antivirus de correo que abren enlaces no lo "gastan").
3. **Primera entrada** → pantalla de **términos y condiciones, política de privacidad y política de cookies**:
   - casillas sin marcar por defecto, no se puede seguir sin aceptar;
   - se guarda versión del documento, fecha y hora, y dispositivo;
   - si un documento cambia de versión, se vuelve a pedir la aceptación;
   - los textos llegarán después: crea las páginas en `/legal` con contenido de ejemplo claramente marcado como "[PENDIENTE]".
4. **Vínculo del dispositivo** → se crea una **sesión ligada a ese dispositivo**: cookie `httpOnly`, `Secure`, `SameSite=Lax` con un id de dispositivo aleatorio, guardado en `devices` con el nombre legible del navegador y sistema. Opcional recomendado: ofrecer una **passkey (WebAuthn)** para entrar luego sin correo.
5. **Cambio de dispositivo** → en el dispositivo nuevo, la persona pide acceso → llega **otro enlace único a su correo** → al usarlo:
   - el dispositivo anterior queda **revocado** y su sesión se cierra en la siguiente petición;
   - se avisa por correo: *"Tu cuenta se abrió en un nuevo dispositivo"*, con opción de revocarlo.
6. **Sin conexiones simultáneas:** como máximo **una sesión activa y una reproducción activa** por cuenta. El reproductor envía un latido periódico; si otra sesión intenta reproducir, la anterior se detiene.
7. **Antiabuso:** límite de cambios de dispositivo (p. ej. 3 por mes, configurable). Al superarlo, el cambio queda pendiente de revisión manual en un panel de administración.

### 8.2 Tablas mínimas

`users`, `subscriptions`, `entitlements`, `hotmart_events`, `access_tokens` (hash, expira, usado), `devices` (activo/revocado), `sessions`, `legal_documents` (versión), `legal_acceptances`, `meditations`, `media_assets`, `playback_progress`, `audit_log`.

### 8.3 Privacidad (Unión Europea / Malta)

El negocio opera desde Malta: aplica el **RGPD**. Usa el identificador de dispositivo mínimo necesario (no huellas digitales invasivas), explica en la política de privacidad para qué se usa, permite exportar y borrar la cuenta, y define plazos de retención de los registros.

---

## 9. Moderación con IA

Aplica a: el formulario de meditación personalizada, el campo *"¿Qué te gustaría trabajar?"* de la reserva 1 a 1, las notas personales y cualquier texto que en el futuro genere una IA dentro del producto.

- **Lenguaje de crisis** (autolesión, ideas suicidas, violencia): no se bloquea a la persona; se le muestra de inmediato un mensaje cálido con recursos de ayuda de su país y se marca el caso para que Hellen lo vea con prioridad.
- **Promesas médicas:** el producto no diagnostica ni cura. Ningún texto (humano o de IA) debe prometer curas. Añade un aviso visible: las meditaciones no sustituyen la atención médica o psicológica.
- **Spam y abuso:** límites de frecuencia y filtro de enlaces y contenido ofensivo.
- La moderación vive en `/lib/moderation`, detrás de una interfaz, con registro de cada decisión y la posibilidad de que una persona la revise.

---

## 10. Las meditaciones en MP4

- Formato: video MP4 con diapositivas; llegarán **más adelante desde otra fuente**. No inventes contenido.
- Prepara ahora:
  1. **Modelo de contenido** en `meditations`: `slug`, título, grupo, duración, descripción, gratis/bloqueada/pronto, plan mínimo, orden, `media_asset_id`.
  2. **Catálogo inicial** con los títulos y grupos del landing, sin video asignado ("pronto").
  3. **Importador** (`scripts/import-meditations`): recibe una carpeta de MP4 y un `meditations.manifest.json` o CSV, sube cada archivo al `VideoProvider` y lo **empareja** con su meditación por `slug`; si no hay `slug`, por título normalizado (sin tildes, minúsculas) y similitud. Genera un **informe** con emparejados, dudosos y sin pareja; los dudosos nunca se asignan solos.
  4. **Reproducción protegida:** URLs firmadas de pocos minutos emitidas por `/api/media`, solo para usuarios con permiso y dispositivo activo; streaming HLS, sin botón de descarga; marca de agua discreta con el correo de la persona como disuasión.
- Documenta todo en `docs/CONTENT-IMPORT.md`.

### 10.1 Sesiones innovadoras: profesionales pero cercanas

Esta es la parte donde el producto debe distinguirse. Desarrolla estas ideas, propias de este proyecto (no las copies de otras apps):

- **Antes de empezar, un registro de un toque:** *"¿Cómo llegas hoy?"* con 4 o 5 estados. Sugiere una meditación o respiración del catálogo según la respuesta.
- **Modo ritual:** al reproducir, la interfaz se apaga suavemente hasta quedar solo la diapositiva y un pulso de respiración que usa la animación `respira` del diseño. En TV, este modo es el predeterminado.
- **Al terminar, un cierre:** *"¿Qué te llevas?"* con una nota privada opcional, guardada solo para la persona.
- **Retomar donde lo dejaste**, con progreso guardado en el servidor (no en el dispositivo).
- **Constancia sin presión:** un recorrido visual de los días que la persona se dio un espacio, sin rachas que castiguen ni notificaciones que culpen.
- **Puente con lo humano:** desde una meditación, un enlace natural a pedir una meditación personalizada o una sesión 1 a 1 con Hellen (Premium).

Presenta cada idea como propuesta con su esfuerzo estimado antes de construirla.

---

## 11. SEO y KPIs

### 11.1 SEO técnico del landing

- Renderizado en servidor o estático, HTML semántico, un solo `h1` por página.
- Metadatos por página, Open Graph y tarjetas de redes, `sitemap.xml`, `robots.txt`, URL canónica, `lang="es"`.
- Datos estructurados schema.org: `Organization`, `Person` (Hellen), `Product`/`Offer` para los planes, `FAQPage` para las preguntas frecuentes.
- Core Web Vitals en móvil: **LCP < 2.5 s, INP < 200 ms, CLS < 0.1**. Imágenes con `next/image`, fuentes autoalojadas, JavaScript mínimo en el landing.
- La app de miembros va con `noindex`.

### 11.2 KPIs a medir desde el primer día

| Embudo | KPI |
|---|---|
| Atracción | visitas, fuentes de tráfico, posición en búsquedas clave |
| Captación | conversión visita → regalo gratis (correo dejado) |
| Venta | conversión regalo → compra, clic en plan → compra aprobada, abandono de checkout |
| Activación | % que completa su primera meditación en 48 h tras comprar |
| Retención | uso a 7 y 30 días, cancelación mensual (churn), duración media de suscripción |
| Valor | ingreso medio por usuario, valor de vida (LTV), paso de Básico a Premium |
| Contenido | tasa de finalización por meditación, meditaciones más y menos escuchadas |

- Analítica respetuosa de la privacidad y con consentimiento de cookies (RGPD).
- Eventos propios: `gift_signup`, `plan_click`, `purchase_approved`, `first_session_completed`, `session_completed`, `device_changed`.
- Entregable: `docs/KPIS.md` con definiciones, de dónde sale cada dato y un tablero sencillo.

### 11.3 Comparación con los mejores

Elige 5 landings líderes de bienestar o meditación y compáralos en **criterios medibles**: velocidad, claridad del primer pantallazo, pasos hasta pagar, accesibilidad, confianza (pagos, garantías, testimonios). Entrega una tabla con dónde estamos y qué mejorar **con ideas propias**. No se copian textos, diseños ni estructuras.

---

## 12. Seguridad (lista mínima)

- OWASP Top 10 revisado y documentado en `docs/SECURITY.md`.
- Validación de toda entrada en el servidor (con esquemas), consultas parametrizadas (ORM), escape de salida.
- Protección CSRF en formularios, cookies seguras, CSP sin `unsafe-inline` en scripts.
- Límites de frecuencia en: pedir enlace de acceso, webhook, formularios y reproducción.
- Secretos solo en Vercel; rotación documentada.
- Usuario de base de datos con permisos mínimos; copias de seguridad automáticas y una prueba de restauración.
- Registro de auditoría de: accesos, cambios de dispositivo, aceptaciones legales, eventos de pago y acciones de administración.
- `npm audit` / revisión de dependencias en cada PR; nada de paquetes abandonados.
- Panel de administración mínimo (solo Hellen y Keyron) protegido con passkey o segundo factor.

---

## 13. Fases y entregables

| Fase | Contenido | Termina cuando |
|---|---|---|
| 1. Base | repo, Vercel, base de datos, tokens de diseño, tema claro/oscuro, layout responsive | landing y app se ven con la identidad del proyecto en los 6 rangos y los 2 temas |
| 2. Landing | todas las secciones del landing con la identidad nueva, SEO técnico, regalo gratis con captura de correo | Lighthouse ≥ 90 en móvil en rendimiento, accesibilidad, buenas prácticas y SEO |
| 3. Hotmart | `plans.ts`, webhook, conciliación, sandbox, `docs/HOTMART.md` | una compra de prueba en sandbox crea al usuario y un reembolso lo revoca |
| 4. Acceso | enlace único, términos, dispositivo único, cambio de dispositivo, sin multiconexión | pruebas automáticas de cada caso de la sección 8 |
| 5. App de miembros | pestañas del diseño, catálogo, reproductor protegido, sesiones de la sección 10.1 | flujo completo de compra → primera meditación en Preview |
| 6. Contenido | importador de MP4 y emparejamiento | informe de importación con 0 asignaciones dudosas automáticas |
| 7. Medición y cierre | KPIs, comparación, revisión de seguridad | `docs/` completo y lista de pendientes acordada |

Al final de cada fase entrega: resumen de lo hecho, cómo probarlo en la Preview de Vercel, pruebas que pasan y decisiones que necesitan visto bueno.

---

## 14. Pendiente de recibir (no lo inventes)

- Textos legales: términos y condiciones, privacidad, cookies.
- Precios finales y los ids de producto y oferta de Hotmart.
- Los videos MP4 de las meditaciones y su lista con títulos.
- Dominio definitivo y correo remitente.
- Enlaces reales de Instagram, YouTube, TikTok y WhatsApp, y el correo de contacto.

Usa marcadores visibles tipo `[PENDIENTE: …]` hasta tenerlos.
