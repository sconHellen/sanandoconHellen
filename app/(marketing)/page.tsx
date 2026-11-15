import type { Metadata } from "next";
import Image from "next/image";
import buttons from "@/components/Button.module.css";
import { ChatIcon, LockIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { GiftSection } from "@/components/landing/GiftSection";
import { Plans } from "@/components/landing/Plans";
import { SERVICES, formatUsd } from "@/config/plans";
import { BREATHING, MEDITATION_GROUPS, type Availability } from "@/content/catalog";
import { FAQ } from "@/content/faq";
import { landingStructuredData } from "@/content/structured-data";
import portrait from "@/public/images/hellen-retrato.jpg";
import styles from "./page.module.css";

const DESCRIPTION =
  "Meditaciones guiadas en español para sanar heridas, encontrar tu propósito, bajar el estrés y dormir mejor. Empieza gratis con una respiración y una meditación.";

export const metadata: Metadata = {
  title: { absolute: "Sanando con Hellen · Meditaciones guiadas en español" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Sanando con Hellen",
    title: "Un lugar para volver a ti, cada vez que lo necesites",
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/images/hellen-cuencos.jpg", width: 941, height: 1672, alt: "Hellen meditando junto a cuencos tibetanos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanando con Hellen · Meditaciones guiadas en español",
    description: DESCRIPTION,
    images: ["/images/hellen-cuencos.jpg"],
  },
};

function Status({ availability }: { availability: Availability }) {
  if (availability === "free") return <span className={styles.free}>Gratis</span>;
  if (availability === "soon") return <span className={styles.soon}>Próximamente</span>;
  return (
    <span className={styles.lock} role="img" aria-label="Bloqueada">
      <LockIcon />
    </span>
  );
}

function SectionHead({ eyebrow, title, id, text }: { eyebrow: string; title: string; id: string; text?: string }) {
  return (
    <div className={styles.head}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      {text ? <p className="lead">{text}</p> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={landingStructuredData()} />

      {/* Hero */}
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <span className="eyebrow">Meditaciones guiadas en español</span>
          <h1 className={styles.display}>Un lugar para volver a ti, cada vez que lo necesites</h1>
          <p className={styles.heroLead}>
            Meditaciones para sanar heridas, encontrar tu propósito, bajar el estrés y dormir mejor. Con mi voz, con música y
            con una meditación nueva cada mes.
          </p>
          <div className={styles.ctas}>
            <a className={buttons.primary} href="#regalo">
              Recibir mi regalo gratis
            </a>
            <a className={buttons.outline} href="#planes">
              Ver los planes
            </a>
          </div>
        </div>
        <div className={styles.breath} aria-hidden="true">
          <span className={styles.breathRing} />
          <span className={styles.breathCircle} />
          <span className={styles.breathWord}>respira</span>
        </div>
      </section>

      {/* Gift */}
      <section id="regalo" className={styles.band} aria-labelledby="regalo-titulo">
        <div className={`container ${styles.narrow}`}>
          <SectionHead
            eyebrow="Un regalo para ti"
            id="regalo-titulo"
            title="Empieza gratis: una respiración y una meditación"
            text="Déjame tu correo y te abro las dos ahora mismo."
          />
          <GiftSection />
          <div className={styles.centerCta}>
            <p>¿Ya quieres todas las meditaciones y respiraciones?</p>
            <a className={buttons.outline} href="#planes">
              Ver los planes
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className={`container ${styles.about}`} aria-labelledby="hellen-titulo">
        <div className={styles.portrait}>
          <Image src={portrait} alt="Retrato de Hellen sonriendo" sizes="(min-width: 1024px) 380px, 90vw" placeholder="blur" />
        </div>
        <div className={styles.aboutText}>
          <span className="eyebrow">Quién soy</span>
          <h2 id="hellen-titulo">Hola, soy Hellen</h2>
          <p className={styles.role}>Profesora de yoga y sonoterapeuta</p>
          <p>
            Hubo una época en la que me enfermé muchísimo. Por más que lo intentaba, no lograba sentirme bien, ni en el cuerpo
            ni en el alma.
          </p>
          <p>
            En ese camino empecé a crear mis propias meditaciones: para liberar las emociones que llevaba guardadas, para
            calmar mi sistema nervioso y para volver a vivir en coherencia, con lo que siento, lo que pienso y lo que hago
            caminando en la misma dirección.
          </p>
          <p>
            Lo que nació de una necesidad se convirtió en mi camino de crecimiento. Hoy las comparto contigo, para que tú
            también tengas un lugar al que volver cada vez que lo necesites.
          </p>
        </div>
      </section>

      {/* Catalogue */}
      <section id="que-incluye" className={styles.bandSoft} aria-labelledby="catalogo-titulo">
        <div className="container">
          <SectionHead
            eyebrow="Todo lo que te espera"
            id="catalogo-titulo"
            title="Las meditaciones"
            text="Las que tienen candado se abren con cualquiera de los planes."
          />
          <div className={styles.groups}>
            {MEDITATION_GROUPS.map((group) => (
              <article key={group.slug} className={styles.group}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((it) => (
                    <li key={it.slug} className={it.availability === "free" ? styles.itemFree : undefined}>
                      <span>{it.title}</span>
                      <Status availability={it.availability} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Breathing */}
      <section className={styles.band} aria-labelledby="respiraciones-titulo">
        <div className="container">
          <SectionHead
            eyebrow="Espacio para respirar"
            id="respiraciones-titulo"
            title={`${BREATHING.length} respiraciones guiadas`}
            text="De 3, 5 o 10 minutos, con un círculo que respira contigo y mi voz guiándote."
          />
          <ul className={styles.breaths}>
            {BREATHING.map((b) => (
              <li key={b.slug} className={styles.breathItem}>
                <span className={styles.breathText}>
                  <span className={b.availability === "free" ? styles.itemTitleFree : styles.itemTitle}>{b.title}</span>
                  <span className={styles.purpose}>{b.purpose}</span>
                </span>
                <Status availability={b.availability} />
              </li>
            ))}
          </ul>
          <div className={styles.centerCta}>
            <a className={buttons.primary} href="#planes">
              Abrir todo con un plan
            </a>
          </div>
        </div>
      </section>

      {/* Premium */}
      <section id="premium" className={`container ${styles.section} ${styles.narrow}`} aria-labelledby="premium-titulo">
        <SectionHead
          eyebrow="Solo en Premium"
          id="premium-titulo"
          title="Una meditación hecha para ti, y una comunidad que te acompaña"
        />
        <div className={styles.twoCards}>
          <article className={styles.card}>
            <h3>Tu meditación personalizada</h3>
            <p>
              Después de unirte te llega un formulario: me cuentas qué estás viviendo y cómo te quieres sentir. Con tu historia
              creo una meditación de 15 a 20 minutos con tu nombre, y te llega a tu correo entre 8 y 10 días después de unirte.
            </p>
          </article>
          <article className={styles.card}>
            <h3>Comunidad de WhatsApp</h3>
            <p>
              Tips de bienestar varias veces por semana: respiraciones cortas, ideas para dormir mejor, pequeños hábitos y el
              aviso de cada meditación nueva.
            </p>
          </article>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className={styles.band} aria-labelledby="planes-titulo">
        <div className={`container ${styles.narrow}`}>
          <SectionHead eyebrow="Planes" id="planes-titulo" title="Elige cómo quieres acompañarte" />
          <Plans />
        </div>
      </section>

      {/* One-off services */}
      <section id="uno-a-uno" className={`container ${styles.section} ${styles.narrow}`} aria-labelledby="servicios-titulo">
        <SectionHead
          eyebrow="Solo para ti"
          id="servicios-titulo"
          title="Solo una meditación, una sesión o un acompañamiento"
          text="Para ti, aunque no tengas un plan. Cupos limitados cada mes."
        />
        <div className={styles.services}>
          <article className={styles.card}>
            <h3>Meditación creada para ti</h3>
            <p className={styles.servicePrice}>{formatUsd(SERVICES.custom_meditation.priceUsd ?? 0)} USD</p>
            <p>
              Me cuentas en un formulario qué estás viviendo y cómo te quieres sentir. Te llega tu meditación de 15 a 20
              minutos, con tu nombre, entre 8 y 10 días después de tu compra.
            </p>
            <a className={`${buttons.primary} ${buttons.small} ${styles.cardCta}`} href={SERVICES.custom_meditation.checkoutUrl || "#uno-a-uno"}>
              Pedir mi meditación
            </a>
          </article>
          <article className={styles.card}>
            <h3>Sesión 1 a 1</h3>
            <p className={styles.servicePrice}>{formatUsd(SERVICES.one_on_one.priceUsd ?? 0)} USD</p>
            <p>Una hora por Zoom para conversar, respirar y meditar juntos. Te quedas con la grabación. Con Premium pagas 15% menos.</p>
            <a className={`${buttons.primary} ${buttons.small} ${styles.cardCta}`} href={SERVICES.one_on_one.checkoutUrl || "#uno-a-uno"}>
              Agendar mi sesión
            </a>
          </article>
          <article className={styles.card}>
            <h3>Acompañamiento personalizado</h3>
            <p>Un proceso personal, a tu medida y a tu ritmo. Escríbeme y conversamos qué necesitas.</p>
            <span className={`${buttons.outline} ${buttons.small} ${styles.cardCta}`} aria-disabled="true">
              <ChatIcon /> Escríbeme por WhatsApp [PENDIENTE: enlace]
            </span>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.bandWarm} aria-labelledby="faq-titulo">
        <div className={`container ${styles.faqWrap}`}>
          <h2 id="faq-titulo" className={styles.centerTitle}>
            Preguntas frecuentes
          </h2>
          <dl className={styles.faq}>
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing */}
      <section className={`container ${styles.section}`} aria-labelledby="cierre-titulo">
        <div className={styles.closing}>
          <h2 id="cierre-titulo">Empieza hoy, con tu regalo gratis</h2>
          <p className="lead">Un ratito al día para ti. Lo demás llega solo.</p>
          <div className={styles.ctas}>
            <a className={buttons.primary} href="#regalo">
              Recibir mi regalo gratis
            </a>
            <a className={buttons.outline} href="#planes">
              Ver los planes
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
