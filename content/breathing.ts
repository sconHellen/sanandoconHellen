/**
 * "Espacio para respirar" — data ported 1:1 from Hellen's reference player
 * (design/respiraciones/index.html). Do not edit timings by hand: they match the audio files.
 */

export type PhaseKind = "in" | "hold" | "out" | "pause" | "pump";

export interface Phase {
  k: PhaseKind;
  /** Duration in seconds. */
  d: number;
  /** Key of the spoken cue in WORDS, or null for none. */
  cue: string | null;
  /** On-screen label. */
  lab: string;
  /** Target circle size (in/out/pump). */
  to?: number;
  /** Don't show the per-second count. */
  nonum?: 1;
  /** Text above the label (e.g. nostril side). */
  side?: string;
  /** Visual hum rings. */
  hum?: 1;
  /** Count exhalations 1..10 instead of seconds. */
  countBreath?: 1;
  /** Five-finger technique counter. */
  finger?: 1;
}

export interface Breathing {
  id: string;
  /** Name shown everywhere (new names confirmed 2026-11-20). */
  n: string;
  /** Rhythm summary. */
  r: string;
  /** Hue hint from the reference (kept for completeness). */
  h: number;
  /** Purpose. */
  p: string;
  /** Index into the intros (one file per intro after the lossless cut). */
  intro: number;
  how: string;
  /** "Dato curioso". */
  f: string;
  warn?: string;
  ph: Phase[];
}

const I = (d: number, cue: string | null = "inhala", lab = "Inhala", to = 1, x: Partial<Phase> = {}): Phase => ({ k: "in", d, cue, lab, to, ...x });
const H = (d: number, cue: string | null = "sosten", lab = "Sostén", x: Partial<Phase> = {}): Phase => ({ k: "hold", d, cue, lab, ...x });
const O = (d: number, cue: string | null = "exhala", lab = "Exhala", to = 0.3, x: Partial<Phase> = {}): Phase => ({ k: "out", d, cue, lab, to, ...x });
const Pz = (d: number, cue: string | null = "pausa", lab = "Pausa", x: Partial<Phase> = {}): Phase => ({ k: "pause", d, cue, lab, ...x });

/** Spoken-word clips inside palabras-v3.mp3 (seconds). */
export const WORDS: Record<string, [number, number]> = {
  inhala: [0.0, 1.03], sosten: [3.06, 4.32], exhala: [5.73, 7.12], pausa: [8.47, 9.32], tomaaire: [11.12, 12.33],
  suelta: [14.23, 15.34], sueltalento: [16.56, 18.65], sueltadespacio: [20.09, 22.51], sopla: [24.35, 25.32],
  zumbido: [26.71, 27.92], suspira: [29.52, 30.77], vientre: [32.39, 33.48], costillas: [35.18, 36.5],
  pecho: [38.02, 38.81], inhizq: [40.58, 42.5], exhder: [44.28, 46.32], inhder: [48.1, 50.06], exhizq: [51.78, 53.98],
  n1: [55.65, 56.36], n2: [58.06, 59.19], n3: [60.72, 61.69], n4: [63.25, 64.23], n5: [65.93, 67.1], n6: [68.81, 70.07],
  n7: [71.62, 72.76], n8: [74.45, 75.39], muybien: [77.1, 78.27], unavez: [80.0, 81.45], ultima: [83.09, 84.07],
  unpoco: [85.81, 87.21], n9: [88.86, 89.91], n10: [91.6, 92.59], ruge: [116.0, 117.54], inhsuave: [96.8, 98.2],
  sube: [99.94, 100.96], baja: [102.65, 103.68], porboca: [105.33, 106.57], pornariz: [108.25, 109.61],
  soplafuerte: [111.12, 112.66],
};

/** Intro spans inside the ORIGINAL intros-v5.mp3 (used by the lossless cutter). */
export const INTRO_SOURCE: [number, number][] = [
  [1.0, 20.81], [22.81, 44.62], [46.62, 67.31], [69.31, 90.43], [92.43, 112.09], [114.09, 137.14], [139.14, 157.97],
  [159.97, 183.84], [185.84, 203.36], [205.36, 229.29], [231.29, 255.66], [257.66, 280.7], [282.7, 301.41],
  [303.41, 324.27], [326.27, 344.4], [346.4, 368.0], [370.0, 392.13], [394.13, 416.72], [418.72, 440.56],
  [442.56, 463.42], [465.42, 484.14], [486.14, 506.62],
];
/** Closing words span inside the ORIGINAL intros-v5.mp3. */
export const CLOSE_SOURCE: [number, number] = [508.62, 518.41];

