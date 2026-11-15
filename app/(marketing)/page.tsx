import type { Metadata } from "next";
import buttons from "@/components/Button.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Sanando con Hellen · Meditaciones y respiraciones guiadas" },
  alternates: { canonical: "/" },
};

// Catalogue groups as listed in the landing design (brief §2.1). Full content arrives in Phase 2.
const GROUPS = [
  "Sanar heridas",
  "Propósito y nueva vida",
  "Amor",
  "Mañanas cortas",
  "Calma y estrés",
  "Dormir",
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <h1>Un lugar para volver a ti, cada vez que lo necesites</h1>
            <p className={styles.lead}>[PENDIENTE Fase 2: texto de apoyo del héroe desde la maqueta del landing]</p>
            <div className={styles.ctas}>
              <a className={buttons.primary} href="#regalo">
                Recibe tu regalo
              </a>
              <a className={buttons.secondary} href="#planes">
                Ver planes
              </a>
            </div>
          </div>
          <div className={styles.breath} aria-hidden="true">
            <span className={styles.breathCircle} />
          </div>
        </div>
      </section>

      <section id="que-incluye" className={styles.section} aria-labelledby="que-incluye-titulo">
        <div className="container">
          <h2 id="que-incluye-titulo">Qué incluye</h2>
          <ul className={styles.grid}>
            {GROUPS.map((group, i) => (
              <li key={group} className={i % 2 ? styles.cardWarm : styles.card}>
                <h3>{group}</h3>
                <p>[PENDIENTE Fase 2: meditaciones del grupo]</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {[
        { id: "regalo", title: "Tu regalo" },
        { id: "premium", title: "Premium" },
        { id: "planes", title: "Planes" },
        { id: "uno-a-uno", title: "Sesiones 1 a 1" },
      ].map((s) => (
        <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-titulo`}>
          <div className="container">
            <div className={styles.placeholder}>
              <h2 id={`${s.id}-titulo`}>{s.title}</h2>
              <p>[PENDIENTE Fase 2: contenido de esta sección]</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
