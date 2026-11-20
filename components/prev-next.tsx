"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ArrowLeftIcon from "@atlaskit/icon/core/arrow-left";
import ArrowRightIcon from "@atlaskit/icon/core/arrow-right";
import { Icon } from "./icon";

type Item = { id: string; title: string } | undefined;

/** ノート末尾の前後ナビ。[ と ] キーでも移動できる */
export function PrevNext({ prev, next }: { prev: Item; next: Item }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))) return;
      if (e.key === "[" && prev) router.push(`/n/${prev.id}`);
      if (e.key === "]" && next) router.push(`/n/${next.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  if (!prev && !next) return null;
  return (
    <nav className="prevnext" aria-label="前後のノート">
      {prev ? (
        <Link href={`/n/${prev.id}`} className="h-row">
          <span className="dir"><Icon glyph={ArrowLeftIcon} />前のノート<span className="kbd-sm">[</span></span>
          <span className="t">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/n/${next.id}`} className="h-row next">
          <span className="dir"><span className="kbd-sm">]</span>次のノート<Icon glyph={ArrowRightIcon} /></span>
          <span className="t">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
