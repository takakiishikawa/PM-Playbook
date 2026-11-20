"use client";

import { useEffect } from "react";

// 領域メニューと検索は同時に開かない。どちらかが開いたら、もう一方を閉じる。
const EVENT = "pmp:overlay-open";
type OverlayId = "menu" | "search";

export function announceOverlayOpen(id: OverlayId) {
  window.dispatchEvent(new CustomEvent<OverlayId>(EVENT, { detail: id }));
}

/** 別のオーバーレイが開いたら close を呼ぶ */
export function useCloseOnOtherOverlay(id: OverlayId, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const on = (e: Event) => {
      if ((e as CustomEvent<OverlayId>).detail !== id) close();
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [id, open, close]);
}

/** Esc で閉じる */
export function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, close]);
}

/** 開いている間、Tab のフォーカスを container の中に閉じ込める */
export function trapTab(e: React.KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) return;
  const els = Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'));
  if (els.length === 0) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
