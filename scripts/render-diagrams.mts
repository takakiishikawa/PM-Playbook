/**
 * ノートの ```mermaid ブロックを SVG に書き出す（content/diagrams/{hash}.svg）。
 * 閲覧時に JavaScript を読ませないため、図はここで前もって描いておく。
 *
 *   npm run render:diagrams
 *
 * - 手元の Chrome を使う（CHROME_PATH で指定できる）。文字の幅を正しく測るため Noto Sans JP（または Noto Sans CJK JP）を入れておく。
 * - 図の中身が変わるとハッシュが変わり、新しいファイルになる。使われなくなったファイルは消す。
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const NOTES = path.join(ROOT, "content", "notes");
const PAGES = path.join(ROOT, "content", "pages");
const OUT = path.join(ROOT, "content", "diagrams");
const MERMAID = path.join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js");

export const FENCE = /```mermaid\n([\s\S]*?)```/g;

export function diagramHash(src: string): string {
  return createHash("sha1").update(src.trim()).digest("hex").slice(0, 10);
}

const FONT = '"Noto Sans JP", "Noto Sans CJK JP", sans-serif';

/** Atlassian の色に合わせる。形と線の細部は app/globals.css の .diagram で整える */
const CONFIG = {
  startOnLoad: false,
  theme: "base",
  look: "classic",
  fontFamily: FONT,
  securityLevel: "strict",
  themeVariables: {
    fontFamily: FONT,
    fontSize: "14px",
    background: "#ffffff",
    primaryColor: "#f5f7fa",
    primaryBorderColor: "#f5f7fa",
    primaryTextColor: "#292a2e",
    secondaryColor: "#e9f2fe",
    tertiaryColor: "#ffffff",
    lineColor: "#8c8f97",
    textColor: "#292a2e",
    edgeLabelBackground: "#ffffff",
    clusterBkg: "#ffffff",
    clusterBorder: "#0b120e24",
    quadrant1Fill: "#e9f2fe",
    quadrant2Fill: "#f5f7fa",
    quadrant3Fill: "#ffffff",
    quadrant4Fill: "#f5f7fa",
    quadrant1TextFill: "#292a2e",
    quadrant2TextFill: "#292a2e",
    quadrant3TextFill: "#292a2e",
    quadrant4TextFill: "#292a2e",
    quadrantTitleFill: "#292a2e",
    quadrantXAxisTextFill: "#505258",
    quadrantYAxisTextFill: "#505258",
    quadrantInternalBorderStrokeFill: "#ffffff",
    quadrantExternalBorderStrokeFill: "#ffffff",
    quadrantPointFill: "#1868db",
    quadrantPointTextFill: "#292a2e",
    // マインドマップ・ジャーニーなど、色を順に使う図は青と灰色の濃淡だけにする
    cScale0: "#e9f2fe", cScale1: "#f5f7fa", cScale2: "#e9f2fe", cScale3: "#f5f7fa", cScale4: "#e9f2fe", cScale5: "#f5f7fa",
    cScale6: "#e9f2fe", cScale7: "#f5f7fa", cScale8: "#e9f2fe", cScale9: "#f5f7fa", cScale10: "#e9f2fe", cScale11: "#f5f7fa",
    cScaleLabel0: "#292a2e", cScaleLabel1: "#292a2e", cScaleLabel2: "#292a2e", cScaleLabel3: "#292a2e", cScaleLabel4: "#292a2e", cScaleLabel5: "#292a2e",
    cScaleLabel6: "#292a2e", cScaleLabel7: "#292a2e", cScaleLabel8: "#292a2e", cScaleLabel9: "#292a2e", cScaleLabel10: "#292a2e", cScaleLabel11: "#292a2e",
    // ガントチャート：通常は灰色、強調（crit）は主色
    taskBkgColor: "#e9f2fe", taskBorderColor: "#cfe1fd", taskTextColor: "#292a2e", taskTextDarkColor: "#292a2e", taskTextOutsideColor: "#292a2e",
    critBkgColor: "#1868db", critBorderColor: "#1868db", taskTextLightColor: "#ffffff",
    activeTaskBkgColor: "#cfe1fd", activeTaskBorderColor: "#1868db", doneTaskBkgColor: "#f5f7fa", doneTaskBorderColor: "#dfe1e6",
    sectionBkgColor: "#ffffff", altSectionBkgColor: "#f5f7fa", sectionBkgColor2: "#ffffff", gridColor: "#dfe1e6", todayLineColor: "#ffffff",
    // グラフ・レーダー
    xyChart: { plotColorPalette: "#1868db, #8c8f97, #cfe1fd", backgroundColor: "#ffffff", titleColor: "#292a2e", xAxisLabelColor: "#505258", yAxisLabelColor: "#505258", xAxisLineColor: "#8c8f97", yAxisLineColor: "#8c8f97", xAxisTickColor: "#8c8f97", yAxisTickColor: "#8c8f97", xAxisTitleColor: "#505258", yAxisTitleColor: "#505258" },
    cScaleInv0: "#1868db",
    fillType0: "#e9f2fe", fillType1: "#f5f7fa",
  },
  radar: { useMaxWidth: false, width: 520, height: 420, curveTension: 0.1 },
  xyChart: { useMaxWidth: false, width: 640, height: 360 },
  gantt: { useMaxWidth: false, barHeight: 24, barGap: 6, fontSize: 13, sectionFontSize: 13, leftPadding: 96, gridLineStartPadding: 24 },
  journey: { useMaxWidth: false, width: 100, leftMargin: 120, diagramMarginX: 20, boxMargin: 8 },
  mindmap: { useMaxWidth: false, padding: 12 },
  flowchart: { useMaxWidth: false, htmlLabels: true, curve: "basis", nodeSpacing: 28, rankSpacing: 36, padding: 14, wrappingWidth: 600, minNodeWidth: 64 },
  state: { useMaxWidth: false, minNodeWidth: 64 },
  quadrantChart: { useMaxWidth: false, chartWidth: 520, chartHeight: 360, titleFontSize: 16, quadrantLabelFontSize: 15, xAxisLabelFontSize: 13, yAxisLabelFontSize: 13 },
};

