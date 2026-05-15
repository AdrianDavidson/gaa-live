import { MapPin } from 'lucide-react'
import { format }  from 'date-fns'

function parseTotal(score) {
  if (!score) return 0
  const [g = 0, p = 0] = score.split('-').map(Number)
  return g * 3 + p
}

function formatDate(ts) {
  if (!ts) return ''
  return format(new Date(ts), 'EEE d MMM yyyy')
}

export default function ResultCard({ game }) {
  const homeTotal = parseTotal(game.home_score)
  const awayTotal = parseTotal(game.away_score)
  const homeWon   = homeTotal > awayTotal
  const awayWon   = awayTotal > homeTotal

  return (
    <article
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-gaa-border"
      style={{ backgroundColor: '#252525' }}
      aria-label={`Result: ${game.home_team} ${game.home_score} ${game.away_team} ${game.away_score}`}
    >
      <div className="w-1.5 shrink-0 bg-gaa-minor" aria-hidden="true" />
      <div className="flex-1 p-3">

        {/* Competition + FT badge */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-gaa-minor">{game.competition_short}</p>
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            FT
          </span>
        </div>

        {/* Score rows */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate leading-tight flex-1 ${homeWon ? 'font-black text-gaa-text' : 'font-medium text-gaa-text-muted'}`}>
              {game.home_team}
            </span>
            <span className={`font-barlow text-2xl tabular-nums leading-none shrink-0 ${homeWon ? 'font-black text-gaa-amber' : 'font-bold text-gaa-text-muted'}`}>
              {game.home_score}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate leading-tight flex-1 ${awayWon ? 'font-black text-gaa-text' : 'font-medium text-gaa-text-muted'}`}>
              {game.away_team}
            </span>
            <span className={`font-barlow text-2xl tabular-nums leading-none shrink-0 ${awayWon ? 'font-black text-gaa-amber' : 'font-bold text-gaa-text-muted'}`}>
              {game.away_score}
            </span>
          </div>
        </div>

        {/* Date + venue */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-gaa-text-muted">
          <span>{formatDate(game.start_time)}</span>
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
