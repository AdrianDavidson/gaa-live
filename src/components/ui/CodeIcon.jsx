export default function CodeIcon({ code, size = 16, className = '' }) {
  if (code === 'hurling') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="Hurling"
        className={className}
      >
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
        {/* Top seam arc — characteristic sliotar stitching */}
        <path
          d="M 5.5 9.5 C 7.5 5 16.5 5 18.5 9.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Bottom seam arc */}
        <path
          d="M 5.5 14.5 C 7.5 19 16.5 19 18.5 14.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (code === 'football') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="Football"
        className={className}
      >
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
        {/* Vertical panel seam */}
        <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth="1.3"/>
        {/* Horizontal panel seam */}
        <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.3"/>
        {/* Central lace marks */}
        <line x1="10" y1="10.5" x2="14" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="12"   x2="14" y2="12"   stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="10" y1="13.5" x2="14" y2="13.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    )
  }

  return null
}
