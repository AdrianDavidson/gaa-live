// Accent colour per code — import when needed on a surrounding element.
export const CODE_ICON_CLASS = {
  hurling:  'text-gaa-hurling',
  football: 'text-gaa-football',
}

/**
 * Props:
 *   code       — 'hurling' | 'football'
 *   size       — px, default 16
 *   className  — layout / positioning classes (e.g. "shrink-0")
 *   colorClass — override the colour; defaults to the code's accent colour
 */
export default function CodeIcon({ code, size = 16, className = '', colorClass }) {
  const color = colorClass ?? CODE_ICON_CLASS[code] ?? 'text-gray-400'
  const cls   = [color, className].filter(Boolean).join(' ')

  if (code === 'hurling') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label="Hurling" className={cls}>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 5.5 9.5 C 7.5 5 16.5 5 18.5 9.5"    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M 5.5 14.5 C 7.5 19 16.5 19 18.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    )
  }

  if (code === 'football') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label="Football" className={cls}>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12"  y1="2.5"  x2="12"  y2="21.5" stroke="currentColor" strokeWidth="1.3"/>
        <line x1="2.5" y1="12"   x2="21.5" y2="12"  stroke="currentColor" strokeWidth="1.3"/>
        <line x1="10" y1="10.5" x2="14" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="12"   x2="14" y2="12"   stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="13.5" x2="14" y2="13.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    )
  }

  return null
}
