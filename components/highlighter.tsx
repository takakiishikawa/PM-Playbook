"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { splitTerms } from "@/lib/text";

const SCROLLED_KEY = "pmpSearchScrolled";

/**
 * 検索から開いたとき、最初に一致した語を含む見出しまでスクロールする（語に印は付けない）。
 * 「戻る」で再訪したときはスクロール位置の復元を優先する。
 */
export function Highlighter({ targetId }: { targetId: string }) {
  const params = useSearchParams();
  const q = params.get("q")?.trim() ?? "";

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const terms = splitTerms(q).map((t) => t.toLowerCase());
    if (terms.length === 0) return;
    const first = findFirst(root, terms);
    if (!first) return;

    const state = (window.history.state ?? {}) as Record<string, unknown>;
    if (state[SCROLLED_KEY] === q) return;
    const heading = findSectionHeading(first);
    // タイトル部分で一致したときは、先頭のままにする
    if (heading) heading.scrollIntoView({ block: "start" });
    window.history.replaceState({ ...state, [SCROLLED_KEY]: q }, "");
  }, [q, targetId]);

  return null;
}

/** 本文（タイトル部分を除く）で、最初に語を含む要素 */
function findFirst(root: HTMLElement, needles: string[]): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const el = node.parentElement;
    if (!el || el.closest(".title-block")) continue;
    const v = node.nodeValue?.toLowerCase() ?? "";
    if (needles.some((n) => v.includes(n))) return el;
  }
  return null;
}

/** 一致箇所を含むセクションの見出し（なければ null）。本文の直下の要素から前へたどる */
function findSectionHeading(el: HTMLElement): HTMLElement | null {
  let node: Element | null = el;
  while (node?.parentElement && !node.parentElement.classList.contains("article")) node = node.parentElement;
  for (let cur: Element | null = node; cur; cur = cur.previousElementSibling) {
    if (cur.tagName === "H2" || cur.tagName === "H3") return cur as HTMLElement;
  }
  return null;
}
