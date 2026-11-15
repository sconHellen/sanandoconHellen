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

## Abiertas

- Garantía de 7 días (FAQ del landing): confirmar que coincide con la configuración del producto en Hotmart.
- Sección "Muy pronto: la app de Sanando con Hellen" con formulario de correo: ¿se mantiene? (Requiere consentimiento RGPD y guardar correos.)
- Confirmación final de la biografía.
