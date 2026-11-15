import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./MarketingHeader.module.css";

const NAV = [
  { href: "#que-incluye", label: "Qué incluye" },
  { href: "#premium", label: "Premium" },
  { href: "#planes", label: "Planes" },
  { href: "#uno-a-uno", label: "1 a 1" },
];

/** Landing header. On small screens the nav collapses into a native <details> menu (no JS). */
export function MarketingHeader() {
  const links = NAV.map((item) => (
    <li key={item.href}>
      <a href={item.href}>{item.label}</a>
    </li>
  ));

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Brand href="/" />
        <nav aria-label="Principal" className={styles.desktopNav}>
          <ul>{links}</ul>
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          <details className={styles.mobileMenu}>
            <summary aria-label="Abrir menú">
              <span aria-hidden="true" className={styles.burger} />
            </summary>
            <nav aria-label="Principal (móvil)">
              <ul>{links}</ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
