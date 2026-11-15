/**
 * SINGLE place that maps what we sell to Hotmart products/offers and to what each
 * plan unlocks (brief §7.2). Changing a price, an offer or a checkout link means
 * editing this file (or the env vars it reads) and nothing else.
 *
 * Prices are the ones shown in the landing design, confirmed by the owner.
 * Display prices are in USD; Hotmart charges in the buyer's local currency.
 * Hotmart ids and checkout URLs arrive in Phase 3: [PENDIENTE].
 */

export type Entitlement = "catalog" | "breathing" | "sounds" | "custom_meditation" | "community";

export type PlanKey = "basic_monthly" | "basic_yearly" | "premium_monthly" | "premium_yearly";

export interface Plan {
  tier: "basic" | "premium";
  period: "monthly" | "yearly";
  /** Display price in USD, as a number (format with formatUsd). */
  priceUsd: number;
  hotmartProductId: string;
  hotmartOfferCode: string;
  checkoutUrl: string;
  entitlements: readonly Entitlement[];
}

const BASIC: readonly Entitlement[] = ["catalog", "breathing", "sounds"];
const PREMIUM: readonly Entitlement[] = [...BASIC, "custom_meditation", "community"];

export const PLANS: Record<PlanKey, Plan> = {
  basic_monthly: { tier: "basic", period: "monthly", priceUsd: 7.9, hotmartProductId: "", hotmartOfferCode: "", checkoutUrl: "", entitlements: BASIC },
  basic_yearly: { tier: "basic", period: "yearly", priceUsd: 49, hotmartProductId: "", hotmartOfferCode: "", checkoutUrl: "", entitlements: BASIC },
  premium_monthly: { tier: "premium", period: "monthly", priceUsd: 14.9, hotmartProductId: "", hotmartOfferCode: "", checkoutUrl: "", entitlements: PREMIUM },
  premium_yearly: { tier: "premium", period: "yearly", priceUsd: 99, hotmartProductId: "", hotmartOfferCode: "", checkoutUrl: "", entitlements: PREMIUM },
};

/** Premium members pay this much less on 1:1 sessions (landing design). */
export const PREMIUM_SESSION_DISCOUNT = 0.15;

export type ServiceKey = "custom_meditation" | "one_on_one" | "accompaniment";

export interface Service {
  /** null = no fixed price (contact via WhatsApp). */
  priceUsd: number | null;
  hotmartProductId: string;
  checkoutUrl: string;
}

// One-off services, as listed in the landing design (confirmed by the owner).
export const SERVICES: Record<ServiceKey, Service> = {
  custom_meditation: { priceUsd: 22, hotmartProductId: "", checkoutUrl: "" },
  one_on_one: { priceUsd: 55, hotmartProductId: "", checkoutUrl: "" }, // booked via Calendly after payment
  accompaniment: { priceUsd: null, hotmartProductId: "", checkoutUrl: "" }, // [PENDIENTE: enlace de WhatsApp]
};

/** Yearly price expressed per month, e.g. 49 → 4.08 ("Como pagar 4,08 al mes"). */
export function monthlyEquivalent(yearlyUsd: number): number {
  return Math.round((yearlyUsd / 12) * 100) / 100;
}

/** Spanish formatting with a decimal comma: 7.9 → "7,90", 49 → "49". */
export function formatUsd(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
