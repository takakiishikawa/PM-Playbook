// 検索の本体。サーバーで作った索引（/api/search-index）をブラウザで受け取り、入力のたびに手元で照合する。
// Node の API を使わない（クライアントから読み込む）。
import { normalize, splitTerms } from "./text";

export type Snippet = { before: string; hit: string; after: string };
export type NoteHit = { id: string; title: string; path: string; snippet: Snippet | null };
export type TemplateHit = { id: string; name: string; snippet: Snippet | null };
export type SearchResult = { notes: NoteHit[]; templates: TemplateHit[]; related: { id: string; title: string }[] };

/** サーバーから送る索引。照合用の小文字化はブラウザ側で行い、送る量を減らす */
export type SearchIndexData = {
  notes: { id: string; title: string; desc: string; domain: string; path: string; body: string }[];
  templates: { id: string; name: string; desc: string }[];
};

type NoteEntry = SearchIndexData["notes"][number] & { nTitle: string; nDesc: string; nBody: string };
type TemplateEntry = SearchIndexData["templates"][number] & { nText: string; nDesc: string };
export type SearchIndex = { notes: NoteEntry[]; templates: TemplateEntry[] };

export const EMPTY_RESULT: SearchResult = { notes: [], templates: [], related: [] };
/** 受け付ける検索語の長さの上限 */
export const MAX_QUERY_LENGTH = 100;
/** スニペットで一致箇所の前後に出す文字数 */
const SNIPPET_WIDTH = 36;
/** 「近いノート」に出す最低の類似度（検索語の2文字の組のうち一致した割合）と件数 */
const RELATED_MIN_SCORE = 0.5;
const RELATED_MAX = 3;

export function prepareIndex(data: SearchIndexData): SearchIndex {
  return {
    notes: data.notes.map((n) => ({ ...n, nTitle: normalize(n.title), nDesc: normalize(n.desc), nBody: n.body.toLowerCase() })),
    templates: data.templates.map((t) => ({ ...t, nText: normalize(`${t.name} ${t.desc}`), nDesc: normalize(t.desc) })),
  };
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
function related(q: string, entries: NoteEntry[]) {
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
 * 並びは、タイトルに語を含むノートを先に、残りは領域の順（構成の並び順）。
 */
export function search(index: SearchIndex, rawQ: string, domain?: string): SearchResult {
  const q = rawQ.slice(0, MAX_QUERY_LENGTH);
  const terms = splitTerms(q).map((t) => t.toLowerCase());
  if (terms.length === 0) return EMPTY_RESULT;
  const entries = index.notes.filter((e) => !domain || e.domain === domain);

  const titleHits: NoteHit[] = [];
  const otherHits: NoteHit[] = [];
  for (const e of entries) {
    const all = `${e.nTitle}\n${e.nBody}`;
    if (!terms.every((t) => all.includes(t))) continue;
    const hit = { id: e.id, title: e.title, path: e.path, snippet: snippetOf(e.body, e.nBody, terms) };
    // 索引は構成の並び順なので、振り分けるだけで領域の昇順になる
    (terms.some((t) => e.nTitle.includes(t)) ? titleHits : otherHits).push(hit);
  }

  const templates: TemplateHit[] = domain
    ? []
    : index.templates
        .filter((t) => terms.every((term) => t.nText.includes(term)))
        .map((t) => ({ id: t.id, name: t.name, snippet: snippetOf(t.desc.normalize("NFKC"), t.nDesc, terms) }));

  const notes = [...titleHits, ...otherHits];
  return { notes, templates, related: notes.length + templates.length === 0 ? related(q, entries) : [] };
}
