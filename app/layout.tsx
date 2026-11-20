import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { DOMAINS } from "@/content/structure";
import { SearchDialog } from "@/components/search-dialog";
import "./globals.css";

const noto = Noto_Sans_JP({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-noto", display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "PM Playbook", template: "%s ｜ PM Playbook" },
  description: "実践知への補助線。プロダクトマネジメントの原則とプロセス。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.variable}>
      <body>
        <a href="#main" className="skip-link">本文へ移動</a>
        {children}
        <SearchDialog domains={DOMAINS.map((d) => ({ slug: d.slug, name: d.name }))} />
      </body>
    </html>
  );
}
