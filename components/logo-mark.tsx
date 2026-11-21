/**
 * ロゴのマーク。課題（的）に向けて引く補助線（点線）。
 * PM＝課題に向かう仕事、このプロダクト＝そのための補助線。app/icon.svg と同じ形。
 */
export function LogoMark({ size = 24, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect width="64" height="64" rx="14" fill="#1868DB" />
      <circle cx="40" cy="24" r="12" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      <circle cx="40" cy="24" r="3.5" fill="#fff" />
      <path d="M15 49L31 33" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" strokeDasharray="0.1 9" />
    </svg>
  );
}
