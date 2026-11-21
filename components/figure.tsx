"use client";

import { useState } from "react";
import GrowDiagonalIcon from "@atlaskit/icon/core/grow-diagonal";
import ShrinkDiagonalIcon from "@atlaskit/icon/core/shrink-diagonal";
import { Icon } from "./icon";

/** 本文中に幅560pxで置き、図そのものか「拡大」を押すと本文幅いっぱいに広げる（ポップアップは使わない） */
export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [big, setBig] = useState(false);
  return (
    <figure className={big ? "figure big" : "figure"}>
      <div className="frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" decoding="async" onClick={() => setBig((v) => !v)} />
        <button type="button" className="toggle h-float" onClick={() => setBig((v) => !v)} aria-label={big ? "図を縮小" : "図を拡大"} aria-expanded={big}>
          <Icon glyph={big ? ShrinkDiagonalIcon : GrowDiagonalIcon} />
          {big ? "縮小" : "拡大"}
        </button>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
