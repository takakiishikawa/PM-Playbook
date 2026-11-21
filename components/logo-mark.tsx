/**
 * ロゴのマーク。現状（左下の点）から目的（右上の的）までの、迷いながら進むジグザグの道（薄い線）と、
 * その道筋を見通す補助線（点線）。app/icon.svg と同じ形。
 */
export function LogoMark({ size = 24, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect width="64" height="64" rx="14" fill="#1868DB" />
      <path d="M15 49L10.5 36L26 32L20 19L36.5 16.5" fill="none" stroke="#fff" strokeOpacity=".38" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
      <path d="M20 44L36 28" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" strokeDasharray="3 6" />
      <circle cx="15" cy="49" r="5" fill="#fff" />
      <circle cx="47.5" cy="16.5" r="8.5" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <circle cx="47.5" cy="16.5" r="3" fill="#fff" />
    </svg>
  );
}
