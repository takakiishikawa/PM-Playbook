"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SearchIcon from "@atlaskit/icon/core/search";
import CrossCircleIcon from "@atlaskit/icon/core/cross-circle";
import { loadSearchIndex, useSearch } from "@/lib/use-search";
import { OPEN_SEARCH_EVENT } from "@/lib/search-events";
import { announceOverlayOpen, trapTab, useCloseOnOtherOverlay } from "@/lib/overlay";
import { Icon } from "./icon";
import { DomainFilter } from "./domain-filter";
import { SearchEmpty, SearchError, SearchResultList, rowId, toRows } from "./search-results";

/** ⌘K で開く検索のポップアップ。レイアウトに1つだけ置く */
export function SearchDialog({ domains }: { domains: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { result, loading, error, term } = useSearch(q, domain, open);

  const show = useCallback((initial = "") => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    if (initial) setQ(initial);
    setOpen(true);
    announceOverlayOpen("search");
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  useCloseOnOtherOverlay("search", open, close);

  // 開く前に、手が空いたときに索引を読んでおく（開いた瞬間から結果を出せるように）
  useEffect(() => {
    const warm = () => void loadSearchIndex().catch(() => {});
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 1500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<string>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.select());
  }, [open]);

  // 結果が変わったら先頭を選ぶ
  useEffect(() => setSel(0), [result]);

  const rows = useMemo(() => toRows(result, term), [result, term]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  const dismiss = () => setOpen(false);
  const go = (href: string) => {
    dismiss();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    trapTab(e, dialogRef.current);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && rows.length > 0) {
      e.preventDefault();
      setSel((s) => Math.min(rows.length - 1, s + 1));
    } else if (e.key === "ArrowUp" && rows.length > 0) {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing && e.target === inputRef.current && rows[sel]) {
      e.preventDefault();
      go(rows[sel].href);
    }
  };

  const count = rows.length;
  const settled = term !== "" && !loading;
  const noteCount = result.notes.length;

  return (
    <>
      <div className="blanket dim" onClick={close} aria-hidden="true" />
      <div ref={dialogRef} className="search-dialog popup" role="dialog" aria-modal="true" aria-label="検索" onKeyDown={onKeyDown}>
        <div className="search-head">
          <label className="field">
            <Icon glyph={SearchIcon} color="var(--color-text-subtle)" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="キーワードを入力"
              aria-label="ノートを検索"
              aria-controls="search-results"
              aria-activedescendant={count > 0 ? rowId(sel) : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            {q ? (
              <button
                type="button"
                className="clear-btn h-ghost"
                aria-label="入力を消す"
                title="入力を消す"
                onClick={() => {
                  setQ("");
                  inputRef.current?.focus();
                }}
              >
                <Icon glyph={CrossCircleIcon} />
              </button>
            ) : null}
          </label>
          <div className="search-filters">
            <DomainFilter domains={domains} value={domain} onChange={setDomain} />
            {term ? (
              <span className="search-count" aria-live="polite">
                {loading ? "検索中" : `${count}件`}
              </span>
            ) : null}
          </div>
        </div>

        {settled && error ? (
          <SearchError />
        ) : settled && count === 0 ? (
          <SearchEmpty term={term} related={result.related} onPick={dismiss} />
        ) : count > 0 ? (
          <SearchResultList rows={rows} noteCount={noteCount} selected={sel} onHover={setSel} onPick={dismiss} listRef={listRef} />
        ) : null}

        <div className="keys" aria-hidden="true">
          <span>↑↓ 移動</span>
          <span>Enter 開く</span>
          <span>Esc 閉じる</span>
        </div>
      </div>
    </>
  );
}
