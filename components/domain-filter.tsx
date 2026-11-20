"use client";

import { useEffect, useRef, useState } from "react";
import ChevronDownIcon from "@atlaskit/icon/core/chevron-down";
import CheckMarkIcon from "@atlaskit/icon/core/check-mark";
import FilterIcon from "@atlaskit/icon/core/filter";
import { Icon } from "./icon";
import { DomainIcon } from "./domain-icon";

type Option = { slug: string; name: string };

/** 検索の「領域で絞り込む」。ブラウザ標準の select の代わりに、デザインをそろえた小さなメニューを出す */
export function DomainFilter({ domains, value, onChange }: { domains: Option[]; value: string; onChange: (slug: string) => void }) {
  const options: Option[] = [{ slug: "", name: "すべての領域" }, ...domains];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.slug === value) ?? options[0];

  // 外側を押したら閉じる
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.slug === value)));
    setOpen(true);
    requestAnimationFrame(() => listRef.current?.focus());
  };
  const pick = (slug: string) => {
    onChange(slug);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // 開いている間のキー操作はここで止め、検索のポップアップ側（↑↓・Esc）に渡さない
  const onListKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(options.length - 1, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(options.length - 1),
      Enter: () => pick(options[active].slug),
      " ": () => pick(options[active].slug),
      Escape: () => {
        setOpen(false);
        buttonRef.current?.focus();
      },
      Tab: () => setOpen(false),
    };
    const run = keys[e.key];
    if (!run) return;
    if (e.key !== "Tab") e.preventDefault();
    e.stopPropagation();
    run();
  };

  return (
    <div className="dfilter" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`dfilter-btn h-btn${value ? " on" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`領域で絞り込む：${current.name}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            e.stopPropagation();
            openMenu();
          }
        }}
      >
        {value ? <DomainIcon slug={value} color="currentColor" /> : <Icon glyph={FilterIcon} />}
        <span className="dfilter-label" title={current.name}>{current.name}</span>
        <Icon glyph={ChevronDownIcon} />
      </button>
      {open ? (
        <div
          ref={listRef}
          className="dfilter-menu popup"
          role="listbox"
          tabIndex={-1}
          aria-label="領域"
          aria-activedescendant={`dfilter-${active}`}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <div
              key={o.slug || "all"}
              id={`dfilter-${i}`}
              data-i={i}
              role="option"
              aria-selected={o.slug === value}
              className={`dfilter-opt${i === active ? " active" : ""}`}
              onMouseMove={() => setActive(i)}
              onClick={() => pick(o.slug)}
            >
              <span className="dfilter-icon">{o.slug ? <DomainIcon slug={o.slug} /> : <Icon glyph={FilterIcon} color="var(--color-text-subtle)" />}</span>
              <span className="dfilter-name">{o.name}</span>
              {o.slug === value ? <Icon glyph={CheckMarkIcon} color="var(--color-link)" /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