export const NUM = ["", "n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10"];

export const BREATHINGS: Breathing[] = [
  { id: "cuadrada", n: "Respiración cuadrada", r: "4 · 4 · 4 · 4", h: 205, p: "Orden y calma bajo presión", intro: 0,
    how: "Inhala en cuatro, sostén cuatro, exhala en cuatro y quédate sin aire otros cuatro, como los cuatro lados de un cuadrado.",
    f: "Los Navy SEALs y muchos cuerpos de policía la usan para mantener la calma en situaciones de mucho estrés; por eso también se le llama «respiración táctica».",
    ph: [I(4), H(4), O(4), Pz(4)] },
  { id: "478", n: "Respiración 4 · 7 · 8", r: "4 · 7 · 8", h: 255, p: "Para dormir y apagar la mente", intro: 1,
    how: "Inhala por la nariz en cuatro, sostén siete y suelta despacio por la boca en ocho. Si sostener siete es mucho, hazlo más corto.",
    f: "La popularizó el médico estadounidense Andrew Weil, inspirado en el pranayama, el arte de la respiración del yoga.",
    ph: [I(4), H(7), O(8)] },
  { id: "vacio", n: "Espacio vacío", r: "4 · 6 · 4", h: 280, p: "Introspección", intro: 2,
    how: "Inhala en cuatro, exhala en seis y, antes de volver a respirar, quédate cuatro tiempos en calma, sin aire.",
    f: "La pausa con los pulmones vacíos es uno de los momentos de mayor quietud del cuerpo: no hay movimiento de aire ni esfuerzo muscular.",
    ph: [I(4), O(6), Pz(4)] },
  { id: "vela", n: "La vela", r: "3 · 5", h: 30, p: "Para el estrés del momento", intro: 3,
    how: "Toma aire por la nariz en tres tiempos y suéltalo por la boca en cinco, con los labios casi juntos, como si soplaras una vela sin apagarla.",
    f: "Es la «respiración con labios fruncidos» que se enseña en rehabilitación pulmonar para respirar con menos esfuerzo.",
    ph: [I(3, "tomaaire", "Toma aire"), O(5, "sopla", "Sopla la vela")] },
  { id: "tres", n: "Tres inhalaciones", r: "1½ · 1½ · 1½ · 6 · 2", h: 15, p: "Soltar la tensión del cuerpo", intro: 4,
    how: "Toma aire por la nariz en tres partes: un poquito, un poquito más y completamente. Luego suéltalo lento por la boca.",
    f: "Es una versión extendida del suspiro natural: sin darte cuenta, tu cuerpo suspira varias veces cada hora para reabrir los pulmones.",
    ph: [I(1.5, "n1", "Un poquito", 0.55, { nonum: 1 }), I(1.5, "n2", "Un poquito más", 0.78, { nonum: 1 }), I(1.5, "n3", "Hasta llenarte", 1, { nonum: 1 }), O(6, "sueltalento", "Suelta lento"), Pz(2, null, "Descansa")] },
  { id: "zumbido", n: "Respiración del zumbido", r: "4 · 6 mmm", h: 45, p: "Calma el sistema nervioso", intro: 5,
    how: "Inhala por la nariz en cuatro y suelta el aire con la boca cerrada, haciendo un zumbido suave como el de una abeja.",
    f: "En yoga se llama Bhramari, «la abeja». Un estudio sueco encontró que tararear multiplica unas quince veces el óxido nítrico en la nariz.",
    ph: [I(4), O(6, "zumbido", "Zumbido · mmm", 0.3, { hum: 1 })] },
  { id: "suspiro", n: "Suspiro que abre el pecho", r: "4 · 6", h: 340, p: "Alegría y ligereza", intro: 6,
    how: "Toma aire profundo por la nariz abriendo el pecho y suéltalo por la boca con un suspiro largo, dejando caer los hombros.",
    f: "Suspirar es un reflejo: el cerebro lo activa solo para reabrir los pequeños sacos de aire de los pulmones que se van cerrando.",
    ph: [I(4, "tomaaire", "Toma aire"), O(6, "suspira", "Suspira")] },
  { id: "completa", n: "Respiración completa", r: "2 · 2 · 2 · 6", h: 95, p: "Energía y presencia", intro: 7,
    how: "Llena el cuerpo de aire en tres partes, de abajo hacia arriba: vientre, costillas y pecho. Después suelta el aire despacio.",
    f: "Es una de las respiraciones clásicas del yoga; se compara con llenar un vaso de agua desde el fondo hasta el borde.",
    ph: [I(2, "vientre", "Vientre", 0.5), I(2, "costillas", "Costillas", 0.75), I(2, "pecho", "Pecho", 1), O(6, "sueltadespacio", "Suelta despacio")] },
  { id: "coherente", n: "Respiración coherente", r: "5 · 5", h: 175, p: "Equilibrio del cuerpo y la mente", intro: 8,
    how: "Inhala en cinco y exhala en cinco, de forma suave y continua, como una ola que llega y se va.",
    f: "Un estudio publicado en el BMJ en 2001 encontró que rezar el rosario o repetir un mantra lleva la respiración a unas seis por minuto, el mismo ritmo de esta técnica.",
    ph: [I(5), O(5)] },
  { id: "alterna", n: "Respiración alterna", r: "4 · 6 · 4 · 6", h: 225, p: "Claridad mental", intro: 9,
    how: "Tapa la fosa derecha con el pulgar e inhala por la izquierda; tapa la izquierda y exhala por la derecha. Inhala por la derecha, cambia y exhala por la izquierda.",
    f: "Tu nariz alterna sola el lado por el que entra más aire cada pocas horas; se llama ciclo nasal.",
    ph: [I(4, "inhizq", "Inhala", 1, { side: "Izquierda" }), O(6, "exhder", "Exhala", 0.3, { side: "Derecha" }), I(4, "inhder", "Inhala", 1, { side: "Derecha" }), O(6, "exhizq", "Exhala", 0.3, { side: "Izquierda" })] },
  { id: "ciclico", n: "Suspiro cíclico", r: "3 + 2 · 6", h: 320, p: "Bajar la ansiedad rápido", intro: 10,
    how: "Inhala por la nariz, toma un poquito más de aire sin soltar y luego exhala largo y lento por la boca.",
    f: "En un estudio de Stanford (2023), cinco minutos al día de esta respiración mejoraron el ánimo más que la meditación.",
    ph: [I(3, "inhala", "Inhala", 0.75), I(2, "unpoco", "Un poco más", 1, { nonum: 1 }), O(6, "sueltalento", "Suelta lento")] },
  { id: "abdominal", n: "Respiración abdominal", r: "4 · 6", h: 120, p: "Volver al cuerpo", intro: 11,
    how: "Pon una mano en el vientre. Al inhalar, el vientre sube; al exhalar, baja. El pecho casi no se mueve.",
    f: "Los bebés respiran así de forma natural; con el estrés, muchos adultos pasan a respirar sobre todo con el pecho.",
    ph: [I(4, "inhala", "Inhala", 1, { side: "El vientre sube" }), O(6, "exhala", "Exhala", 0.3, { side: "El vientre baja" })] },
  { id: "igual", n: "Respiración igual", r: "4 · 4", h: 190, p: "Para empezar a practicar", intro: 12,
    how: "Inhala en cuatro y exhala en cuatro, por la nariz, sin pausas. La más sencilla de todas.",
    f: "En yoga se llama Sama Vritti, «movimiento igual», y suele ser la primera respiración que se enseña.",
    ph: [I(4), O(4)] },
  { id: "doble", n: "Exhalación doble", r: "4 · 8", h: 265, p: "Relajación profunda", intro: 13,
    how: "Inhala en cuatro y exhala el doble de largo, en ocho, como si dejaras salir el aire por una pajilla.",
    f: "Cuando la exhalación es más larga que la inhalación, el corazón late un poco más lento: es el freno natural del sistema nervioso.",
    ph: [I(4), O(8)] },
  { id: "triangulo", n: "Respiración triángulo", r: "3 · 3 · 3", h: 55, p: "Enfoque rápido", intro: 14,
    how: "Inhala en tres, sostén tres y exhala en tres, como los tres lados de un triángulo.",
    f: "Es la versión corta de la cuadrada, útil cuando tienes poco tiempo, por ejemplo antes de hablar en público.",
    ph: [I(3), H(3), O(3)] },
  { id: "contar", n: "Contar del 1 al 10", r: "4 · 6 × 10", h: 150, p: "Concentración", intro: 15,
    how: "Respira con calma y cuenta cada exhalación, del uno al diez. Si te distraes, vuelve a empezar desde uno.",
    f: "Es una práctica tradicional del zen para principiantes; perder la cuenta es parte del ejercicio.",
    ph: [I(4, "inhala", "Inhala", 1, { nonum: 1 }), O(6, "exhala", "Exhala", 0.3, { nonum: 1, countBreath: 1 })] },
  { id: "dedos", n: "Cinco dedos", r: "4 · 4", h: 35, p: "Para niños y momentos de ansiedad", intro: 16,
    how: "Recorre el contorno de una mano con el índice de la otra: sube por un dedo al inhalar y baja al exhalar.",
    f: "Se usa mucho en escuelas porque une el tacto, la vista y la respiración; cinco dedos son cinco respiraciones.",
    ph: [I(4, "sube", "Sube el dedo"), O(4, "baja", "Baja el dedo", 0.3, { finger: 1 })] },
  { id: "ujjayi", n: "Respiración del océano", r: "5 · 6", h: 195, p: "Concentración y calor interno", intro: 17,
    how: "Respira por la nariz cerrando un poco la garganta, como si empañaras un espejo con la boca cerrada. Suena como el mar.",
    f: "En yoga se llama Ujjayi, «la victoriosa». Su sonido suave ayuda a mantener la atención en cada respiración.",
    ph: [I(5), O(6)] },
  { id: "leon", n: "Respiración del león", r: "4 · 5 · 4", h: 10, p: "Soltar enojo y tensión de la cara", intro: 18,
    how: "Inhala por la nariz. Al exhalar, abre bien la boca, saca la lengua hacia la barbilla y suelta el aire con fuerza, con un sonido largo: jaaa.",
    f: "Viene de Simhasana, la «postura del león» del yoga; relaja la mandíbula y la cara, donde se acumula mucha tensión.",
    ph: [I(4, "tomaaire", "Toma aire"), O(5, "ruge", "Saca la lengua · jaaa"), Pz(4, null, "Descansa")] },
  { id: "sitali", n: "Respiración refrescante", r: "4 · 2 · 6", h: 185, p: "Para el calor y el enojo", intro: 19,
    how: "Inhala por la boca con la lengua enrollada como un tubo, sostén un momento y exhala por la nariz. Si no puedes enrollarla, inhala entre los dientes.",
    f: "En yoga se llama Sitali. No todas las personas pueden enrollar la lengua; por eso existe la versión entre los dientes, Sitkari.",
    ph: [I(4, "porboca", "Inhala por la boca"), H(2), O(6, "pornariz", "Exhala por la nariz")] },
  { id: "buteyko", n: "Respiración reducida", r: "3 · 4 · 4", h: 160, p: "Calma y respiración nasal", intro: 20,
    how: "Respira solo por la nariz, con inhalaciones pequeñas y suaves, y haz una pausa tranquila después de exhalar. Menos aire, más calma.",
    f: "Se inspira en el método del médico ucraniano Konstantin Buteyko, que lo desarrolló en los años cincuenta.",
    ph: [I(3, "inhsuave", "Inhala suave", 0.65), O(4, "exhala", "Exhala", 0.3), Pz(4)] },
  { id: "fuelle", n: "Respiración de fuego", r: "20 soplos · 4 · 8 · 6", h: 5, p: "Activar y despertar", intro: 21,
    how: "Haz veinte exhalaciones cortas y fuertes por la nariz, metiendo el vientre; la inhalación entra sola. Después toma aire, sostén y suelta despacio.",
    f: "En yoga se llama Kapalabhati, «cráneo brillante». Es energizante, por eso se practica de día y no antes de dormir.",
    warn: "No se recomienda en el embarazo, con presión alta, problemas del corazón o ansiedad intensa. Si te mareas, detente y respira normal.",
    ph: [
      ...Array.from({ length: 20 }, (_, i): Phase => ({ k: "pump", d: 1.2, cue: i === 0 ? "soplafuerte" : null, lab: "Sopla fuerte", to: 0.55 })),
      I(4, "tomaaire", "Toma aire"), H(8), O(6, "sueltadespacio", "Suelta despacio"), Pz(4),
    ] },
];

