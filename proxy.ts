import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { isAllowedEmail, isPublicPath } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  const { pathname } = request.nextUrl;

  // 環境変数がない場合：手元の開発だけ素通し、本番では閉じる
  if (!env) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Auth is not configured", { status: 503 });
  }

  // セッションの更新で Cookie が変わったら、そのままレスポンスにも載せる
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() は毎回 Supabase に問い合わせるため遅い。getClaims() は署名鍵（JWKS）で手元で検証するので、
  // 非対称鍵のプロジェクトならネットワークを使わずに済む（対称鍵のときは getUser() と同じく問い合わせる）
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims.email === "string" ? data.claims.email : undefined;
  const user = data?.claims.sub ? { email } : null;

  if (isPublicPath(pathname) || isAllowedEmail(user?.email)) return response;

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const to = request.nextUrl.clone();
  to.pathname = "/login";
  to.search = user ? "?denied=1" : "";
  return NextResponse.redirect(to);
}

export const config = {
  // 図（講義のスライド）も守るため、画像は除外しない
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
