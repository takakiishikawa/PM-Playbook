import Link from "next/link";
import type { Metadata } from "next";
import DownloadIcon from "@atlaskit/icon/core/download";
import LinkExternalIcon from "@atlaskit/icon/core/link-external";
import FileIcon from "@atlaskit/icon/core/file";
import PageIcon from "@atlaskit/icon/core/page";
import { TEMPLATES, type Template } from "@/content/templates";
import { findNote, notePath } from "@/content/structure";
import { Header } from "@/components/header";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "テンプレート" };

export default function TemplatesPage() {
  return (
    <>
      <Header crumbs={[{ label: "テンプレート" }]} />
      <main className="page" id="main">
        <div className="wrap-1040 stack-24">
          <div className="page-head">
            <div className="title-row">
              <h1 className="h1">テンプレート</h1>
              <span className="lozenge">{TEMPLATES.length}件</span>
            </div>
            <p className="lede">そのまま使えるシートとテンプレート。使う場面のノートから開くこともできます。</p>
          </div>
          <table className="ui-table">
            <thead>
              <tr>
                <th scope="col">名前</th>
                <th scope="col">使う場面</th>
                <th scope="col">形式</th>
                <th scope="col" aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((t) => (
                <TemplateRow key={t.id} t={t} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function TemplateRow({ t }: { t: Template }) {
  const note = findNote(t.usedIn);
  return (
    <tr id={t.id}>
      <td>
        <div className="tpl-cell">
          <Icon glyph={FileIcon} color="var(--color-text-subtle)" />
          <div className="tpl-name">
            <span className="n">{t.name}</span>
            <span className="d">{t.desc}</span>
          </div>
        </div>
      </td>
      <td className="tpl-used">{note ? <Link href={`/n/${note.id}`} className="icon-link">
            <Icon glyph={PageIcon} />
            {notePath(note)}
          </Link> : null}</td>
      <td>
        <span className="lozenge">{t.kind}</span>
      </td>
      <td className="actions">
        {t.url ? (
          <a href={t.url} target="_blank" rel="noreferrer" className="btn-subtle h-btn">
            <Icon glyph={LinkExternalIcon} />
            開く
          </a>
        ) : (
          <a href={`/templates/${t.id}`} download className="btn-subtle h-btn">
            <Icon glyph={DownloadIcon} />
            ダウンロード
          </a>
        )}
      </td>
    </tr>
  );
}
