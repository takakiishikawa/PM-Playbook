import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/header";

export const metadata: Metadata = { title: "ページが見つかりません" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="page" id="main">
        <div className="wrap-880 status-page">
          <h1 className="h1">ページが見つかりません</h1>
          <p className="lede">ノートの場所が変わったか、URLが間違っている可能性がある。⌘K で探すか、ホームから開き直す。</p>
          <Link href="/">ホームへ戻る</Link>
        </div>
      </main>
    </>
  );
}
