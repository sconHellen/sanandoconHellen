"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import buttons from "@/components/Button.module.css";
import { LockIcon, PlayIcon } from "@/components/icons";
import { BREATHINGS } from "@/content/breathing";
import { MEDITATION_GROUPS, type CatalogItem } from "@/content/catalog";
import { breathingState, meditationState, type ItemState } from "@/lib/catalog-access";
import { GIFT_EVENT, OPEN_ITEM_EVENT, type CatalogKind, type OpenItemDetail } from "@/lib/landing-events";
import type { ViewerAccess } from "@/lib/media/breathing-assets";
import styles from "./Catalog.module.css";

// The player (engine, canvas, Web Audio) is only downloaded when a breathing is opened.
const BreathingPlayer = dynamic(() => import("@/components/breathing/BreathingPlayer").then((m) => m.BreathingPlayer), {
  ssr: false,
  loading: () => <p className={styles.loading}>Preparando tu espacio…</p>,
});

export const BREATHING_GROUP_TITLE = "Espacio para respirar";

function Badge({ state }: { state: ItemState }) {
  if (state === "available")
    return (
      <span className={styles.available}>
        <PlayIcon size={11} /> Disponible
      </span>
    );
  if (state === "soon") return <span className={styles.soon}>Próximamente</span>;
  if (state === "locked-gift")
    return (
      <span className={styles.giftTag}>
        <LockIcon size={14} /> Con tu regalo
      </span>
    );
  return (
    <span className={styles.lock} role="img" aria-label="Bloqueada">
      <LockIcon />
    </span>
  );
}

interface Opened {
  kind: CatalogKind;
  id: string;
}

/**
 * "Las meditaciones": the six meditation groups plus the 22 breathings as one more group.
 * Every item opens in a dialog. Locked items still open, to show what they are and how to get them.
 */
export function Catalog({ initialAccess }: { initialAccess: ViewerAccess }) {
  const [access, setAccess] = useState(initialAccess);
  const [opened, setOpened] = useState<Opened | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpened(null);
  }, []);

  useEffect(() => {
    if (opened && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [opened]);

  useEffect(() => {
    const onGift = () => setAccess((a) => ({ ...a, gift: true }));
    const onOpen = (e: Event) => setOpened((e as CustomEvent<OpenItemDetail>).detail);
    window.addEventListener(GIFT_EVENT, onGift);
    window.addEventListener(OPEN_ITEM_EVENT, onOpen);
    return () => {
      window.removeEventListener(GIFT_EVENT, onGift);
      window.removeEventListener(OPEN_ITEM_EVENT, onOpen);
    };
  }, []);

  const row = (kind: CatalogKind, id: string, title: string, state: ItemState, sub?: string) => (
    <li key={id}>
      {state === "soon" ? (
        <span className={styles.item}>
          <span className={styles.itemText}>
            <span>{title}</span>
            {sub ? <span className={styles.sub}>{sub}</span> : null}
          </span>
          <Badge state={state} />
        </span>
      ) : (
        <button
          type="button"
          className={`${styles.item} ${state === "available" ? styles.itemOpen : ""}`}
          onClick={() => setOpened({ kind, id })}
          aria-haspopup="dialog"
        >
          <span className={styles.itemText}>
            <span>{title}</span>
            {sub ? <span className={styles.sub}>{sub}</span> : null}
          </span>
          <Badge state={state} />
        </button>
      )}
    </li>
  );

  const meditation = opened?.kind === "meditation" ? findMeditation(opened.id) : null;

  return (
    <>
      <div className={styles.groups}>
        {MEDITATION_GROUPS.map((group) => (
          <article key={group.slug} className={styles.group}>
            <h3>{group.title}</h3>
            <ul>{group.items.map((it) => row("meditation", it.slug, it.title, meditationState(it.availability, access)))}</ul>
          </article>
        ))}
        <article className={`${styles.group} ${styles.breathingGroup}`}>
          <h3>{BREATHING_GROUP_TITLE}</h3>
          <p className={styles.groupLead}>
            {BREATHINGS.length} respiraciones guiadas de 3, 5 o 10 minutos, con un círculo que respira contigo y mi voz
            guiándote.
          </p>
          <ul className={styles.breathingList}>
            {BREATHINGS.map((b) => row("breathing", b.id, b.n, breathingState(b.id, access), b.p))}
          </ul>
        </article>
      </div>

      <dialog
        ref={dialogRef}
        className={opened?.kind === "breathing" ? styles.dialogRitual : styles.dialog}
        aria-labelledby="dialog-title"
        onClose={() => setOpened(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close(); // click on the backdrop
        }}
      >
        {opened ? (
          <div className={styles.dialogBody}>
            <button type="button" className={styles.close} onClick={close} aria-label="Cerrar">
              ×
            </button>
            {opened.kind === "breathing" ? (
              <BreathingPlayer key={opened.id} breathingId={opened.id} initialAccess={access} onLeave={close} />
            ) : meditation ? (
              <MeditationPanel item={meditation.item} group={meditation.group} state={meditationState(meditation.item.availability, access)} onLeave={close} />
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function findMeditation(slug: string): { item: CatalogItem; group: string } | null {
  for (const g of MEDITATION_GROUPS) {
    const item = g.items.find((i) => i.slug === slug);
    if (item) return { item, group: g.title };
  }
  return null;
}

function MeditationPanel({ item, group, state, onLeave }: { item: CatalogItem; group: string; state: ItemState; onLeave: () => void }) {
  return (
    <div className={styles.meditation}>
      <span className="eyebrow">{group}</span>
      <h2 id="dialog-title">{item.title}</h2>
      <div className={styles.videoFrame} aria-hidden="true">
        {state === "available" ? <PlayIcon size={40} /> : <LockIcon size={36} />}
      </div>
      {state === "available" ? (
        <p className="lead">Esta meditación ya es tuya. El video llega muy pronto. [PENDIENTE: video]</p>
      ) : state === "locked-gift" ? (
        <>
          <p className="lead">Esta meditación es parte de tu regalo gratis: déjame tu correo y se abre.</p>
          <a className={buttons.primary} href="#regalo" onClick={onLeave}>
            Recibir mi regalo gratis
          </a>
        </>
      ) : (
        <>
          <p className="lead">Se abre con cualquiera de los planes.</p>
          <a className={buttons.primary} href="#planes" onClick={onLeave}>
            Ver los planes
          </a>
        </>
      )}
    </div>
  );
}
