// 閲覧できる人の判定。講義の内容を含むので、許可したアカウントだけが見られるようにする。

/** ログインしていなくても開けるパス */
export const PUBLIC_PATHS = ["/login", "/auth/callback"] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** ALLOWED_EMAILS（カンマ区切り）に含まれるメールアドレスか。大文字・小文字は区別しない */
export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
