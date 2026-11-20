// ノートと構成の整合をまとめて確かめる。`npm run check:content` で実行し、問題があれば終了コード1で終わる。
// 実行には Node.js 22.18 以降（.ts を直接読み込める版）が要る。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { ALL_NOTES } from "../content/structure.ts";
import { TEMPLATES } from "../content/templates.ts";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "content", "notes");
const errors: string[] = [];
const warnings: string[] = [];
const error = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);

/** components/mdx.tsx の mdxComponents に登録された部品名（大文字で始まるもの） */
function allowedComponents(): Set<string> {
  const src = fs.readFileSync(path.join(ROOT, "components", "mdx.tsx"), "utf8");
  const m = /export const mdxComponents = \{([^}]*)\}/.exec(src);
  if (!m) throw new Error("components/mdx.tsx に mdxComponents が見つからない");
  return new Set(m[1].split(",").map((s) => s.split(":")[0].trim()).filter((s) => /^[A-Z]/.test(s)));
}

const isPunct = (c: string) => c === "" || /[\p{P}\p{S}]/u.test(c);
const isSpace = (c: string) => c === "" || /\s/.test(c);

/**
 * 日本語の中の **太字** は、閉じる記号の直前が句読点で直後が文字だと太字にならない（CommonMark の規則）。
 * 例：「〜する。**次の文」→ 太字が閉じない。「〜する**。次の文」のように句点を外に出す。
 */
function brokenBold(line: string): string[] {
  const out: string[] = [];
  const idx = [...line.matchAll(/\*\*/g)].map((m) => m.index ?? 0);
  idx.forEach((i, k) => {
    const before = line[i - 1] ?? "";
    const after = line[i + 2] ?? "";
    const left = !isSpace(after) && (!isPunct(after) || isSpace(before) || isPunct(before));
    const right = !isSpace(before) && (!isPunct(before) || isSpace(after) || isPunct(after));
    if ((k % 2 === 0 && !left) || (k % 2 === 1 && !right)) out.push(line.slice(Math.max(0, i - 8), i + 10));
  });
  return out;
}

const components = allowedComponents();
const noteIds = new Set(ALL_NOTES.map((n) => n.id));
const templateIds = new Set(TEMPLATES.map((t) => t.id));
const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".mdx"));
const fileIds = new Set(files.map((f) => f.replace(/\.mdx$/, "")));

for (const id of noteIds) if (!fileIds.has(id)) warn(id, "本文ファイルがない（「準備中」と表示される）");
for (const id of fileIds) if (!noteIds.has(id)) error(`${id}.mdx`, "content/structure.ts にないノート（IDがずれていないか）");

for (const t of TEMPLATES) {
  if (!noteIds.has(t.usedIn)) error(`template ${t.id}`, `usedIn のノート ${t.usedIn} がない`);
  if (t.file && !fs.existsSync(path.join(ROOT, "content", "templates", t.file))) error(`template ${t.id}`, `ファイル ${t.file} がない`);
  if (!t.file && !t.url) error(`template ${t.id}`, "file か url のどちらかが要る");
}

for (const f of files.sort()) {
  const raw = fs.readFileSync(path.join(NOTES_DIR, f), "utf8");
  // 一括置換などで文字が壊れていないか（UTF-8 として読めない部分は U+FFFD になる）
  if (raw.includes("\uFFFD")) error(f, "UTF-8 として読めない文字がある（置換で文字が壊れた可能性）");
  const { data, content } = matter(raw);
  for (const key of ["title", "lede", "updated"]) if (!data[key]) error(f, `frontmatter に ${key} がない`);

  try {
    await compile(content, { remarkPlugins: [remarkGfm] });
  } catch (e) {
    error(f, `MDX として読めない: ${(e as Error).message.split("\n")[0]}`);
  }

  for (const m of content.matchAll(/<([A-Z]\w*)/g)) if (!components.has(m[1])) error(f, `使えない部品 <${m[1]}>`);
  for (const m of content.matchAll(/<NoteLink id="([^"]+)"/g)) if (!noteIds.has(m[1])) error(f, `リンク先のノート ${m[1]} がない`);
  for (const m of content.matchAll(/<TemplateLink id="([^"]+)"/g)) if (!templateIds.has(m[1])) error(f, `テンプレート ${m[1]} がない`);
  for (const m of content.matchAll(/<Figure src="([^"]+)"/g)) if (!fs.existsSync(path.join(ROOT, "public", m[1]))) error(f, `図 ${m[1]} がない`);

  content.split("\n").forEach((line, i) => {
    for (const s of brokenBold(line)) error(`${f}:${i + 1}`, `太字が閉じない「${s}」`);
  });

  // 表記：引用（「」）の外の「です・ます」で終わる文
  if (/(です|ます|ません)。/.test(content.replace(/「[^」]*」/g, "").replace(/^\|.*$/gm, ""))) warn(f, "「です・ます」の文がある");

  // マーカーは1セクションに1か所まで
  content.split(/^## /m).forEach((section) => {
    const n = (section.match(/<Mark>/g) ?? []).length;
    if (n > 1) warn(f, `1つのセクションにマーカーが${n}か所ある`);
  });
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
console.log(`${files.length} notes, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length > 0 ? 1 : 0);
