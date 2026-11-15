import Link from "next/link";
import styles from "./SiteFooter.module.css";

const EXPLORE = [
  { href: "/miembros", label: "Inicio" },
  { href: "/miembros/meditaciones", label: "Meditaciones" },
  { href: "/miembros/respiraciones", label: "Respiraciones conscientes" },
  { href: "/miembros/sonidos", label: "Sonidos" },
  { href: "/miembros/sesiones", label: "Sesiones 1 a 1" },
];

const LANDING = [
  { href: "#que-incluye", label: "Qué incluye" },
  { href: "#premium", label: "Premium" },
  { href: "#planes", label: "Planes" },
  { href: "#uno-a-uno", label: "1 a 1" },
];

export function SiteFooter({ variant }: { variant: "marketing" | "members" }) {
  const links = variant === "members" ? EXPLORE : LANDING;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.about}>
          <span className={styles.name}>Sanando con Hellen</span>
          <span>Un espacio de calma para respirar, sanar y volver a ti.</span>
        </div>
        <div className={styles.columns}>
          <nav aria-label="Explora" className={styles.column}>
            <span className={styles.heading}>Explora</span>
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a key={l.href} href={l.href}>{l.label}</a>
              ) : (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ),
            )}
          </nav>
          <div className={styles.column}>
            <span className={styles.heading}>Sígueme</span>
            <span>[PENDIENTE: YouTube]</span>
            <span>[PENDIENTE: Instagram]</span>
            <span>[PENDIENTE: TikTok]</span>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        © {new Date().getFullYear()} Sanando con Hellen · Este contenido no sustituye la atención médica o psicológica
        profesional.
        {variant === "marketing" ? " · Pagos seguros con Hotmart" : null}
      </div>
    </footer>
  );
}
