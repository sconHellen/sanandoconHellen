import type { Metadata } from "next";
import buttons from "@/components/Button.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Sanando con Hellen · Meditaciones guiadas en español" },
  alternates: { canonical: "/" },
};

// Catalogue groups from the landing design. Full section content arrives in Phase 2.
const GROUPS = ["Sanar heridas", "Propósito y nueva vida", "Amor", "Mañanas cortas", "Calma y estrés", "Dormir"];
const TONES = [styles.tone1, styles.tone2, styles.tone3, styles.tone4, styles.tone5, styles.tone6];

export default function HomePage() {
  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <span className="eyebrow">Meditaciones guiadas en español</span>
          <h1 className={styles.display}>Un lugar para volver a ti, cada vez que lo necesites</h1>
          <p className={styles.heroLead}>
            Meditaciones para sanar heridas, encontrar tu propósito, bajar el estrés y dormir mejor. Con mi voz, con música
            y con una meditación nueva cada mes.
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

      <section id="que-incluye" className={styles.band} aria-labelledby="que-incluye-titulo">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Todo lo que te espera</span>
            <h2 id="que-incluye-titulo">Las meditaciones</h2>
          </div>
          <ul className={styles.grid}>
            {GROUPS.map((group, i) => (
              <li key={group} className={styles.card}>
                <div className={`${styles.art} ${TONES[i % TONES.length]}`}>
                  <span className={styles.artDisc} />
                </div>
                <div className={styles.cardBody}>
                  <h3>{group}</h3>
                  <p>[PENDIENTE Fase 2: meditaciones del grupo]</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {[
        { id: "regalo", title: "Un regalo para ti" },
        { id: "premium", title: "Solo en Premium" },
        { id: "planes", title: "Planes" },
        { id: "uno-a-uno", title: "Solo para ti" },
      ].map((s) => (
        <section key={s.id} id={s.id} className={`container ${styles.section}`} aria-labelledby={`${s.id}-titulo`}>
          <div className={styles.placeholder}>
            <h2 id={`${s.id}-titulo`}>{s.title}</h2>
            <p>[PENDIENTE Fase 2: contenido de esta sección]</p>
          </div>
        </section>
      ))}
    </>
  );
}
