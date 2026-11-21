import { Children, isValidElement, type ReactNode } from "react";
import { loadDiagram } from "@/lib/diagrams";

/** 子要素から文字だけを取り出す（```mermaid のコードブロックの中身） */
function textOf(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** Mermaid の図。npm run render:diagrams で書き出した SVG を埋め込む（閲覧時に JavaScript を使わない） */
export function DiagramView({ src, caption }: { src: string; caption?: string }) {
  const svg = loadDiagram(src);
  return (
    <figure className="diagram">
      {svg ? <div className="frame" dangerouslySetInnerHTML={{ __html: svg }} /> : <pre className="frame missing">図が書き出されていない（npm run render:diagrams）</pre>}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/** ノートでは <Diagram caption="…"> の中に ```mermaid のコードブロックを書く */
export function Diagram({ caption, children }: { caption?: string; children: ReactNode }) {
  return <DiagramView src={textOf(Children.toArray(children))} caption={caption} />;
}

/** キャプションなしで ```mermaid だけを書いた場合も図にする。それ以外のコードブロックはそのまま */
export function Pre(props: { children?: ReactNode }) {
  const child = Children.only(props.children);
  if (isValidElement<{ className?: string; children?: ReactNode }>(child) && child.props.className === "language-mermaid") {
    return <DiagramView src={textOf(child.props.children)} />;
  }
  return <pre {...props} />;
}
