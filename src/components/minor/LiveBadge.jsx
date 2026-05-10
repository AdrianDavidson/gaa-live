export default function LiveBadge({ period }) {
  const isLive = period && period !== 'FT'
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gaa-minor">
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-gaa-minor animate-pulse" aria-hidden="true" />}
      {isLive ? `Minor · ${period}` : 'Minor · FT'}
    </span>
  )
}
