"use client";

import { useEffect, useState } from "react";
import ListBulletedIcon from "@atlaskit/icon/core/list-bulleted";
import { Icon } from "./icon";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** 見出しがこの位置（画面の上から。ヘッダー48px＋余白）を越えたら「今読んでいる」とみなす */
const ACTIVE_LINE_PX = 96;
/** デザインシステム：H2が3つ以上のページにだけ目次を出す */
const MIN_H2_FOR_TOC = 3;

/** 右の目次。今読んでいる見出しに印を付ける。狭い画面では CSS で隠す */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;
    const onScroll = () => {
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = el.id;
      }
      // ページの末尾まで来たら、最後の見出しを今いる場所とする
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = els[els.length - 1].id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.filter((i) => i.level === 2).length < MIN_H2_FOR_TOC) return null;
  return (
    <nav className="toc" aria-label="このページの目次">
      <span className="toc-title">
        <Icon glyph={ListBulletedIcon} />
        目次
      </span>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className={`${i.level === 3 ? "lv3" : ""} ${active === i.id ? "active" : "h-toc"}`}>
          {i.text}
        </a>
      ))}
    </nav>
  );
}
