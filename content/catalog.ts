/**
 * Initial catalogue, taken verbatim from the landing design (brief §10: no invented content).
 * Used by the landing now and as the seed for the `meditations` table later.
 */
export type Availability = "free" | "locked" | "soon";

export interface CatalogItem {
  slug: string;
  title: string;
  availability: Availability;
}

export interface CatalogGroup {
  slug: string;
  title: string;
  items: CatalogItem[];
}

const item = (slug: string, title: string, availability: Availability = "locked"): CatalogItem => ({ slug, title, availability });

export const MEDITATION_GROUPS: CatalogGroup[] = [
  {
    slug: "sanar-heridas",
    title: "Sanar heridas",
    items: [
      item("sanando-a-mama", "Sanando a mamá"),
      item("sanando-a-papa", "Sanando a papá"),
      item("herida-de-traicion", "Herida de traición"),
      item("el-perdon", "El perdón"),
      item("herida-de-abandono", "Sanando la herida de abandono", "soon"),
    ],
  },
  {
    slug: "proposito-y-nueva-vida",
    title: "Propósito y nueva vida",
    items: [
      item("encontrando-tu-proposito", "Encontrando tu propósito"),
      item("quien-elijo-ser-hoy", "Quién elijo ser hoy"),
      item("migrar-empezar-desde-cero", "Migrar: empezar desde cero"),
      item("el-trabajo-de-tus-suenos", "El trabajo de tus sueños"),
      item("la-vida-de-tus-suenos", "La vida de tus sueños"),
      item("el-cuerpo-de-tus-suenos", "El cuerpo de tus sueños"),
      item("un-salto-cuantico", "Un salto cuántico"),
    ],
  },
  { slug: "amor", title: "Amor", items: [item("la-pareja-de-tus-suenos", "La pareja de tus sueños", "soon")] },
  {
    slug: "mananas-cortas",
    title: "Mañanas cortas",
    items: [
      item("gratitud-antes-de-abrir-los-ojos", "Gratitud antes de abrir los ojos", "free"),
      item("inicia-tu-dia-con-alegria", "Inicia tu día con alegría"),
    ],
  },
  {
    slug: "calma-y-estres",
    title: "Calma y estrés",
    items: [item("calmar-la-ansiedad", "Calmar la ansiedad"), item("volver-al-cuerpo", "Volver al cuerpo")],
  },
  { slug: "dormir", title: "Dormir", items: [item("soltar-el-dia-y-dormir", "Soltar el día y dormir")] },
];

// Breathing techniques live in content/breathing.ts (player data, single source of truth).
