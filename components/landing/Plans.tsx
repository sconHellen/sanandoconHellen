import { PLANS, formatUsd, monthlyEquivalent, type Plan } from "@/config/plans";
import buttons from "@/components/Button.module.css";
import styles from "./Plans.module.css";

const FEATURES = {
  basic: [
    "Todas las meditaciones",
    "Una meditación nueva cada mes",
    "Espacio para respirar",
    "Escúchalas cuando quieras, desde el celular o la computadora",
  ],
  premium: [
    "Todo lo del plan Básico",
    "Una meditación creada para ti",
    "Comunidad de WhatsApp con tips de bienestar",
    "15% de descuento en las sesiones 1 a 1",
  ],
};

// [PENDIENTE: enlaces de checkout de Hotmart en config/plans.ts]
const href = (plan: Plan) => plan.checkoutUrl || "#planes";

function Price({ plan, period }: { plan: Plan; period: "monthly" | "yearly" }) {
  return (
    <div className={period === "yearly" ? styles.yearly : styles.monthly}>
      <p className={styles.price}>
        <span className={styles.amount}>{formatUsd(plan.priceUsd)}</span>
        <span>{period === "yearly" ? "USD al año" : "USD al mes"}</span>
      </p>
      <p className={styles.note}>
        {period === "yearly" ? `Como pagar ${formatUsd(monthlyEquivalent(plan.priceUsd))} al mes` : "Cancela cuando quieras"}
      </p>
    </div>
  );
}

/**
 * Monthly / yearly switch built with native radio buttons and CSS :has() — no JavaScript,
 * keyboard accessible, and the server renders both price sets.
 */
export function Plans() {
  return (
    <div className={styles.plans}>
      <fieldset className={styles.switch}>
        <legend className="visually-hidden">Forma de pago</legend>
        <input type="radio" name="periodo" id="periodo-mensual" value="monthly" />
        <label htmlFor="periodo-mensual">Pago mensual</label>
        <input type="radio" name="periodo" id="periodo-anual" value="yearly" defaultChecked />
        <label htmlFor="periodo-anual">Pago anual</label>
      </fieldset>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h3 className={styles.name}>Básico</h3>
          <Price plan={PLANS.basic_monthly} period="monthly" />
          <Price plan={PLANS.basic_yearly} period="yearly" />
          <ul className={styles.features}>
            {FEATURES.basic.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <a className={`${buttons.outline} ${styles.cta} ${styles.monthly}`} href={href(PLANS.basic_monthly)}>
            Quiero el Básico
          </a>
          <a className={`${buttons.outline} ${styles.cta} ${styles.yearly}`} href={href(PLANS.basic_yearly)}>
            Quiero el Básico
          </a>
        </article>

        <article className={`${styles.card} ${styles.featured}`}>
          <div className={styles.head}>
            <h3 className={styles.name}>Premium</h3>
            <span className={styles.badge}>Más completo</span>
          </div>
          <Price plan={PLANS.premium_monthly} period="monthly" />
          <Price plan={PLANS.premium_yearly} period="yearly" />
          <ul className={styles.features}>
            {FEATURES.premium.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <a className={`${buttons.primary} ${styles.cta} ${styles.ctaFeatured} ${styles.monthly}`} href={href(PLANS.premium_monthly)}>
            Quiero el Premium
          </a>
          <a className={`${buttons.primary} ${styles.cta} ${styles.ctaFeatured} ${styles.yearly}`} href={href(PLANS.premium_yearly)}>
            Quiero el Premium
          </a>
        </article>
      </div>
      <p className={styles.footnote}>Precios en dólares. Hotmart te cobra en la moneda de tu país. Puedes cancelar cuando quieras.</p>
    </div>
  );
}
