import { loadStaticPage, type StaticPageName } from "@/lib/static-page";
import { Header } from "./header";
import { Toc } from "./toc";

/** コンセプト・デザインシステムのような、静的な HTML 本文を目次つきで出すページ */
export function StaticPage({ name, label, wide = false }: { name: StaticPageName; label: string; wide?: boolean }) {
  const { html, toc } = loadStaticPage(name);
  return (
    <>
      <Header crumbs={[{ label }]} />
      <main className={wide ? "page with-toc wide" : "page with-toc"} id="main">
        <div className="main static-body" dangerouslySetInnerHTML={{ __html: html }} />
        <Toc items={toc} />
      </main>
    </>
  );
}