export interface Palette {
  /** Accent colour. */
  a: string;
  top: [number, number, number];
  bot: [number, number, number];
  /** Glow colour template with "A" as alpha placeholder. */
  gl: string;
  /** Card tint. */
  t: string;
}

export const PALETTES: Record<string, Palette> = {
  oceano: { a: "#9fd4ef", top: [8, 22, 44], bot: [32, 78, 118], gl: "rgba(150,210,240,A)", t: "#0e2a48" },
  noche: { a: "#c9b2ff", top: [16, 10, 36], bot: [58, 38, 98], gl: "rgba(200,178,255,A)", t: "#26184a" },
  salvia: { a: "#f0d6aa", top: [22, 36, 30], bot: [84, 112, 88], gl: "rgba(240,214,170,A)", t: "#1f3a2c" },
  ambar: { a: "#ffc46b", top: [30, 18, 10], bot: [112, 64, 30], gl: "rgba(255,205,140,A)", t: "#3e2410" },
  rosa: { a: "#ffb8cf", top: [34, 14, 30], bot: [118, 62, 92], gl: "rgba(255,190,214,A)", t: "#40182f" },
  aurora: { a: "#a8ecd8", top: [8, 28, 32], bot: [36, 104, 104], gl: "rgba(170,240,220,A)", t: "#0f3434" },
  fuego: { a: "#ffa878", top: [34, 10, 8], bot: [140, 56, 30], gl: "rgba(255,170,120,A)", t: "#45150c" },
};

