import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "diagrams");

/** scripts/render-diagrams.mts と同じ規則でハッシュを作り、書き出し済みの SVG を返す */
export function loadDiagram(src: string): string | null {
  const h = createHash("sha1").update(src.trim()).digest("hex").slice(0, 10);
  const file = path.join(DIR, `${h}.svg`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}
