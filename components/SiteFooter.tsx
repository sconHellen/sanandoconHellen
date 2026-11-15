import styles from "./SiteFooter.module.css";

export function SiteFooter({ variant }: { variant: "marketing" | "members" }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.disclaimer}>
          Las meditaciones acompañan tu bienestar, pero no sustituyen la atención médica o psicológica.
        </p>
        {variant === "marketing" ? (
          <p className={styles.small}>Pagos seguros con Hotmart</p>
        ) : (
          <p className={styles.small}>[PENDIENTE: enlaces de YouTube, Instagram y TikTok]</p>
        )}
        <p className={styles.small}>© {new Date().getFullYear()} Sanando con Hellen</p>
      </div>
    </footer>
  );
}
