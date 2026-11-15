import { PLANS, type PlanKey } from "@/config/plans";
import { FAQ } from "@/content/faq";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PLAN_NAMES: Record<PlanKey, string> = {
  basic_monthly: "Plan Básico mensual",
  basic_yearly: "Plan Básico anual",
  premium_monthly: "Plan Premium mensual",
  premium_yearly: "Plan Premium anual",
};

export function landingStructuredData() {
  const org = { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` };
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#hellen`,
    name: "Hellen",
    jobTitle: "Profesora de yoga y sonoterapeuta",
    image: `${SITE_URL}/images/hellen-retrato.jpg`,
    worksFor: { "@id": `${SITE_URL}/#org` },
  };
  const product = {
    "@type": "Product",
    name: `${SITE_NAME} · Meditaciones y respiraciones guiadas`,
    brand: { "@id": `${SITE_URL}/#org` },
    image: `${SITE_URL}/images/hellen-cuencos.jpg`,
    description: "Meditaciones guiadas en español para sanar heridas, encontrar tu propósito, bajar el estrés y dormir mejor.",
    offers: (Object.keys(PLANS) as PlanKey[]).map((key) => ({
      "@type": "Offer",
      name: PLAN_NAMES[key],
      price: PLANS[key].priceUsd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/#planes`,
    })),
  };
  const faq = {
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return { "@context": "https://schema.org", "@graph": [org, person, product, faq] };
}
