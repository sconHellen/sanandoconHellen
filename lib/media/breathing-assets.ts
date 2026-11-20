/**
 * Which breathing-player audio exists and who may hear it.
 * Pure module (no I/O) so the rules are unit-tested.
 */
import { BREATHINGS, FREE_BREATHING_ID, FREE_SONG_ID, SONGS } from "../../content/breathing.ts";

export type Requirement = "gift" | "plan";

export interface BreathingAsset {
  /** Object key in storage. Originals under originales/ are never mapped here. */
  key: string;
  requires: Requirement;
}

/**
 * Maps a public asset path (after /api/media/respiraciones/) to its storage key.
 * Only whitelisted ids are accepted, so no path can reach other objects.
 */
export function resolveBreathingAsset(segments: string[]): BreathingAsset | null {
  const [kind, id, ...rest] = segments;
  if (rest.length) return null;
  if (kind === "palabras" && id === undefined) return { key: "respiraciones/palabras.mp3", requires: "gift" };
  if (kind === "cierre" && id === undefined) return { key: "respiraciones/cierre.mp3", requires: "gift" };
  if (kind === "intro" && id) {
    const b = BREATHINGS.find((x) => x.id === id);
    if (!b) return null;
    return { key: `respiraciones/intros/${b.id}.mp3`, requires: b.id === FREE_BREATHING_ID ? "gift" : "plan" };
  }
  if (kind === "fondo" && id) {
    const s = SONGS.find((x) => x.id === id);
    if (!s) return null;
    return { key: `respiraciones/fondos/${s.file}`, requires: s.id === FREE_SONG_ID ? "gift" : "plan" };
  }
  return null;
}

export interface ViewerAccess {
  /** Left their email for the free gift. */
  gift: boolean;
  /** Has an active plan that includes breathing (Phase 4: real sessions). */
  breathing: boolean;
}

export function canAccess(asset: BreathingAsset, viewer: ViewerAccess): boolean {
  if (viewer.breathing) return true;
  return asset.requires === "gift" && viewer.gift;
}

/** Whether a technique can be practised by this viewer (UI hint; the server enforces it). */
export function canPractise(breathingId: string, viewer: ViewerAccess): boolean {
  if (viewer.breathing) return true;
  return breathingId === FREE_BREATHING_ID && viewer.gift;
}
