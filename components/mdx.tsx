import Link from "next/link";
import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import ChevronRightIcon from "@atlaskit/icon/core/chevron-right";
import FileIcon from "@atlaskit/icon/core/file";
import DownloadIcon from "@atlaskit/icon/core/download";
import LinkExternalIcon from "@atlaskit/icon/core/link-external";
import { findNote } from "@/content/structure";
import { findTemplate } from "@/content/templates";
import { Figure } from "./figure";
import { Diagram, Pre } from "./diagram";
import { Icon } from "./icon";

function Mark({ children }: { children: ReactNode }) {
  return <span className="mark">{children}</span>;
}

function Note({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="block-note">
      {title ? <span className="t">{title}</span> : null}
      <div>{children}</div>
    </div>
  );
}

function Caution({ children }: { children: ReactNode }) {
  return (
    <div className="block-caution" role="note">
      <span className="t">注意</span>
      {children}
    </div>
  );
}

function Cards({ children, cols }: { children: ReactNode; cols?: number }) {
  return (
    <div className="cards" style={cols ? ({ ["--cols" as string]: cols } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}

function Card({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="card">
      {label ? <span className="l">{label}</span> : null}
      <div className="b">{children}</div>
    </div>
  );
}

/** 横並びにできる上限。これを超える段数や長い説明は、読みやすさを優先して縦に並べる */
const STEPS_ROW_MAX = 4;
const STEPS_ROW_TEXT_BUDGET = 240;

function textLength(node: ReactNode): number {
  if (typeof node === "string" || typeof node === "number") return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + textLength(n), 0);
  if (isValidElement<{ children?: ReactNode }>(node)) return textLength(node.props.children);
  return 0;
}

function Steps({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{ n?: number; children?: ReactNode }>[];
  const longest = Math.max(0, ...items.map((c) => textLength(c.props.children)));
  const row = items.length <= STEPS_ROW_MAX && items.length * longest <= STEPS_ROW_TEXT_BUDGET;
  return (
    <div className={row ? "steps" : "steps column"}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {cloneElement(child, { n: i + 1 })}
          {row && i < items.length - 1 ? (
            <span className="step-arrow" aria-hidden="true">
              <Icon glyph={ChevronRightIcon} />
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function Step({ title, children, n }: { title: string; children?: ReactNode; n?: number }) {
  return (
    <div className="step">
      <span className="n">STEP {n}</span>
      <span className="t">{title}</span>
      {children ? <span className="d">{children}</span> : null}
    </div>
  );
}

function NoteLink({ id, children }: { id: string; children?: ReactNode }) {
  const n = findNote(id);
  return <Link href={`/n/${id}`}>{children ?? n?.title ?? id}</Link>;
}

function TemplateLink({ id, hint }: { id: string; hint?: string }) {
  const t = findTemplate(id);
  if (!t) return null;
  const external = !!t.url;
  return (
    <a href={t.url ?? `/templates/${t.id}`} {...(external ? { target: "_blank", rel: "noreferrer" } : { download: true })} className="template-link h-row">
      <Icon glyph={FileIcon} color="var(--color-text-subtle)" />
      <span className="k">テンプレート</span>
      <span className="n">{t.name}</span>
      {hint ? <span className="s">{hint}</span> : null}
      <Icon glyph={external ? LinkExternalIcon : DownloadIcon} color="var(--color-text-subtle)" label={external ? `${t.name}を開く` : `${t.name}をダウンロード`} />
    </a>
  );
}

/** 表は狭い画面で横にスクロールできるよう包む */
function Table(props: React.ComponentProps<"table">) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  );
}

export const mdxComponents = { Mark, Note, Caution, Cards, Card, Steps, Step, NoteLink, TemplateLink, Figure, Diagram, table: Table, pre: Pre };
