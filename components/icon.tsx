import type { ComponentType } from "react";

/** @atlaskit/icon/core/* の線のアイコン（16px 固定） */
export type Glyph = ComponentType<{ label: string; color?: "currentColor" }>;

/**
 * アイコンは色を CSS 変数で指定したいので、外側の span で色を決め、アイコンは currentColor で塗る。
 * label を渡すと読み上げ用の名前になる。文字と並べるときは空のまま（飾り扱い）にする。
 */
export function Icon({ glyph: G, color, label = "" }: { glyph: Glyph; color?: string; label?: string }) {
  return (
    <span className="icon" style={color ? { color } : undefined}>
      <G label={label} color="currentColor" />
    </span>
  );
}
