"use client";

import { useActionState } from "react";
import { requestGift, type GiftState } from "@/app/(marketing)/actions";
import buttons from "@/components/Button.module.css";
import { LockIcon, PlayIcon } from "@/components/icons";
import styles from "./GiftSection.module.css";

const GIFTS = [
  {
    kind: "Respiración",
    title: "Respiración cuadrada",
    text: "Inhala, sostén, exhala y descansa en cuatro tiempos iguales. Trae orden y calma cuando hay presión.",
    cta: "Respirar ahora",
  },
  {
    kind: "Meditación",
    title: "Gratitud antes de abrir los ojos",
    text: "Una meditación corta para empezar el día agradeciendo, antes de levantarte de la cama.",
    cta: "Escuchar ahora",
  },
];

const initial: GiftState = { status: "idle" };

/** Gift cards + email form. Works without JavaScript (progressive enhancement via Server Action). */
export function GiftSection() {
  const [state, formAction, pending] = useActionState(requestGift, initial);
  const unlocked = state.status === "success";
  const errors = state.status === "error" ? state.errors ?? {} : {};

  return (
    <div className={styles.wrap}>
      <div className={styles.cards}>
        {GIFTS.map((g) => (
          <article key={g.title} className={styles.card}>
            <span className="eyebrow">{g.kind}</span>
            <h3>{g.title}</h3>
            <p>{g.text}</p>
            {unlocked ? (
              <span className={`${buttons.primary} ${buttons.small} ${styles.cta}`} aria-disabled="true">
                <PlayIcon /> {g.cta} <span className={styles.pending}>[PENDIENTE: video]</span>
              </span>
            ) : (
              <p className={styles.locked}>
                <LockIcon /> Se abre con tu correo
              </p>
            )}
          </article>
        ))}
      </div>

      {unlocked ? (
        <p className={styles.success} role="status">
          {state.name ? `¡Listo, ${state.name}!` : "¡Listo!"} Ya puedes escuchar tus dos regalos, y también te los enviamos a tu
          correo.
        </p>
      ) : (
        <form action={formAction} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="gift-name">Tu nombre</label>
            <input
              id="gift-name"
              name="name"
              type="text"
              autoComplete="given-name"
              maxLength={80}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "gift-name-error" : undefined}
            />
            {errors.name ? <span id="gift-name-error" className={styles.error}>{errors.name}</span> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="gift-email">Tu correo</label>
            <input
              id="gift-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              maxLength={254}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "gift-email-error" : undefined}
            />
            {errors.email ? <span id="gift-email-error" className={styles.error}>{errors.email}</span> : null}
          </div>
          {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="gift-website">Sitio web</label>
            <input id="gift-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div className={styles.consent}>
            <input
              id="gift-consent"
              name="consent"
              type="checkbox"
              required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "gift-consent-error" : undefined}
            />
            <label htmlFor="gift-consent">
              Acepto recibir el regalo y correos de Sanando con Hellen. Puedo darme de baja cuando quiera. Lee la{" "}
              <a href="/legal/privacidad">política de privacidad</a>.
            </label>
            {errors.consent ? <span id="gift-consent-error" className={styles.error}>{errors.consent}</span> : null}
          </div>
          <button type="submit" className={buttons.primary} disabled={pending}>
            {pending ? "Abriendo tu regalo…" : "Quiero mi regalo"}
          </button>
          {errors.form ? (
            <p role="alert" className={styles.error}>
              {errors.form}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
