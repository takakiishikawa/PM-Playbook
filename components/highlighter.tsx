"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { splitTerms } from "@/lib/text";

const SCROLLED_KEY = "pmpHighlightScrolled";

/**
 * 検索から開いたとき、一致した語に印を付け、最初の一致を含む見出しまでスクロールする。
 * 「戻る」で再訪したときはスクロール位置の復元を優先し、印だけ付ける。
 */
export function Highlighter({ targetId }: { targetId: string }) {
  const params = useSearchParams();
  const q = params.get("q")?.trim() ?? "";

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    unmark(root);
    const terms = splitTerms(q);
    if (terms.length === 0) return;
    const first = mark(root, terms);
    if (!first) return;

    const state = (window.history.state ?? {}) as Record<string, unknown>;
    if (state[SCROLLED_KEY] === q) return;
    (findSectionHeading(first) ?? first).scrollIntoView({ block: "start" });
    window.history.replaceState({ ...state, [SCROLLED_KEY]: q }, "");
  }, [q, targetId]);

  return null;
}

function unmark(root: HTMLElement) {
  root.querySelectorAll("mark.hit").forEach((m) => m.replaceWith(document.createTextNode(m.textContent ?? "")));
  root.normalize();
}

/** テキストノードの中の一致箇所を <mark class="hit"> で囲み、最初の印を返す */
function mark(root: HTMLElement, terms: string[]): HTMLElement | null {
  const needles = terms.map((t) => t.toLowerCase());
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const v = node.nodeValue?.toLowerCase() ?? "";
    if (needles.some((n) => v.includes(n))) nodes.push(node);
  }
  let first: HTMLElement | null = null;
  for (const node of nodes) {
    const text = node.nodeValue ?? "";
    const lower = text.toLowerCase();
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < text.length) {
      let best = -1;
      let len = 0;
      for (const n of needles) {
        const idx = lower.indexOf(n, i);
        if (idx !== -1 && (best === -1 || idx < best)) {
          best = idx;
          len = n.length;
        }
      }
      if (best === -1) break;
      frag.append(text.slice(i, best));
      const m = document.createElement("mark");
      m.className = "hit";
      m.textContent = text.slice(best, best + len);
      frag.append(m);
      first ??= m;
      i = best + len;
    }
    frag.append(text.slice(i));
    node.replaceWith(frag);
  }
  return first;
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
