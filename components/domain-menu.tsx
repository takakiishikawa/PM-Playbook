"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ChevronDownIcon from "@atlaskit/icon/core/chevron-down";
import ArrowRightIcon from "@atlaskit/icon/core/arrow-right";
import { announceOverlayOpen, trapTab, useCloseOnOtherOverlay, useEscape } from "@/lib/overlay";
import { Icon } from "./icon";
import { DomainIcon } from "./domain-icon";

export type MenuDomain = {
  no: number;
  slug: string;
  name: string;
  count: number;
  groups: { name: string; notes: { id: string; title: string }[] }[];
};

/** ヘッダーの「領域」メニュー。左に領域、右に選んだ領域のノート。今読んでいるノートに印を付ける */
export function DomainMenu({ domains, currentDomain, currentNote }: { domains: MenuDomain[]; currentDomain?: string; currentNote?: string }) {
  // 今いる領域があればそれを、なければ先頭の領域を選んでおく
  const initial = currentDomain ?? domains[0].slug;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(initial);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEscape(open, closeAndRefocus);
  useCloseOnOtherOverlay("menu", open, close);
  useEffect(() => setOpen(false), [pathname]);

  const toggle = () => {
    if (open) return setOpen(false);
    setActive(initial);
    setOpen(true);
    announceOverlayOpen("menu");
  };

  const d = domains.find((x) => x.slug === active) ?? domains[0];
  return (
    <>
      <button ref={buttonRef} type="button" className="menu-btn h-ghost" aria-haspopup="true" aria-expanded={open} aria-controls="domain-menu" onClick={toggle}>
        領域
        <Icon glyph={ChevronDownIcon} />
      </button>
      {open ? (
        <>
          <div className="blanket light" onClick={close} aria-hidden="true" />
          <div ref={panelRef} id="domain-menu" className="domain-menu popup" aria-label="領域" onKeyDown={(e) => trapTab(e, panelRef.current)}>
            <div className="list">
              <div className="section-label menu-label">領域</div>
              {domains.map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  className={x.slug === active ? "active h-sel" : "h-row"}
                  aria-pressed={x.slug === active}
                  onMouseEnter={() => setActive(x.slug)}
                  onFocus={() => setActive(x.slug)}
                  onClick={() => setActive(x.slug)}
                >
                  <DomainIcon slug={x.slug} color={x.slug === active ? "var(--color-text)" : undefined} />
                  <span className="name">{x.name}</span>
                  <span className="count">{x.count}</span>
                </button>
              ))}
            </div>
            <div className="panel">
              <div className="panel-head">
                <Link href={`/d/${d.slug}`} onClick={close} className="panel-open h-ghost" title="領域ページへ">
                  {d.name}
                  <Icon glyph={ArrowRightIcon} color="var(--color-text-subtle)" />
                </Link>
              </div>
              <div className="groups">
                {d.groups.map((g) => (
                  <section key={g.name}>
                    <h3 className="section-label">
                      {g.name}
                    </h3>
                    {g.notes.map((n) => (
                      <Link key={n.id} href={`/n/${n.id}`} onClick={close} className={n.id === currentNote ? "current h-ghost" : "h-ghost"} aria-current={n.id === currentNote ? "page" : undefined}>
                        {n.title}
                      </Link>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
