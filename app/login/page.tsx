import type { Metadata } from "next";
import { LoginButton } from "./login-button";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ denied?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="login-page" id="main">
      <div className="login-box">
        <div className="brand">
          <span className="logo-mark">P</span>
          <span className="logo-name">PM Playbook</span>
        </div>
        <p className="intro">個人用のノートです。許可したアカウントでログインしてください。</p>
        {sp.denied ? (
          <div className="block-caution" role="alert">
            <span className="t">注意</span>このアカウントには許可がありません。
          </div>
        ) : null}
        {sp.error ? (
          <div className="block-caution" role="alert">
            <span className="t">注意</span>ログインに失敗しました。もう一度お試しください。
          </div>
        ) : null}
        <LoginButton signedIn={!!sp.denied} />
      </div>
    </main>
  );
}
