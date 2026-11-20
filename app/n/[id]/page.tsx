import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ALL_NOTES, findNote } from "@/content/structure";
import { formatUpdated, loadNote, neighbors } from "@/lib/content";
import { renderMdx } from "@/lib/render-mdx";
import ClockIcon from "@atlaskit/icon/core/clock";
import { Header } from "@/components/header";
import { Icon } from "@/components/icon";
import { mdxComponents } from "@/components/mdx";
import { Toc } from "@/components/toc";
import { PrevNext } from "@/components/prev-next";
import { Highlighter } from "@/components/highlighter";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return ALL_NOTES.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = findNote((await params).id);
  if (!n) return { title: "見つかりません" };
  const doc = loadNote(n.id);
  return { title: doc?.meta.title || n.title, description: doc?.meta.lede || n.desc };
}

export default async function NotePage({ params }: Params) {
  const note = findNote((await params).id);
  if (!note) notFound();
  const doc = loadNote(note.id);
  const { prev, next } = neighbors(note);
  const d = note.domain;
  // 順番のある領域では、パンくずのグループ名に STEP の番号を添える
  const groupLabel = d.ordered ? `STEP ${note.groupIndex + 1}　${note.groupName}` : note.groupName;
  const title = doc?.meta.title || note.title;
  const lede = doc?.meta.lede || note.desc;
  const updated = formatUpdated(doc?.meta.updated);
  const content = doc ? await renderMdx(doc.body) : null;
  const { Note } = mdxComponents;

  return (
    <>
      <Header crumbs={[{ label: d.name, href: `/d/${d.slug}` }, { label: groupLabel }]} currentDomain={d.slug} currentNote={note.id} />
      <main className="page with-toc" id="main">
        <article className="main article" id="note-body">
          <div className="title-block">
            <h1 className="h1">{title}</h1>
            {lede ? <p className="lede">{lede}</p> : null}
          </div>
          {content ?? (
            <Note title="準備中">
              <p>このノートはまだ講義の内容から書き起こしていない。</p>
            </Note>
          )}
          {updated ? (
            <p className="note-updated">
              <Icon glyph={ClockIcon} />
              最終更新 {updated}
            </p>
          ) : null}
          <PrevNext prev={prev && { id: prev.id, title: prev.title }} next={next && { id: next.id, title: next.title }} />
        </article>
        {doc ? <Toc items={doc.headings} /> : null}
        <Suspense fallback={null}>
          <Highlighter targetId="note-body" />
        </Suspense>
      </main>
    </>
  );
}
