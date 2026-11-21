import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DOMAINS, findDomain, noteCount } from "@/content/structure";
import { hasNote } from "@/lib/content";
import PageIcon from "@atlaskit/icon/core/page";
import { Header } from "@/components/header";
import { Icon } from "@/components/icon";
import { DomainIcon } from "@/components/domain-icon";

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const d = findDomain((await params).domain);
  return { title: d?.name ?? "見つからない" };
}

export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const d = findDomain((await params).domain);
  if (!d) notFound();
  return (
    <>
      <Header crumbs={[{ label: d.name }]} currentDomain={d.slug} />
      <main className="page" id="main">
        <div className="wrap-1040 stack-32">
          <div className="page-head">
            <div className="title-row">
              <span className="title-icon"><DomainIcon slug={d.slug} /></span>
              <h1 className="h1">{d.name}</h1>
              <span className="lozenge">{noteCount(d)}ノート</span>
            </div>
            <p className="lede">{d.desc}</p>
          </div>
          <div className="group-grid">
            {d.groups.map((g, gi) => (
              <section key={g.name} className="group" id={`g${gi + 1}`}>
                <div className="group-head">
                  <h2>{g.name}</h2>
                  <span className="count">{g.notes.length}</span>
                </div>
                {g.notes.map((n) => (
                  <Link key={n.id} href={`/n/${n.id}`} className={`note-link h-row${hasNote(n.id) ? "" : " empty"}`}>
                    <Icon glyph={PageIcon} color="var(--color-text-subtlest)" />
                    {n.title}
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
