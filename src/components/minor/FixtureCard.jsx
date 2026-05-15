import { MapPin, Clock } from 'lucide-react'

function formatDateTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

export default function FixtureCard({ game }) {
  return (
    <article
      className="flex bg-gaa-surface border border-gaa-border rounded-2xl mb-2 overflow-hidden shadow-sm"
      aria-label={`${game.home_team} vs ${game.away_team}`}
    >
      <div className="w-1.5 shrink-0 bg-gaa-minor" aria-hidden="true" />
      <div className="flex-1 p-3">
        <p className="text-[11px] font-bold text-gaa-minor mb-1">{game.competition_short}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm text-gaa-text truncate">{game.home_team}</span>
          <span className="text-[10px] text-gaa-text-muted font-bold shrink-0">vs</span>
          <span className="font-bold text-sm text-gaa-text truncate text-right">{game.away_team}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gaa-text-muted">
          <span className="flex items-center gap-0.5">
            <Clock size={9} aria-hidden="true" />
            {formatDateTime(game.start_time)}
          </span>
          {game.venue && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin size={9} aria-hidden="true" />
              {game.venue}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
