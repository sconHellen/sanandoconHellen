/** Browser events shared by landing components (gift form ↔ catalogue ↔ player). */
export const GIFT_EVENT = "sch:gift-unlocked";
/** detail: { kind: "breathing" | "meditation"; id: string } */
export const OPEN_ITEM_EVENT = "sch:open-item";

export type CatalogKind = "breathing" | "meditation";
export interface OpenItemDetail {
  kind: CatalogKind;
  id: string;
}
