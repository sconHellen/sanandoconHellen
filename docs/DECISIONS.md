# Decisiones confirmadas

Registro de decisiones tomadas por la dueña del proyecto. Donde difieran del brief (`CLAUDE.md`), **prevalecen estas**.

| Fecha | Tema | Decisión | Consecuencias en el producto |
|---|---|---|---|
| 2026-11-15 | Precios | Se usan los precios del landing: Básico 7,90 USD/mes o 49 USD/año · Premium 14,90 USD/mes o 99 USD/año · Meditación creada para ti 22 USD · Sesión 1 a 1 55 USD · Premium paga 15 % menos en sesiones. | Precios en `config/plans.ts` (único lugar). Se muestran en USD; Hotmart cobra en la moneda local. Faltan los ids de producto/oferta y enlaces de checkout de Hotmart. |
| 2026-11-15 | Reserva de sesiones 1 a 1 | **Calendly** (después del pago) + Zoom. No se construye reserva propia. | La pestaña "Sesiones 1 a 1" de la app enlaza o incrusta Calendly en vez del calendario de 3 pasos de la maqueta. Si se incrusta, la CSP debe permitir `calendly.com` en `frame-src`. Calendly ya muestra la hora del país de cada persona. Falta el enlace de Calendly. |
| 2026-11-15 | País de operación | **Malta**. Aplica el RGPD. | Zona horaria de referencia `Europe/Malta`. Se elimina "Horario de Costa Rica (GMT-6)" de la maqueta. Los textos legales deben nombrar al responsable en Malta. |
| 2026-11-15 | Biografía de Hellen | Por ahora se mantienen **ambas versiones**: landing = texto del landing (historia de la enfermedad); app = texto de la app (2020 + línea de tiempo). Pendiente confirmación final. | Sin cambios hasta la confirmación. |
| 2026-11-15 | Servicios sueltos | Los del **landing**: Meditación creada para ti, Sesión 1 a 1 y Acompañamiento personalizado (por WhatsApp, sin precio fijo). | Se descartan "Programa de 4 sesiones" y "Primera conversación gratis" de la maqueta de la app. |
| 2026-11-15 | Testimonios | Enoc y Andrea **dieron su permiso**. | Se pueden publicar. El tercer testimonio sigue como marcador hasta tener uno real con permiso. |
| 2026-11-15 | Garantía | **7 días** con devolución, como dicen las FAQ del landing. | Se configurará en el producto de Hotmart más adelante. |
| 2026-11-15 | Sección "Muy pronto: la app" | **Se mantiene.** La app móvil la desarrollará otra persona del equipo. | El formulario de aviso pedirá consentimiento explícito (RGPD) y guardará el correo. |
| 2026-11-20 | Reproductor de respiraciones | Se integra el reproductor "Espacio para respirar" diseñado por Hellen **en la misma página web, con el mismo formato**, manteniendo toda su lógica. Los audios **no se recortan** (intros y palabras siguen en un archivo cada uno, con tramos por segundo). | Reimplementación con la identidad del proyecto; referencia en `design/respiraciones/`. |
| 2026-11-20 | Nombres de las respiraciones | Se usan los **nombres nuevos** del reproductor en todo el sitio (p. ej. "Respiración reducida", "Respiración de fuego"). | Se actualiza `content/catalog.ts`. |
| 2026-11-20 | "Dato curioso" de cada respiración | Se publican tal como están. Son información, no promesas médicas; el aviso "no sustituye la atención médica o psicológica" ya está en el sitio y se reforzará en el marketing. | — |
| 2026-11-20 | Almacenamiento de audio (y luego video) | Almacenamiento de archivos con enlaces firmados; preferencia: **Cloudflare R2**. No en la base de datos ni en Google Drive. | La base guarda solo los datos de cada audio. |
| 2026-11-20 | Explicaciones del reproductor | Se **separan sin pérdida** (copia exacta de los bloques MP3, misma calidad), para que nadie descargue las 22 al practicar una. El original se guarda como copia maestra privada. | `npm run media:prepare`; ver `docs/MEDIA.md`. |
| 2026-11-20 | Qué abre el regalo en el reproductor | Respiración cuadrada completa (explicación, palabras, cierre) y su fondo sugerido "Río sereno". Todo lo demás, con un plan. | Reglas en `lib/media/breathing-assets.ts`. |
| 2026-11-20 | Cuenta de Cloudflare | Se usa la cuenta personal mientras se formaliza la empresa; migración documentada en `docs/MEDIA.md`. | — |

## Abiertas



- Confirmación final de la biografía.
