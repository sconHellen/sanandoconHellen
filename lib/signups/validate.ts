import { ruleModerator } from "../moderation/index.ts";

export interface SignupInput {
  name: string;
  email: string;
}

export type SignupErrors = Partial<Record<"name" | "email" | "consent" | "form", string>>;

// Pragmatic email check (RFC 5322 is not worth implementing here); real proof is the email itself.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

/** Validates the gift form. Pure function: no I/O, unit-tested. */
export function validateGiftSignup(raw: {
  name: unknown;
  email: unknown;
  consent: unknown;
  website: unknown; // honeypot: humans never fill it
}): { ok: true; data: SignupInput } | { ok: false; errors: SignupErrors; spam?: boolean } {
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: false, errors: { form: "No pudimos procesar tu solicitud." }, spam: true };
  }
  const errors: SignupErrors = {};
  const name = typeof raw.name === "string" ? raw.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";

  if (name.length > 80) errors.name = "Tu nombre es demasiado largo.";
  else if (name && ruleModerator.check(name, "name").verdict !== "allow") errors.name = "Escribe solo tu nombre.";

  if (!email || email.length > 254 || !EMAIL.test(email)) errors.email = "Escribe un correo válido para abrir tu regalo.";
  if (raw.consent !== "on") errors.consent = "Necesitamos tu consentimiento para enviarte el regalo.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: { name, email } };
}
