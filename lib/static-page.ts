import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { TocItem } from "@/components/toc";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export type StaticPageName = "concept" | "design-system";

/**
 * content/pages/{name}.html（デザインで確定した、自分で書いた静的な本文）を読み、
 * id 付きの H2 から目次を作る。目次を手で書かないので、本文の見出しと食い違わない。
 */
export function loadStaticPage(name: StaticPageName): { html: string; toc: TocItem[] } {
  const html = fs.readFileSync(path.join(PAGES_DIR, `${name}.html`), "utf8");
  const toc: TocItem[] = [];
  for (const m of html.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>([^<]+)/g)) {
    toc.push({ id: m[1], text: m[2].trim(), level: 2 });
  }
  return { html, toc };
}
