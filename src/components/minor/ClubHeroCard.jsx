import { Link }         from 'react-router-dom'
import { MapPin }        from 'lucide-react'
import { useClubTheme }  from '../../hooks/useClubTheme'
import { useAppStore }   from '../../store/appStore'

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
        className="block rounded-2xl bg-gaa-surface border border-dashed border-gaa-border p-5 text-center"
      >
        <p className="text-sm font-bold text-gaa-text mb-1">Pick your club</p>
        <p className="text-xs text-gaa-text-muted">Get your next game right here →</p>
      </Link>
    )
  }

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden border border-gaa-border"
      style={{
        background: theme.primary
          ? `linear-gradient(145deg, ${theme.primary}28 0%, #1a1a1a 60%)`
          : '#252525',
        borderColor: theme.primary ? `${theme.primary}40` : '#2e2e2e',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {theme.crest
          ? <img src={theme.crest} alt="" className="w-8 h-8 object-contain rounded-full bg-white/10 p-0.5 shrink-0" aria-hidden="true" />
          : <div className="w-8 h-8 rounded-full bg-gaa-surface-raised shrink-0" aria-hidden="true" />
        }
        <div>
          <p className="font-black text-sm text-gaa-text">{theme.name}</p>
          <p className="text-[10px] font-bold text-gaa-text-muted uppercase tracking-widest">
            {nextGame ? 'Next Game' : 'No upcoming fixtures'}
          </p>
        </div>
      </div>

      {nextGame ? (
        <>
          <p className="text-[11px] font-bold mb-3 text-gaa-minor">
            {nextGame.competition_short}
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <p className="font-black text-sm text-gaa-text text-right truncate">{nextGame.home_team}</p>
            <div className="text-center px-2">
              <p className="text-xs font-bold text-gaa-text-muted">{formatDateTime(nextGame.start_time)}</p>
            </div>
            <p className="font-black text-sm text-gaa-text truncate">{nextGame.away_team}</p>
          </div>
          {nextGame.venue && (
            <p className="text-[10px] text-gaa-text-muted flex items-center justify-center gap-1 mt-3">
              <MapPin size={9} aria-hidden="true" />
              {nextGame.venue}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gaa-text-muted text-center py-2">Check back soon for fixtures.</p>
      )}
    </div>
  )
}
