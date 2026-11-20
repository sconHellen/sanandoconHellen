"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { GIFT_COOKIE } from "@/lib/media/viewer";
import { rateLimit } from "@/lib/rate-limit";
import { saveSignup } from "@/lib/signups/store";
import { validateGiftSignup, type SignupErrors } from "@/lib/signups/validate";

export interface GiftState {
  status: "idle" | "error" | "success";
  name?: string;
  /** True only when the gift email was actually sent. */
  emailSent?: boolean;
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
    console.error("[signup] gift signup failed:", error instanceof Error ? `${error.name}: ${error.message}` : error);
    return { status: "error", errors: { form: "Algo salió mal. Inténtalo de nuevo en un momento." } };
  }
  // Unlocks the free gift content (square breathing) in this browser.
  (await cookies()).set(GIFT_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  // [PENDIENTE: enviar el correo con el regalo cuando esté configurado el proveedor de correo]
  return { status: "success", name: result.data.name, emailSent: false };
}