function chromePath(): string {
  const candidates = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"];
  const found = candidates.find((p): p is string => !!p && fs.existsSync(p));
  if (!found) throw new Error("Chrome が見つからない。CHROME_PATH を指定する");
  return found;
}

/** 書き出した SVG を本文に埋め込める形に整える（幅は本来の大きさ、背景なし） */
function tidy(svg: string): string {
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg)?.[1].trim().split(/\s+/).map(Number);
  // ルートの svg 要素から既定の幅・高さ・style を外し、viewBox の大きさを付け直す
  let out = svg.replace(/<svg [^>]*>/, (tag) => tag.replace(/ style="[^"]*"/, "").replace(/ (width|height)="[^"]*"/g, ""));
  if (vb && vb.length === 4) out = out.replace("<svg ", `<svg width="${Math.ceil(vb[2])}" height="${Math.ceil(vb[3])}" `);
  return out;
}

async function main() {
  const wanted = new Map<string, string>();
  const files = [
    ...fs.readdirSync(NOTES).filter((f) => f.endsWith(".mdx")).map((f) => path.join(NOTES, f)),
    ...fs.readdirSync(PAGES).filter((f) => f.endsWith(".mdx")).map((f) => path.join(PAGES, f)),
  ];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(FENCE)) wanted.set(diagramHash(m[1]), m[1].trim());
  }
  fs.mkdirSync(OUT, { recursive: true });
  const existing = new Set(fs.readdirSync(OUT).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)));
  const todo = [...wanted].filter(([h]) => !existing.has(h) || process.argv.includes("--all"));

  if (todo.length > 0) {
    const browser = await puppeteer.launch({ executablePath: chromePath(), args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><body style="font-family:${FONT.replace(/"/g, "'")}"></body></html>`);
    await page.addScriptTag({ path: MERMAID });
    await page.evaluate((cfg) => (window as unknown as { mermaid: { initialize: (c: unknown) => void } }).mermaid.initialize(cfg), CONFIG);
    for (const [h, src] of todo) {
      const svg = await page.evaluate(
        async (id, code) => (await (window as unknown as { mermaid: { render: (i: string, c: string) => Promise<{ svg: string }> } }).mermaid.render(id, code)).svg,
        `d${h}`,
        src,
      );
      const out = tidy(svg);
      fs.writeFileSync(path.join(OUT, `${h}.svg`), out);
      const w = Number(/<svg width="(\d+)"/.exec(out)?.[1] ?? 0);
      // 本文幅（800px）を超えると縮んで文字が小さくなる。向き（LR→TD）や段の数を見直す
      console.log(`描いた: ${h}${w > 800 ? `（幅${w}px：本文幅を超える）` : ""}`);
    }
    await browser.close();
  }
  for (const h of existing) {
    if (!wanted.has(h)) {
      fs.rmSync(path.join(OUT, `${h}.svg`));
      console.log(`消した: ${h}`);
    }
  }
  console.log(`${wanted.size} diagrams`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
