"use client";

import Link from "next/link";
import PageIcon from "@atlaskit/icon/core/page";
import FileIcon from "@atlaskit/icon/core/file";
import type { SearchResult, Snippet } from "@/lib/search";
import { Icon, type Glyph } from "./icon";

/** 検索結果の1行（ノートとテンプレートを同じ形にそろえる） */
export type ResultRow = { key: string; href: string; glyph: Glyph; title: string; path: string; snippet: Snippet | null };

export function rowId(i: number): string {
  return `search-row-${i}`;
}

/** ノート → テンプレートの順に並べる。ノートには検索語を渡し、開いた先で一致箇所に印を付ける */
export function toRows(result: SearchResult, term: string): ResultRow[] {
  return [
    ...result.notes.map((n) => ({ key: `n:${n.id}`, href: `/n/${n.id}?q=${encodeURIComponent(term)}`, glyph: PageIcon, title: n.title, path: n.path, snippet: n.snippet })),
    ...result.templates.map((t) => ({ key: `t:${t.id}`, href: `/templates#${t.id}`, glyph: FileIcon, title: t.name, path: "テンプレート", snippet: t.snippet })),
  ];
}

export function SearchResultList({
  rows,
  noteCount,
  selected,
  onHover,
  onPick,
  listRef,
}: {
  rows: ResultRow[];
  noteCount: number;
  selected: number;
  onHover: (i: number) => void;
  onPick: () => void;
  listRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className="results" ref={listRef} id="search-results" role="listbox" aria-label="検索結果">
      {rows.map((r, i) => (
        <div key={r.key} className="group">
          {i === 0 && noteCount > 0 ? <div className="label" role="presentation">ノート</div> : null}
          {i === noteCount ? <div className="label" role="presentation">テンプレート</div> : null}
          <Link
            id={rowId(i)}
            href={r.href}
            role="option"
            aria-selected={selected === i}
            tabIndex={-1}
            className={`result ${selected === i ? "selected h-sel" : "h-row"}`}
            onMouseMove={() => onHover(i)}
            onClick={onPick}
          >
            <span className="result-icon">
              <Icon glyph={r.glyph} color="var(--color-text-subtle)" />
            </span>
            <span className="result-body">
              <span className="result-head">
                <span className="title">{r.title}</span>
                <span className="path">{r.path}</span>
              </span>
              {r.snippet ? <SnippetText s={r.snippet} /> : null}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

/** 0件のとき。関係の近いノートがあれば控えめに出す */
export function SearchEmpty({ term, related, onPick }: { term: string; related: SearchResult["related"]; onPick: () => void }) {
  return (
    <div className="search-empty">
      <span className="t">「{term}」を含むノートはありません</span>
      <span className="d">言葉を変えて探してみてください。</span>
      {related.length > 0 ? (
        <div className="related">
          <span className="l">近いノート</span>
          {related.map((r) => (
            <Link key={r.id} href={`/n/${r.id}`} onClick={onPick}>
              {r.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SearchError() {
  return (
    <div className="search-empty">
      <span className="t">検索できませんでした</span>
      <span className="d">ページを読み込み直してから、もう一度試してください。</span>
    </div>
  );
}

function SnippetText({ s }: { s: Snippet }) {
  return (
    <span className="snippet">
      {s.before}
      <mark className="hit">{s.hit}</mark>
      {s.after}
    </span>
  );
}