export const PALETTE_OF: Record<string, keyof typeof PALETTES> = {
  cuadrada: "oceano", "478": "noche", vacio: "noche", vela: "ambar", tres: "salvia", zumbido: "ambar", suspiro: "rosa",
  completa: "aurora", coherente: "oceano", alterna: "aurora", ciclico: "rosa", abdominal: "salvia", igual: "oceano",
  doble: "noche", triangulo: "ambar", contar: "salvia", dedos: "rosa", ujjayi: "oceano", leon: "fuego", sitali: "aurora",
  buteyko: "salvia", fuelle: "fuego",
};

export const paletteOf = (b: Breathing): Palette => PALETTES[PALETTE_OF[b.id] ?? "oceano"]!;

export interface Song {
  id: string;
  n: string;
  /** File name inside respiraciones/fondos/. */
  file: string;
  energia?: 1;
}

export const SONGS: Song[] = [
  { id: "rio", n: "Río sereno", file: "rio-sereno.mp3" },
  { id: "seda", n: "Sueño de seda", file: "sueno-de-seda.mp3" },
  { id: "silencio", n: "Silencio que abraza", file: "silencio-que-abraza.mp3" },
  { id: "tierra", n: "Pies en la tierra", file: "pies-en-la-tierra.mp3" },
  { id: "voces", n: "Voces que acompañan", file: "voces-que-acompanan.mp3" },
  { id: "raiz", n: "Raíz tibia", file: "raiz-tibia.mp3" },
  { id: "lago", n: "Lago dorado", file: "lago-dorado.mp3" },
  { id: "muelle", n: "Muelle al atardecer", file: "muelle-al-atardecer.mp3" },
  { id: "casa", n: "Casa que se apaga", file: "casa-que-se-apaga.mp3" },
  { id: "despegue", n: "Luz de despegue", file: "luz-de-despegue.mp3", energia: 1 },
  { id: "manana", n: "Mañana que baila", file: "manana-que-baila.mp3", energia: 1 },
  { id: "tormenta", n: "Después de la tormenta", file: "despues-de-la-tormenta.mp3" },
  { id: "oro", n: "Cicatriz de oro", file: "cicatriz-de-oro.mp3" },
];

