import type { Metadata } from "next";

export const metadata: Metadata = { title: "Respiraciones conscientes" };

export default function Page() {
  return (
    <section className="page-intro">
      <span className="eyebrow">Respiraciones conscientes</span>
      <h1>Tu respiración es tu ancla</h1>
      <p className="lead">Sigue el círculo: cuando crece, inhala; cuando se queda quieto, sostén; cuando se encoge, exhala despacio. Unos minutos bastan para volver al presente.</p>
      <p>[PENDIENTE Fase 5: contenido de «Respiraciones conscientes»]</p>
    </section>
  );
}
