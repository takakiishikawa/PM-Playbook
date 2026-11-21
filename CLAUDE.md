# PM Playbook

実践知への補助線。PM Schoolの講義内容を、原則・プロセス・テンプレートとして5〜10秒で引ける形にまとめた個人用プロダクト。

## 前提
- 完全に個人用。他者への拡張は考えない。講義の内容を含むため、Supabase Auth（Google）と `ALLOWED_EMAILS` で閲覧者を限定している。図（`public/figures/`、WebP・横幅1600px以内）も proxy で守っている。図を差し替えるときはファイル名を変える（ブラウザに30日キャッシュさせているため）。
- 中身は講義の内容だけ。講義にない情報は足さない。自分のメモ・技術の細部・PMP・プロダクトマネジメント以外の分野は入れない。
- 例外は2つ（本人の了承済み）。
  - デザインの基礎（情報設計・文字と視線・色・配色）は、講義以外の資料（Obsidianの7.Design の canvas）からも入れる。
  - 「その他」領域の「自己理解」「キャリア」は個人の内容（特性・能力開発・資格）。特性は「AQ33点・境界域、医師の見立てはASD寄りでADHDではない」を前提に書く。
- 更新は年1回ほど、Claudeに頼んで行う。このリポジトリそのものが正。

## 構成
- `content/structure.ts` … 領域 → グループ → ノートの階層。`listGroups: true` の領域（その他）は、一覧で領域名の横にグループ名を小さく添える。ノートIDは並び順から `n{領域}-{グループ}-{順番}` で決まる。途中に差し込むと後ろのIDがずれるので、追加はグループの末尾に行う。
- `content/notes/{id}.mdx` … ノート本文。ファイルがないノートは「準備中」と表示される。
- `content/templates.ts` / `content/templates/*.md` … テンプレート一覧とダウンロード用ファイル。`usedIn` には使う場面のノートIDを書く。
- `content/pages/*.html` … コンセプトとデザインシステムの本文（デザインで確定した静的HTML）。目次は id 付きの H2 から自動で作る（`lib/static-page.ts`）。
- `components/mdx.tsx` … ノートで使える部品：`Mark` `Note` `Caution` `Cards` `Card` `Steps` `Step` `NoteLink` `TemplateLink` `Figure` `Diagram`。表は自動で横スクロールできる枠に入る。
- 汎用の図は Mermaid で書く。使える種類と使い分けの見本は `/diagrams`（`content/pages/diagrams.mdx`）。`<Diagram caption="…">` の中に ```mermaid を置き、`npm run render:diagrams` で `content/diagrams/{hash}.svg` に書き出す（閲覧時にJavaScriptを使わない。手元のChromeとNoto Sans JP／Noto Sans CJK JPが要る）。横に並べるのは4つまで、それ以上は flowchart TD。太字は `<b>`。
- `lib/content.ts`（ノートの読み込み・目次）、`lib/render-mdx.tsx`（MDXの描画）、`lib/search.ts`（検索）、`lib/auth.ts`・`lib/env.ts`（閲覧者の判定・環境変数）。
- 検索は、ビルド時に作る索引 `/api/search-index` をブラウザが1回読み込み、`lib/search-core.ts` で手元で照合する（タイトル・説明・本文の部分一致）。

## ノートの書き方（表記ルール）
- 「だ・である」か体言止め。「です・ます」は使わない。
- 英数字は半角。数字と単位の間はあけない。
- 並列は「・」、文の区切りは「、」。用語は「」、書名は『』。括弧は全角（）。
- 見出しは名詞で短く。1文60字程度、1段落3文まで。
- 用語：ノート・領域・原則・プロセス・テンプレート。PM Schoolの言い方を正とする。
- 太字は1段落に1か所、マーカー（`<Mark>`）は1セクションに1か所まで。マーカーは講義で特に強調された一文だけに使う（講義にない重要度の順位は付けない）。
- 「原則」の箇条書きは同じ重さで並べ、太字もマーカーも付けない。原則のまとまりは表示側で青い地の枠に入る（ノートで最も大事な部分）。「## 原則」の見出しは書くが、画面には出さない。原則が多すぎるノートは、重要でない項目が混ざっていないか見直す。
- 囲みは `<Note>`（灰色：補足・目安）と `<Caution>`（黄：注意）の2種類だけ。
- 並列3〜4個は `<Cards>`、順番のあるプロセスは `<Steps>`。4段階までで説明が短ければ横並び、それ以外は自動で縦に並ぶ。使いすぎない。
- 太字の閉じ記号の直前に句点を置かない（「〜する**。」と書く）。句点のあとに `**` を置くと太字にならない。
- テンプレートは使うプロセスの中に `<TemplateLink>` で置く。
- 図の使い方：講義の図があればそれを使う。なければ表・Cards・Steps・Mermaid で表す。一点物の図は作らない。説明の重複は1か所に寄せ、そのノートの理解に必要な場合だけ残す。
- 詳しくは `/design-system`。

## 開発
- Next.js 16（App Router、`proxy.ts`）、React 19、TypeScript、Supabase Auth、Vercel。
- 環境変数は `.env.local` のみ（`.env.example` 参照）。秘密の値を `NEXT_PUBLIC_` に入れない。
- `any` を使わない。Server Components を基本にする。
- `npm run dev` / `npm run build` / `npm run typecheck`
- `npm run check:content` … 構成とファイルの食い違い、リンク切れ、使えない部品、閉じない太字、「です・ます」などを確かめる。ノートを足したり直したりしたら必ず実行する（Node.js 22.18 以降）。
