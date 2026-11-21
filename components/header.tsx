import Link from "next/link";
import FileIcon from "@atlaskit/icon/core/file";
import InformationCircleIcon from "@atlaskit/icon/core/information-circle";
import HomeIcon from "@atlaskit/icon/core/home";
import { DOMAINS, noteCount } from "@/content/structure";
import { DomainMenu, type MenuDomain } from "./domain-menu";
import { SearchTrigger } from "./search-trigger";
import { Icon } from "./icon";
import { LogoMark } from "./logo-mark";

export type Crumb = { label: string; href?: string };

const MENU: MenuDomain[] = DOMAINS.map((d) => ({
  no: d.no,
  slug: d.slug,
  name: d.name,
  count: noteCount(d),
  sub: d.listGroups ? d.groups.map((g) => g.name).join("・") : undefined,
  groups: d.groups.map((g) => ({ name: g.name, notes: g.notes.map((n) => ({ id: n.id, title: n.title })) })),
}));

export function Header({ crumbs, showSearch = true, currentDomain, currentNote }: { crumbs?: Crumb[]; showSearch?: boolean; currentDomain?: string; currentNote?: string }) {
  return (
    <header className="header">
      <div className="header-left">
        <Link href="/" className="logo">
          <LogoMark size={24} />
          <span className="logo-name">PM Playbook</span>
        </Link>
        <DomainMenu domains={MENU} currentDomain={currentDomain} currentNote={currentNote} />
        {crumbs && crumbs.length > 0 ? (
          <>
            <span className="crumbs-divider" aria-hidden="true" />
            <nav aria-label="パンくず" className="crumbs-nav">
              <ol className="crumbs">
                <li className="crumb-home">
                  <Link href="/" className="crumb-home-link h-ghost" aria-label="ホーム" title="ホーム">
                    <Icon glyph={HomeIcon} />
                  </Link>
                </li>
                {crumbs.map((c, i) => (
                  <li key={`${i}:${c.label}`} title={c.label}>
                    {c.href ? (
                      <Link href={c.href} className="crumb-link h-ghost">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="current" aria-current="page">
                        {c.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </>
        ) : null}
      </div>
      {showSearch ? <SearchTrigger /> : null}
      <div className="header-right">
        <Link href="/templates" className="icon-btn h-ghost" aria-label="テンプレート" title="テンプレート">
          <Icon glyph={FileIcon} />
        </Link>
        <Link href="/concept" className="icon-btn h-ghost" aria-label="コンセプト" title="コンセプト">
          <Icon glyph={InformationCircleIcon} />
        </Link>
      </div>
    </header>
  );
}
