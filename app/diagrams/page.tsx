import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Toc } from "@/components/toc";
import { renderMdx } from "@/lib/render-mdx";
import { extractHeadings } from "@/lib/content";

export const metadata: Metadata = { title: "図解ライブラリ" };

/** ノートで使える図解の部品の見本（content/pages/diagrams.mdx） */
export default async function DiagramsPage() {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", "pages", "diagrams.mdx"), "utf8");
  const { data, content } = matter(raw);
  const body = await renderMdx(content);
  return (
    <>
      <Header crumbs={[{ label: "デザインシステム", href: "/design-system" }, { label: String(data.title) }]} />
      <main className="page with-toc" id="main">
        <article className="main article">
          <div className="title-block">
            <h1 className="h1">{String(data.title)}</h1>
            <p className="lede">{String(data.lede)}</p>
          </div>
          {body}
        </article>
        <Toc items={extractHeadings(content)} />
      </main>
    </>
  );
}
