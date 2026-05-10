import { MapPin }   from 'lucide-react'
import LiveBadge     from './LiveBadge'

function ScoreRow({ game }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-2">
      <div className="text-right">
        {game.home_crest && (
          <img src={game.home_crest} alt="" className="w-5 h-5 object-contain inline-block mr-1 rounded-sm" aria-hidden="true" />
        )}
        <span className="font-bold text-sm text-gray-900">{game.home_team}</span>
        {game.home_score && (
          <p className="text-xl font-black tabular-nums text-gaa-minor mt-0.5">{game.home_score}</p>
        )}
      </div>

      <div className="text-center text-gray-300 font-black text-lg px-1">
        {game.home_score ? '–' : <span className="text-xs font-bold text-gray-500">{formatTime(game.start_time)}</span>}
        {game.period && <p className="text-[10px] font-black text-gaa-minor uppercase mt-0.5">{game.period}</p>}
      </div>

      <div className="text-left">
        {game.away_crest && (
          <img src={game.away_crest} alt="" className="w-5 h-5 object-contain inline-block mr-1 rounded-sm" aria-hidden="true" />
        )}
        <span className="font-bold text-sm text-gray-900">{game.away_team}</span>
        {game.away_score && (
          <p className="text-xl font-black tabular-nums text-gaa-minor mt-0.5">{game.away_score}</p>
        )}
      </div>
    </div>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

export default function MinorGameCard({ game }) {
  return (
    <article
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-purple-200"
      style={{ backgroundColor: '#F3EFFE' }}
      aria-label={`${game.home_team} vs ${game.away_team}`}
    >
      <div className="w-2 shrink-0 bg-gaa-minor" aria-hidden="true" />
      <div className="flex-1 p-3">
        <LiveBadge period={game.period} />
        <p className="text-[11px] font-bold text-gaa-minor mt-1 mb-1">{game.competition_short}</p>
        <ScoreRow game={game} />
        {game.venue && (
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <MapPin size={9} aria-hidden="true" />
            {game.venue}
          </p>
        )}
      </div>
    </article>
  )
}
