import { useState, useEffect } from 'react'
import PageWrapper              from '../components/layout/PageWrapper'
import Spinner                  from '../components/ui/Spinner'
import { useHurlingData }       from '../hooks/useFixtures'
import { isMatchWindow }        from '../utils/matchStatus'
import { formatMatchDate }      from '../utils/formatters'

function LiveCard({ fixture }) {
  const homeWin = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin = fixture.awayScore?.total > fixture.homeScore?.total

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      aria-live="polite"
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
        <span className="text-xs font-bold text-red-600 uppercase">In Progress (est.)</span>
        <span className="ml-auto text-xs text-gray-400">{fixture.competitionShort}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <p className={`font-bold text-lg text-right ${homeWin ? 'text-gaa-green' : ''}`}>{fixture.homeTeam}</p>
        <div className="text-center min-w-[80px]">
          {fixture.homeScore ? (
            <>
              <p className="text-xs text-gray-400 mb-0.5">Last known score</p>
              <p className="text-base font-black tabular-nums">
                {fixture.homeScore.gp} – {fixture.awayScore?.gp}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">{formatMatchDate(fixture.startDate)}</p>
          )}
        </div>
        <p className={`font-bold text-lg text-left ${awayWin ? 'text-gaa-green' : ''}`}>{fixture.awayTeam}</p>
      </div>

      {fixture.venue && (
        <p className="text-xs text-gray-400 text-center mt-2">{fixture.venue}</p>
      )}
    </article>
  )
}

export default function LiveScores() {
  const [secondsAgo, setSecondsAgo] = useState(0)
  const { data, isLoading, dataUpdatedAt } = useHurlingData()

  useEffect(() => {
    setSecondsAgo(0)
    const id = setInterval(() => setSecondsAgo((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [dataUpdatedAt])

  const allFixtures = [...(data?.fixtures ?? []), ...(data?.results ?? [])]
  const liveNow     = allFixtures.filter((f) => isMatchWindow(f))

  return (
    <PageWrapper title="Live Scores">
      <p className="text-sm text-gray-500 mb-4" aria-live="polite">
        {dataUpdatedAt
          ? `Data refreshed ${secondsAgo}s ago`
          : 'Loading…'}
      </p>

      {isLoading && <Spinner label="Checking for live games…" />}

      <div aria-live="polite">
        {!isLoading && liveNow.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">⚽</p>
            <p className="text-lg font-bold text-gray-500 mb-1">No live hurling right now</p>
            <p className="text-sm text-gray-400">
              Live scores appear here during match windows (30 min before kick-off to 110 min after).
            </p>
          </div>
        )}
        {liveNow.map((f) => <LiveCard key={f.id} fixture={f} />)}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-bold text-amber-800 mb-1">About live scores</p>
        <p className="text-xs text-amber-700">
          Real-time scores require the Score Beo / Foireann partnership (Tier 2). Currently showing
          match windows based on TheSportsDB fixture times. Scores update when TheSportsDB publishes
          them (typically shortly after full time).
        </p>
      </div>
    </PageWrapper>
  )
}
