"use client";

import { useEffect, useState } from "react";
import type { SearchResult } from "./search";

export const EMPTY_RESULT: SearchResult = { notes: [], templates: [], related: [] };
const DEBOUNCE_MS = 120;

/** 入力が止まってから /api/search を呼ぶ。古いリクエストは中断する */
export function useSearch(q: string, domain: string, enabled: boolean) {
  const [result, setResult] = useState<SearchResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const term = q.trim();

  useEffect(() => {
    if (!enabled || !term) {
      setResult(EMPTY_RESULT);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term });
        if (domain) params.set("domain", domain);
        const res = await fetch(`/api/search?${params}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setResult((await res.json()) as SearchResult);
        setError(false);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        console.error("search failed", e);
        setResult(EMPTY_RESULT);
        setError(true);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [term, domain, enabled]);

  return { result, loading, error, term };
}
