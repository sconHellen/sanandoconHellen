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

export interface BreathingItem extends CatalogItem {
  purpose: string;
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

const breath = (slug: string, title: string, purpose: string, free = false): BreathingItem => ({
  slug,
  title,
  purpose,
  availability: free ? "free" : "locked",
});

export const BREATHING: BreathingItem[] = [
  breath("respiracion-cuadrada", "Respiración cuadrada", "Orden y calma bajo presión", true),
  breath("respiracion-4-7-8", "Respiración 4-7-8", "Para dormir y apagar la mente"),
  breath("espacio-vacio", "Espacio vacío", "Para mirar hacia adentro"),
  breath("la-vela", "La vela", "Bajar el estrés del momento"),
  breath("tres-inhalaciones", "Tres inhalaciones", "Soltar la tensión"),
  breath("el-zumbido", "El zumbido", "Calmar el sistema nervioso"),
  breath("suspiro-que-abre-el-pecho", "Suspiro que abre el pecho", "Alegría y ligereza"),
  breath("respiracion-completa", "Respiración completa", "Energía y presencia"),
  breath("respiracion-coherente", "Respiración coherente", "Equilibrio"),
  breath("respiracion-alterna", "Respiración alterna", "Claridad mental"),
  breath("suspiro-ciclico", "Suspiro cíclico", "Bajar la ansiedad rápido"),
  breath("respiracion-abdominal", "Respiración abdominal", "Volver al cuerpo"),
  breath("respiracion-igual", "Respiración igual", "Para empezar a practicar"),
  breath("exhalacion-doble", "Exhalación doble", "Relajación profunda"),
  breath("triangulo", "Triángulo", "Enfoque rápido"),
  breath("contar-del-1-al-10", "Contar del 1 al 10", "Concentración"),
  breath("cinco-dedos", "Cinco dedos", "Para niños y momentos de ansiedad"),
  breath("respiracion-del-oceano", "Respiración del océano", "Concentración y calor interno"),
  breath("respiracion-del-leon", "Respiración del león", "Soltar el enojo y la tensión de la cara"),
  breath("respiracion-refrescante", "Respiración refrescante", "Calor, enojo y sofocos"),
  breath("buteyko", "Buteyko", "Respirar por la nariz con calma"),
  breath("el-fuelle", "El fuelle", "Activarte y despertar"),
];
