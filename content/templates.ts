// テンプレート一覧。file はダウンロード用（content/templates/ 以下）、url は外部リンク。
// usedIn には使う場面のノートIDを書く（一覧に出す「領域 / グループ」は構成から引く）。
export type Template = {
  id: string;
  name: string;
  desc: string;
  usedIn: string;
  kind: "Markdown" | "Figma";
  file?: string;
  url?: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "fact-sheet-tob",
    name: "ファクト収集シート（to B）",
    desc: "ヒアリング項目、深掘りの3つの質問、タブー7箇条、マインドセット7箇条",
    usedIn: "n3-2-2",
    kind: "Markdown",
    file: "fact-sheet-tob.md",
  },
  {
    id: "hypothesis-sheet",
    name: "仮説検証シート",
    desc: "課題・ユーザー・解決策の仮説を並べて検証する",
    usedIn: "n3-4-1",
    kind: "Figma",
    url: "https://www.figma.com/design/WEF3gkkyShD16xTNmbVuRJ/PM%E4%BB%AE%E8%AA%AC%E6%A4%9C%E8%A8%BC%E3%82%B7%E3%83%BC%E3%83%88%E3%80%90%E9%85%8D%E5%B8%83%E7%94%A8%E3%80%91?node-id=220-2",
  },
  {
    id: "prd-template",
    name: "PRDテンプレート",
    desc: "目的・機能説明・リリース計画の3部構成",
    usedIn: "n4-2-6",
    kind: "Markdown",
    file: "prd-template.md",
  },
  {
    id: "prd-sample-tob",
    name: "PRDサンプル（to B SaaS）",
    desc: "営業効率化SaaSを例にした記入例",
    usedIn: "n4-2-6",
    kind: "Markdown",
    file: "prd-sample-tob.md",
  },
  {
    id: "prd-sample-toc",
    name: "PRDサンプル（to C アプリ）",
    desc: "スマートカレンダーアプリを例にした記入例",
    usedIn: "n4-2-6",
    kind: "Markdown",
    file: "prd-sample-toc.md",
  },
];

export function findTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
