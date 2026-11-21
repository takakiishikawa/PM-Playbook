import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { ALL_NOTES, type FlatNote } from "@/content/structure";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type Heading = { id: string; text: string; level: 2 | 3 };
export type NoteDoc = { meta: { title: string; lede?: string; updated?: string }; body: string; headings: Heading[]; text: string };

const cache = new Map<string, NoteDoc | null>();

export function hasNote(id: string): boolean {
  return loadNote(id) !== null;
}

export function loadNote(id: string): NoteDoc | null {
  if (cache.has(id)) return cache.get(id) ?? null;
  const file = path.join(NOTES_DIR, `${id}.mdx`);
  if (!fs.existsSync(file)) {
    cache.set(id, null);
    return null;
  }
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const doc: NoteDoc = {
    meta: { title: String(data.title ?? ""), lede: data.lede ? String(data.lede) : undefined, updated: data.updated ? String(data.updated) : undefined },
    body: content,
    headings: extractHeadings(content),
    text: toPlain(content),
  };
  cache.set(id, doc);
  return doc;
}

/** H2・H3 を目次用に取り出す。id は rehype-slug と同じ github-slugger で、表示される文字から作る */
function extractHeadings(src: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  for (const line of src.split("\n")) {
    const m = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const text = stripInline(m[2]).trim();
    // 原則はノートの先頭にあるので目次には載せない（id は本文の見出しとそろえるため slug は進める）
    const id = slugger.slug(text);
    if (text === "原則") continue;
    headings.push({ level: m[1] === "##" ? 2 : 3, text, id });
  }
  return headings;
}

/** 太字・コード・リンクの記号を外し、表示される文字だけにする */
function stripInline(s: string): string {
  return s.replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/** 検索用に MDX から記号とタグを取り除いた本文 */
function toPlain(src: string): string {
  return stripInline(src)
    .replace(/<[^>]*?(label|title|hint|caption|alt)="([^"]*)"[^>]*?>/g, " $2 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*([-*]|\d+\.)\s+/gm, "")
    .replace(/^\|?[\s:|-]+\|?$/gm, "")
    .replace(/\|/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function formatUpdated(u?: string): string | null {
  if (!u) return null;
  const m = /^(\d{4})-(\d{1,2})/.exec(u);
  return m ? `${m[1]}/${m[2].padStart(2, "0")}` : null;
}

/** 同じ領域の中での前後のノート（グループをまたいで続く） */
/** 前後のノート。領域の端では隣の領域へつなぐ */
export function neighbors(note: FlatNote): { prev?: FlatNote; next?: FlatNote } {
  const i = ALL_NOTES.findIndex((n) => n.id === note.id);
  return { prev: i > 0 ? ALL_NOTES[i - 1] : undefined, next: i >= 0 && i < ALL_NOTES.length - 1 ? ALL_NOTES[i + 1] : undefined };
}

/** 移った先がどこか。グループや領域が変わるときだけ名前を返す */
export function crossing(from: FlatNote, to: FlatNote | undefined): { kind: "domain" | "group"; name: string } | undefined {
  if (!to) return undefined;
  if (to.domain.slug !== from.domain.slug) return { kind: "domain", name: to.domain.name };
  if (to.groupIndex !== from.groupIndex) return { kind: "group", name: to.groupName };
  return undefined;
}
