import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import buttons from "@/components/Button.module.css";
import styles from "./page.module.css";
import heroPhoto from "@/public/images/hellen-cuencos.jpg";

export const metadata: Metadata = { title: "Inicio" };

export default function MembersHome() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <span className="eyebrow">Tu refugio de calma</span>
        <h1 className={styles.display}>
          Respira. Suelta.
          <br />
          <em>Vuelve a ti.</em>
        </h1>
        <p className={styles.lead}>
          Meditaciones guiadas, respiraciones conscientes y sonidos para sanar, creados con amor por Hellen. Un espacio
          para cuando la vida te pide una pausa.
        </p>
        <div className={styles.ctas}>
          <Link className={buttons.primary} href="/miembros/meditaciones">
            Empieza a meditar
          </Link>
          <Link className={buttons.outline} href="/miembros/sesiones">
            Sesión uno a uno
          </Link>
        </div>
      </div>
      <div className={styles.visual}>
        <span className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" />
        <span className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" />
        <div className={styles.photo}>
          <Image
            src={heroPhoto}
            alt="Hellen meditando junto a cuencos tibetanos"
            priority
            sizes="(min-width: 1024px) 340px, 76vw"
            placeholder="blur"
          />
        </div>
      </div>
    </section>
  );
}
