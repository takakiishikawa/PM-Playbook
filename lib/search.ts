import "server-only";
import { ALL_NOTES, notePath } from "@/content/structure";
import { TEMPLATES } from "@/content/templates";
import { loadNote } from "./content";
import { normalize, splitTerms } from "./text";

export type Snippet = { before: string; hit: string; after: string };
export type NoteHit = { id: string; title: string; path: string; snippet: Snippet | null };
export type TemplateHit = { id: string; name: string; snippet: Snippet | null };
export type SearchResult = { notes: NoteHit[]; templates: TemplateHit[]; related: { id: string; title: string }[] };

type Entry = {
  id: string;
  title: string;
  domain: string;
  path: string;
  /** 表示用の本文（正規化済み。スニペットはここから切り出す） */
  body: string;
  /** 照合用（すべて正規化・小文字） */
  nTitle: string;
  nDesc: string;
  nBody: string;
};

/** 受け付ける検索語の長さの上限 */
export const MAX_QUERY_LENGTH = 100;
/** スニペットで一致箇所の前後に出す文字数 */
const SNIPPET_WIDTH = 36;
/** 並び順の重み。タイトル一致 → 説明一致 → 本文だけの一致 */
const SCORE_TITLE = 100;
const SCORE_DESC = 10;
/** 「近いノート」に出す最低の類似度（検索語の2文字の組のうち一致した割合）と件数 */
const RELATED_MIN_SCORE = 0.5;
const RELATED_MAX = 3;

let index: Entry[] | null = null;

function getIndex(): Entry[] {
  if (index) return index;
  index = ALL_NOTES.map((n) => {
    const doc = loadNote(n.id);
    const body = [n.desc ?? "", doc?.meta.lede ?? "", doc?.text ?? ""].join("\n").normalize("NFKC");
    return {
      id: n.id,
      title: n.title,
      domain: n.domain.slug,
      path: notePath(n),
      body,
      nTitle: normalize(n.title),
      nDesc: normalize(n.desc ?? ""),
      nBody: body.toLowerCase(),
    };
  });
  return index;
}

/** 最初に見つかった語の前後を切り出す。照合は小文字、表示は元の文字 */
function snippetOf(text: string, lower: string, terms: string[]): Snippet | null {
  let at = -1;
  let len = 0;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (at === -1 || i < at)) {
      at = i;
      len = t.length;
    }
  }
  if (at < 0) return null;
  const start = Math.max(0, at - SNIPPET_WIDTH);
  const end = Math.min(text.length, at + len + SNIPPET_WIDTH);
  const flat = (s: string) => s.replace(/\s+/g, " ");
  return {
    before: (start > 0 ? "…" : "") + flat(text.slice(start, at)),
    hit: text.slice(at, at + len),
    after: flat(text.slice(at + len, end)) + (end < text.length ? "…" : ""),
  };
}

function bigrams(s: string): Set<string> {
  const t = normalize(s).replace(/\s+/g, "");
  const out = new Set<string>();
  if (t.length === 1) out.add(t);
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

/** 見つからないときに出す「近いノート」。関係が薄ければ何も返さない */
function related(q: string, entries: Entry[]) {
  const qb = bigrams(q);
  if (qb.size === 0) return [];
  return entries
    .map((e) => {
      const eb = bigrams(`${e.title} ${e.nDesc}`);
      let common = 0;
      qb.forEach((b) => {
        if (eb.has(b)) common++;
      });
      return { e, score: common / qb.size };
    })
    .filter((x) => x.score >= RELATED_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_MAX)
    .map(({ e }) => ({ id: e.id, title: e.title }));
}

/**
 * タイトル・説明・本文の部分一致で探す。空白で区切った語はすべて含むもの（AND）だけを返す。
 * 並びはタイトル一致 → 説明一致 → 本文一致の順。
 */
export function search(rawQ: string, domain?: string): SearchResult {
  const q = rawQ.slice(0, MAX_QUERY_LENGTH);
  const terms = splitTerms(q).map((t) => t.toLowerCase());
  if (terms.length === 0) return { notes: [], templates: [], related: [] };
  const entries = getIndex().filter((e) => !domain || e.domain === domain);

  const scored: { hit: NoteHit; score: number }[] = [];
  for (const e of entries) {
    const all = `${e.nTitle}\n${e.nBody}`;
    if (!terms.every((t) => all.includes(t))) continue;
    const inTitle = terms.some((t) => e.nTitle.includes(t));
    const inDesc = terms.some((t) => e.nDesc.includes(t));
    scored.push({
      hit: { id: e.id, title: e.title, path: e.path, snippet: snippetOf(e.body, e.nBody, terms) },
      score: (inTitle ? SCORE_TITLE : 0) + (inDesc ? SCORE_DESC : 0),
    });
  }
  scored.sort((a, b) => b.score - a.score);

  const templates: TemplateHit[] = domain
    ? []
    : TEMPLATES.filter((t) => terms.every((term) => normalize(`${t.name} ${t.desc}`).includes(term))).map((t) => ({
        id: t.id,
        name: t.name,
        snippet: snippetOf(t.desc.normalize("NFKC"), normalize(t.desc), terms),
      }));

  const notes = scored.map((s) => s.hit);
  return { notes, templates, related: notes.length + templates.length === 0 ? related(q, entries) : [] };
}
