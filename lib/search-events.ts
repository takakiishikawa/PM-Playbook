// 検索のポップアップを、どこからでも開くためのイベント
export const OPEN_SEARCH_EVENT = "pmp:open-search";

export function openSearch(initialQuery = "") {
  window.dispatchEvent(new CustomEvent<string>(OPEN_SEARCH_EVENT, { detail: initialQuery }));
}
