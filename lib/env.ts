// 環境変数の読み出しを1か所にまとめる。値は .env.local（本番は Vercel の環境変数）に置く。

/**
 * Supabase の接続先。NEXT_PUBLIC_ の値はブラウザにも埋め込まれるので、公開してよい URL と anon key だけを入れる。
 * どちらかが欠けていれば null を返す（呼び出し側で、開発中は素通し・本番は閉じる、などを決める）。
 */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

/** getSupabaseEnv の欠落を許さない版。ログイン処理のように、設定がなければ動けない場所で使う */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const env = getSupabaseEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください");
  return env;
}
