"use client";

import { useEffect } from "react";

export type Visit = { id: string; title: string; path: string };
const KEY = "pmp:recent";
const MAX = 5;

/** このブラウザだけに残す閲覧履歴。読めない環境では何もしない */
export function readRecent(): Visit[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? (v as Visit[]).filter((x) => x && typeof x.id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** ノートを開いたことを記録する（表示はしない） */
export function RecordVisit(visit: Visit) {
  const { id, title, path } = visit;
  useEffect(() => {
    try {
      const list = [{ id, title, path }, ...readRecent().filter((x) => x.id !== id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // 保存できなくても困らない
    }
  }, [id, title, path]);
  return null;
}
