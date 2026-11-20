import "server-only";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx";

/**
 * ノートの MDX をサーバーで評価して描画する。
 * 見出しの id は rehype-slug（github-slugger）で付く。目次（lib/content.ts）も同じ規則で id を作る。
 */
export async function renderMdx(source: string): Promise<ReactNode> {
  const { default: Content } = await evaluate(source, { ...runtime, remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] });
  return <Content components={mdxComponents} />;
}
