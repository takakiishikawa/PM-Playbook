import Link from "next/link";
import ChevronRightIcon from "@atlaskit/icon/core/chevron-right";
import { ALL_NOTES, DOMAINS, noteCount } from "@/content/structure";
import { Header } from "@/components/header";
import { Icon } from "@/components/icon";
import { HomeSearch } from "@/components/search-trigger";
import { DomainIcon } from "@/components/domain-icon";

export default function Home() {
  return (
    <>
      <Header showSearch={false} />
      <main className="page-home" id="main">
        <div className="wrap-880 stack-48">
          <section className="stack-12">
            <h1 className="home-title">何を調べますか？</h1>
            <HomeSearch />
          </section>
          <section className="stack-8">
            <div className="section-head">
              <h2>領域</h2>
              <span className="count">
                {DOMAINS.length}領域・{ALL_NOTES.length}ノート
              </span>
            </div>
            <div className="list-box">
              {DOMAINS.map((d) => (
                <Link key={d.slug} href={`/d/${d.slug}`} className="domain-row h-row">
                  <span className="no">{d.no}</span>
                  <DomainIcon slug={d.slug} />
                  <span className="text">
                    <span className="name">{d.name}</span>
                    <span className="items">{d.groups.map((g) => g.name).join("・")}</span>
                  </span>
                  <span className="count">{noteCount(d)}</span>
                  <Icon glyph={ChevronRightIcon} color="var(--color-text-subtlest)" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
