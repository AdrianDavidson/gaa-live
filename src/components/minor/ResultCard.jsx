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
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-purple-100"
      style={{ backgroundColor: '#F9F7FF' }}
      aria-label={`Result: ${game.home_team} ${game.home_score} ${game.away_team} ${game.away_score}`}
    >
      <div className="w-2 shrink-0 bg-gaa-minor" aria-hidden="true" />
      <div className="flex-1 p-3">

        {/* Competition + FT badge */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-gaa-minor">{game.competition_short}</p>
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            FT
          </span>
        </div>

        {/* Score row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">

          {/* Home */}
          <div className="text-right">
            <p className={`text-sm leading-tight ${homeWon ? 'font-black text-gray-900' : 'font-medium text-gray-400'}`}>
              {game.home_team}
            </p>
            <p className={`text-2xl tabular-nums leading-tight mt-0.5 ${homeWon ? 'font-black text-gaa-minor' : 'font-bold text-gray-300'}`}>
              {game.home_score}
            </p>
          </div>

          {/* Dash */}
          <div className="text-gray-300 font-black text-xl px-2 self-end pb-0.5" aria-hidden="true">–</div>

          {/* Away */}
          <div className="text-left">
            <p className={`text-sm leading-tight ${awayWon ? 'font-black text-gray-900' : 'font-medium text-gray-400'}`}>
              {game.away_team}
            </p>
            <p className={`text-2xl tabular-nums leading-tight mt-0.5 ${awayWon ? 'font-black text-gaa-minor' : 'font-bold text-gray-300'}`}>
              {game.away_score}
            </p>
          </div>
        </div>

        {/* Date + venue */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
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
