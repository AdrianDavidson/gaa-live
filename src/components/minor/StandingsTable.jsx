import { useAppStore }  from '../../store/appStore'
import { useClubs }     from '../../hooks/useClubs'

function posBadgeStyle(pos) {
  if (pos === 1) return { bg: '#7C3AED', text: '#fff' }
  if (pos === 2) return { bg: '#4B5563', text: '#fff' }
  if (pos === 3) return { bg: '#92400E', text: '#fff' }
  return { bg: 'transparent', text: '#6B7280' }
}

function WinDot({ result }) {
  if (result === 'W') return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Win" />
  if (result === 'L') return <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" title="Loss" />
  return <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" title="Draw" />
}

export default function StandingsTable({ rows }) {
  const homeClubId          = useAppStore((s) => s.homeClubId)
  const { data: clubs = [] } = useClubs()

  // Map club name → id so we can match homeClubId
  const clubIdByName = Object.fromEntries(clubs.map((c) => [c.name, c.id]))

  return (
    <div className="rounded-2xl border border-gaa-border overflow-hidden">
      {/* Header */}
      <div className="grid items-center border-b border-gaa-border px-3 py-2"
        style={{
          backgroundColor: '#1a1a1a',
          gridTemplateColumns: '28px 1fr 28px 28px 28px 36px',
          gap: '0 6px',
        }}
      >
        <span className="text-[10px] font-bold text-gaa-text-muted text-center">#</span>
        <span className="text-[10px] font-bold text-gaa-text-muted">Club · Diff</span>
        <span className="text-[10px] font-bold text-gaa-text-muted text-center">P</span>
        <span className="text-[10px] font-bold text-gaa-text-muted text-center">W</span>
        <span className="text-[10px] font-bold text-gaa-text-muted text-center">L</span>
        <span className="text-[10px] font-bold text-gaa-minor text-center">Pts</span>
      </div>

      {rows.map((row, i) => {
        const pos       = i + 1
        const badge     = posBadgeStyle(pos)
        const isMyClub  = homeClubId && clubIdByName[row.team] === homeClubId
        const diff      = row.for - row.against
        const diffStr   = diff > 0 ? `+${diff}` : `${diff}`
        const diffColor = diff > 0 ? '#34d399' : diff < 0 ? '#f87171' : '#9ca3af'

        return (
          <div
            key={row.team}
            className="grid items-center px-3 py-3 border-b border-gaa-border last:border-0 transition-colors"
            style={{
              backgroundColor: isMyClub ? '#2a2040' : i % 2 === 0 ? '#202020' : '#252525',
              gridTemplateColumns: '28px 1fr 28px 28px 28px 36px',
              gap: '0 6px',
              borderLeft: isMyClub ? '3px solid #7C3AED' : '3px solid transparent',
            }}
          >
            {/* Position */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black mx-auto shrink-0"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {pos}
            </div>

            {/* Club name + diff */}
            <div className="min-w-0">
              <p className={`text-sm truncate leading-tight ${isMyClub ? 'font-black text-gaa-text' : 'font-semibold text-gaa-text'}`}>
                {isMyClub && <span className="text-gaa-minor mr-1" aria-hidden="true">▶</span>}
                {row.team}
              </p>
              <p className="text-[10px] font-mono leading-none mt-0.5" style={{ color: diffColor }}>
                {diffStr}
              </p>
            </div>

            {/* P W L */}
            <span className="text-xs text-center text-gaa-text-muted">{row.played}</span>
            <span className="text-xs text-center text-emerald-400 font-semibold">{row.won}</span>
            <span className="text-xs text-center text-red-400 font-semibold">{row.lost}</span>

            {/* Points */}
            <div className="text-center">
              <span className="text-sm font-black text-gaa-text">{row.pts}</span>
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-2 border-t border-gaa-border"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <span className="text-[10px] text-gaa-text-muted">P = played</span>
        <span className="text-[10px] text-gaa-text-muted">W = won</span>
        <span className="text-[10px] text-gaa-text-muted">L = lost</span>
        <span className="text-[10px] text-gaa-minor font-bold">Pts = points</span>
      </div>
    </div>
  )
}
