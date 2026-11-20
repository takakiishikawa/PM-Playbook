"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page" id="main">
      <div className="wrap-880 status-page">
        <h1 className="h1">表示できませんでした</h1>
        <p className="lede">一時的な問題の可能性がある。もう一度読み込むか、ホームから開き直す。</p>
        <div className="status-actions">
          <button type="button" className="btn-subtle h-btn" onClick={reset}>
            もう一度読み込む
          </button>
          <Link href="/">ホームへ戻る</Link>
        </div>
      </div>
    </main>
  );
}
