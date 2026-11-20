// 検索とハイライトで共通に使う文字列処理（クライアントからも読み込むので Node の API を使わない）

/** 全角英数・半角カナなどをそろえ、小文字にする */
export function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

/** 空白（全角含む）で区切った検索語。重複と空を除く */
export function splitTerms(q: string): string[] {
  return Array.from(new Set(q.normalize("NFKC").split(/\s+/).map((t) => t.trim()).filter(Boolean)));
}
