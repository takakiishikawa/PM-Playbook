"use client";

import SearchIcon from "@atlaskit/icon/core/search";
import { Icon } from "./icon";
import { openSearch } from "@/lib/search-events";

/** ヘッダー中央の検索欄。押すと検索のポップアップを開く */
export function SearchTrigger() {
  return (
    <button type="button" className="search-trigger h-input" onClick={() => openSearch()} aria-label="検索（⌘K）" aria-haspopup="dialog">
      <Icon glyph={SearchIcon} color="var(--color-text-subtle)" />
      <span className="search-label">検索</span>
      <span className="kbd">⌘ K</span>
    </button>
  );
}

/** ホームの大きな検索欄 */
export function HomeSearch() {
  return (
    <button type="button" className="home-search h-input" onClick={() => openSearch()} aria-label="ノートを検索（⌘K）" aria-haspopup="dialog">
      <Icon glyph={SearchIcon} color="var(--color-text-subtle)" />
      <span className="search-label">キーワードを入力（例：課題探索、ヒアリング、リスク）</span>
      <span className="kbd">⌘ K</span>
    </button>
  );
}
