import { useRef, useState, useEffect } from 'react'
import { MapPin }                       from 'lucide-react'
import LiveBadge                        from './LiveBadge'

function parseGoals(score) {
  if (!score) return 0
  return parseInt(score.split('-')[0], 10) || 0
}

function AnimatedScore({ score }) {
  const prevRef = useRef(score)
  const [cls, setCls] = useState('')

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = score
    if (!prev || prev === score) return
    const wasGoal = parseGoals(score) > parseGoals(prev)
    setCls(wasGoal ? 'animate-goal-flash rounded-md' : 'animate-score-flash')
    const id = setTimeout(() => setCls(''), 900)
    return () => clearTimeout(id)
  }, [score])

  return (
    <span className={`font-barlow text-2xl font-black tabular-nums leading-none shrink-0 text-gaa-text ${cls}`}>
      {score}
    </span>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

function CardPips({ cards }) {
  if (!cards) return null
  const { yellow = 0, red = 0, black = 0 } = cards
  if (!yellow && !red && !black) return null
  return (
    <div className="flex items-center gap-0.5 ml-1.5 shrink-0" aria-label="Cards">
      {yellow > 0 && (
        <span className="text-[9px] font-black leading-none px-1 py-0.5 rounded" style={{ backgroundColor: '#fde047', color: '#713f12' }}>
          {yellow}Y
        </span>
      )}
      {red > 0 && (
        <span className="text-[9px] font-black leading-none px-1 py-0.5 rounded bg-red-700 text-white">
          {red}R
        </span>
      )}
      {black > 0 && (
        <span className="text-[9px] font-black leading-none px-1 py-0.5 rounded bg-gray-700 text-white">
          {black}B
        </span>
      )}
    </div>
  )
}

export default function MinorGameCard({ game }) {
  const hasScores  = !!(game.home_score || game.away_score)
  const homeCards  = game.cards?.home ?? null
  const awayCards  = game.cards?.away ?? null

  return (
    <article
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-gaa-border"
      style={{ backgroundColor: '#252525' }}
      aria-label={`${game.home_team} vs ${game.away_team}`}
    >
      <div className="w-1.5 shrink-0 bg-gaa-minor" aria-hidden="true" />
      <div className="flex-1 p-3">

        {/* Badge + competition */}
        <div className="flex items-center justify-between mb-2">
          <LiveBadge period={game.period} />
          <span className="text-[10px] font-bold text-gaa-minor">{game.competition_short}</span>
        </div>

        {/* Score rows */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {game.home_crest && (
                <img src={game.home_crest} alt="" className="w-4 h-4 object-contain rounded-sm shrink-0" aria-hidden="true" />
              )}
              <span className="font-semibold text-sm text-gaa-text truncate">{game.home_team}</span>
              <CardPips cards={homeCards} />
            </div>
            {hasScores
              ? <AnimatedScore score={game.home_score} />
              : <span className="text-xs text-gaa-text-muted shrink-0">{formatTime(game.start_time)}</span>
            }
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {game.away_crest && (
                <img src={game.away_crest} alt="" className="w-4 h-4 object-contain rounded-sm shrink-0" aria-hidden="true" />
              )}
              <span className="font-semibold text-sm text-gaa-text truncate">{game.away_team}</span>
              <CardPips cards={awayCards} />
            </div>
            {hasScores && <AnimatedScore score={game.away_score} />}
          </div>
        </div>

        {game.venue && (
          <p className="text-[10px] text-gaa-text-muted mt-2 flex items-center gap-1">
            <MapPin size={9} aria-hidden="true" />
            {game.venue}
          </p>
        )}
      </div>
    </article>
  )
}
