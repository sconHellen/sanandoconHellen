import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_VERSIONS } from "@/lib/legal/versions";
import styles from "./page.module.css";

const DOCS = {
  terminos: { title: "Términos y condiciones", version: LEGAL_VERSIONS.terms },
  privacidad: { title: "Política de privacidad", version: LEGAL_VERSIONS.privacy },
  cookies: { title: "Política de cookies", version: LEGAL_VERSIONS.cookies },
} as const;

type DocKey = keyof typeof DOCS;
const isDoc = (v: string): v is DocKey => v in DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  if (!isDoc(doc)) return {};
  // Placeholder legal texts must not be indexed until the final versions are published.
  return { title: DOCS[doc].title, alternates: { canonical: `/legal/${doc}` }, robots: { index: false } };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const { title, version } = DOCS[doc];
  return (
    <article className={`container ${styles.doc}`}>
      <span className="eyebrow">Versión {version}</span>
      <h1>{title}</h1>
      <p className={styles.pending}>
        [PENDIENTE: texto legal definitivo. Responsable del tratamiento con sede en Malta; aplica el Reglamento General de
        Protección de Datos (RGPD).]
      </p>
    </article>
  );
}
