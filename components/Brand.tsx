import Link from "next/link";
import styles from "./Brand.module.css";

/** Lotus mark + wordmark + tagline, as in the SanandoConHellen design. */
export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.brand}>
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M20 30c-4-3-6-7-6-11 0-3 2-7 6-10 4 3 6 7 6 10 0 4-2 8-6 11z" />
        <path d="M20 30c-6 0-11-3-13-8 3-1 7-1 10 1" />
        <path d="M20 30c6 0 11-3 13-8-3-1-7-1-10 1" />
        <path d="M10 33h20" />
      </svg>
      <span className={styles.words}>
        <span className={styles.name}>Sanando con Hellen</span>
        <span className={styles.tagline}>Meditación · Respiración · Calma</span>
      </span>
    </Link>
  );
}
