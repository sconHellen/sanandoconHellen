import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meditaciones" };

export default function Page() {
  return (
    <section className="page-intro">
      <span className="eyebrow">Meditaciones guiadas</span>
      <h1>Encuentra la meditación que necesitas hoy</h1>
      <p className="lead">Elige según cómo te sientes o el momento del día. Cierra los ojos, respira y déjate guiar.</p>
      <p>[PENDIENTE Fase 5: contenido de «Meditaciones»]</p>
    </section>
  );
}