/** Activating techniques: only these list the energetic songs. */
export const ACTIVATING: Record<string, 1> = { suspiro: 1, completa: 1, fuelle: 1 };
/** Songs listed for both calming and activating techniques. */
export const BOTH: Record<string, 1> = { rio: 1 };
/** Suggested song per technique. */
export const SUGGESTED: Record<string, string> = {
  cuadrada: "rio", "478": "seda", vacio: "silencio", vela: "tierra", tres: "tierra", zumbido: "voces", suspiro: "manana",
  completa: "despegue", coherente: "rio", alterna: "lago", ciclico: "raiz", abdominal: "tierra", igual: "rio",
  doble: "casa", triangulo: "voces", contar: "muelle", dedos: "raiz", ujjayi: "lago", leon: "oro", sitali: "silencio",
  buteyko: "seda", fuelle: "manana",
};

export const cycleLength = (b: Breathing) => b.ph.reduce((s, p) => s + p.d, 0);

/** Songs offered for a technique, in the reference order. */
export function songsFor(b: Breathing): Song[] {
  const act = Boolean(ACTIVATING[b.id]);
  return SONGS.filter((s) => (act ? s.energia || BOTH[s.id] : !s.energia));
}

/** Free with the gift: the square breathing, its suggested song, the words and the closing. */
export const FREE_BREATHING_ID = "cuadrada";
export const FREE_SONG_ID = "rio";
