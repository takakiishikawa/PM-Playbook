import "server-only";
import { ALL_NOTES, notePath } from "@/content/structure";
import { TEMPLATES } from "@/content/templates";
import { loadNote } from "./content";
import type { SearchIndexData } from "./search-core";

/** 検索の索引を作る（ビルド時に1回）。照合はブラウザ側の lib/search-core.ts で行う */
export function buildSearchIndex(): SearchIndexData {
  return {
    notes: ALL_NOTES.map((n) => {
      const doc = loadNote(n.id);
      return {
        id: n.id,
        title: n.title,
        desc: n.desc ?? "",
        domain: n.domain.slug,
        path: notePath(n),
        body: [n.desc ?? "", doc?.meta.lede ?? "", doc?.text ?? ""].join("\n").normalize("NFKC"),
      };
    }),
    templates: TEMPLATES.map((t) => ({ id: t.id, name: t.name, desc: t.desc })),
  };
}
