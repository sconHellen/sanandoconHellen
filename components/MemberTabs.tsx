"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MemberTabs.module.css";

export const MEMBER_TABS = [
  { href: "/miembros", label: "Inicio" },
  { href: "/miembros/meditaciones", label: "Meditaciones" },
  { href: "/miembros/respiraciones", label: "Respiraciones conscientes" },
  { href: "/miembros/sonidos", label: "Sonidos" },
  { href: "/miembros/sesiones", label: "Sesiones 1 a 1" },
] as const;

export function MemberTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className={styles.tabs}>
      <ul>
        {MEMBER_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link href={tab.href} aria-current={active ? "page" : undefined} className={styles.tab}>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
