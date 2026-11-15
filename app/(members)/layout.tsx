import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { MemberTabs } from "@/components/MemberTabs";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./layout.module.css";

// The members area must never be indexed (brief §11.1). Access control arrives in Phase 4.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.top}`}>
          <Brand href="/miembros" />
          <ThemeToggle />
        </div>
        <div className="container">
          <MemberTabs />
        </div>
      </header>
      <main id="contenido" className={`container ${styles.main}`}>
        {children}
      </main>
      <SiteFooter variant="members" />
    </>
  );
}
