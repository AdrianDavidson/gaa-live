import { Link }        from 'react-router-dom'
import { MapPin }      from 'lucide-react'
import { useClubTheme } from '../../hooks/useClubTheme'
import { useAppStore }  from '../../store/appStore'

function formatDateTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

export default function ClubHeroCard({ nextGame }) {
  const theme      = useClubTheme()
  const homeClubId = useAppStore((s) => s.homeClubId)

  if (!homeClubId) {
    return (
      <Link
        to="/settings"
        className="block rounded-2xl bg-blue-50 border border-dashed border-blue-200 p-5 text-center"
      >
        <p className="text-sm font-bold text-blue-700 mb-1">Pick your club</p>
        <p className="text-xs text-blue-400">Get your next game right here →</p>
      </Link>
    )
  }

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden border"
      style={{
        background:   `linear-gradient(145deg, ${theme.primary}22 0%, ${theme.primary}08 100%)`,
        borderColor:  `${theme.primary}33`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {theme.crest && (
          <img src={theme.crest} alt="" className="w-8 h-8 object-contain rounded-full bg-white/50 p-0.5" aria-hidden="true" />
        )}
        <div>
          <p className="font-black text-sm text-gray-900">{theme.name}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {nextGame ? 'Next Game' : 'No upcoming fixtures'}
          </p>
        </div>
      </div>

      {nextGame ? (
        <>
          <p className="text-[11px] font-bold mb-3" style={{ color: theme.primary }}>
            {nextGame.competition_short}
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <p className="font-black text-sm text-gray-900 text-right truncate">{nextGame.home_team}</p>
            <div className="text-center px-2">
              <p className="text-xs font-bold text-gray-500">{formatDateTime(nextGame.start_time)}</p>
            </div>
            <p className="font-black text-sm text-gray-900 truncate">{nextGame.away_team}</p>
          </div>
          {nextGame.venue && (
            <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-3">
              <MapPin size={9} aria-hidden="true" />
              {nextGame.venue}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 text-center py-2">Check back soon for fixtures.</p>
      )}
    </div>
  )
}
