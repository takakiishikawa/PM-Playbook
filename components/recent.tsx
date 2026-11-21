"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageIcon from "@atlaskit/icon/core/page";
import { Icon } from "./icon";

type Visit = { id: string; title: string; path: string };
const KEY = "pmp:recent";
const MAX = 5;

/** このブラウザだけに残す閲覧履歴。読めない環境では何もしない */
function read(): Visit[] {
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
      const list = [{ id, title, path }, ...read().filter((x) => x.id !== id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // 保存できなくても困らない
    }
  }, [id, title, path]);
  return null;
}

/** ホームに出す「最近開いたノート」。履歴がなければ何も出さない */
export function RecentNotes() {
  const [list, setList] = useState<Visit[]>([]);
  useEffect(() => setList(read()), []);
  if (list.length === 0) return null;
  return (
    <section className="stack-8">
      <div className="section-head">
        <h2>最近開いたノート</h2>
      </div>
      <div className="list-box">
        {list.map((v) => (
          <Link key={v.id} href={`/n/${v.id}`} className="recent-row h-row">
            <Icon glyph={PageIcon} color="var(--color-text-subtlest)" />
            <span className="t">{v.title}</span>
            <span className="path">{v.path}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
