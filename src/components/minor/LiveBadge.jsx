const LIVE_GREEN = '#3a7d44'

export default function LiveBadge({ period }) {
  if (!period) return null

  if (period === 'FT') {
    return (
      <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-gaa-text-muted">
        FT
      </span>
    )
  }

  if (period === 'HT') {
    return (
      <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-gaa-amber">
        HT
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
      style={{ color: LIVE_GREEN }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
        style={{ backgroundColor: LIVE_GREEN }}
        aria-hidden="true"
      />
      LIVE · {period}
    </span>
  )
}
