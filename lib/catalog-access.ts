/**
 * What a visitor can open in the catalogue (pure, unit-tested).
 *  - nothing:            everything locked
 *  - gift (email left):  only the gift items (square breathing + "Gratitud antes de abrir los ojos")
 *  - plan:               everything (Phase 4 adds real subscriber sessions)
 * "soon" items are never openable.
 */
import { FREE_BREATHING_ID } from "../content/breathing.ts";
import type { Availability } from "../content/catalog.ts";
import type { ViewerAccess } from "./media/breathing-assets.ts";

export type ItemState = "available" | "locked-gift" | "locked-plan" | "soon";

export function meditationState(availability: Availability, access: ViewerAccess): ItemState {
  if (availability === "soon") return "soon";
  if (access.breathing) return "available";
  if (availability === "free") return access.gift ? "available" : "locked-gift";
  return "locked-plan";
}

export function breathingState(id: string, access: ViewerAccess): ItemState {
  if (access.breathing) return "available";
  if (id === FREE_BREATHING_ID) return access.gift ? "available" : "locked-gift";
  return "locked-plan";
}
