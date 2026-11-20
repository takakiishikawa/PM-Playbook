"use client";

import { useEffect, useMemo, useState } from "react";
import { EMPTY_RESULT, prepareIndex, search, type SearchIndex, type SearchIndexData } from "./search-core";

let cached: Promise<SearchIndex> | null = null;

/** 索引を1回だけ読み込む。失敗したら次の呼び出しで読み直す */
export function loadSearchIndex(): Promise<SearchIndex> {
  cached ??= fetch("/api/search-index")
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<SearchIndexData>;
    })
    .then(prepareIndex)
    .catch((e: unknown) => {
      cached = null;
      throw e;
    });
  return cached;
}

/** 検索窓を開いたら索引を読み込み、入力のたびに手元で照合する（通信を待たない） */
export function useSearch(q: string, domain: string, enabled: boolean) {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [error, setError] = useState(false);
  const term = q.trim();

  useEffect(() => {
    if (!enabled || index) return;
    let alive = true;
    loadSearchIndex()
      .then((i) => alive && (setIndex(i), setError(false)))
      .catch((e: unknown) => {
        console.error("search index failed", e);
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [enabled, index]);

  const result = useMemo(() => (index && term ? search(index, term, domain || undefined) : EMPTY_RESULT), [index, term, domain]);
  return { result, loading: !!term && !index && !error, error: !!term && error, term };
}
