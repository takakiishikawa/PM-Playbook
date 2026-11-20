import type { Metadata } from "next";
import { LoginButton } from "./login-button";

export const metadata: Metadata = { title: "ログイン" };

type Search = { denied?: string; error?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const message = sp.denied ? "このアカウントには閲覧の許可がありません。別のアカウントでログインしてください。" : sp.error ? "ログインに失敗しました。もう一度お試しください。" : null;

  return (
    <main className="login-page" id="main">
      <div className="login-card">
        <span className="login-logo" aria-hidden="true">
          P
        </span>
        <div className="login-head">
          <h1>PM Playbook にログイン</h1>
          <p>許可されたアカウントだけが閲覧できます。</p>
        </div>
        {message ? (
          <p className="login-alert" role="alert">
            {message}
          </p>
        ) : null}
        <LoginButton switchAccount={!!sp.denied} />
      </div>
      <p className="login-foot">個人用のノートです</p>
    </main>
  );
}
