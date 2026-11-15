"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { saveSignup } from "@/lib/signups/store";
import { validateGiftSignup, type SignupErrors } from "@/lib/signups/validate";

export interface GiftState {
  status: "idle" | "error" | "success";
  name?: string;
  errors?: SignupErrors;
}

/**
 * Landing gift form. Server Actions are POST-only and Next.js checks the Origin header
 * against the host, which protects this form against CSRF.
 */
export async function requestGift(_prev: GiftState, formData: FormData): Promise<GiftState> {
  const result = validateGiftSignup({
    name: formData.get("name"),
    email: formData.get("email"),
    consent: formData.get("consent"),
    website: formData.get("website"),
  });
  if (!result.ok) return { status: "error", errors: result.errors };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Only a hash of the IP is used as the limiter key; it is never stored in the database.
  const ipKey = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`gift:ip:${ipKey}`, 5, 600),
    rateLimit(`gift:email:${result.data.email}`, 3, 3600),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    return { status: "error", errors: { form: "Has hecho varios intentos seguidos. Espera unos minutos y vuelve a probar." } };
  }

  try {
    await saveSignup("gift", result.data.email, result.data.name || null);
  } catch (error) {
    console.error("gift signup failed", error);
    return { status: "error", errors: { form: "Algo salió mal. Inténtalo de nuevo en un momento." } };
  }
  // [PENDIENTE: enviar el correo con el regalo cuando esté configurado el proveedor de correo]
  return { status: "success", name: result.data.name };
}
