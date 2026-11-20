import fs from "node:fs";
import path from "node:path";
import { findTemplate } from "@/content/templates";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = findTemplate((await params).id);
  if (!t?.file) return new Response("Not found", { status: 404 });
  const body = fs.readFileSync(path.join(process.cwd(), "content", "templates", t.file), "utf8");
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${t.name}.md`)}`,
    },
  });
}
