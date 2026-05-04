import { useState }          from 'react'
import PageWrapper             from '../components/layout/PageWrapper'
import Spinner                 from '../components/ui/Spinner'
import CountyColourBadge       from '../components/ui/CountyColourBadge'
import { useResults }          from '../hooks/useFixtures'
import { COMPETITION_GROUPS }  from '../data/competitions'
import { formatMatchDate }     from '../utils/formatters'

function teamColour(isWinner, isLoser) {
  if (isWinner) return 'text-gaa-green'
  if (isLoser)  return 'text-red-600'
  return 'text-gray-800'
}

function scoreColour(isWinner, isLoser) {
  if (isWinner) return 'text-gaa-green'
  if (isLoser)  return 'text-red-500'
  return 'text-gray-700'
}

function ResultCard({ fixture }) {
  const homeWin = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin = fixture.awayScore?.total > fixture.homeScore?.total

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      aria-label={`Result: ${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gaa-green uppercase tracking-wide">
          {fixture.competitionShort ?? fixture.competition}
        </span>
        <span className="text-xs text-gray-400">{formatMatchDate(fixture.startDate)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        {/* Home team */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-0.5">
            <p className={`font-bold text-base leading-tight ${teamColour(homeWin, awayWin)}`}>
              {fixture.homeTeam}
            </p>
            <CountyColourBadge teamName={fixture.homeTeam} />
          </div>
          {fixture.homeScore && (
            <p className={`text-xl font-black tabular-nums ${scoreColour(homeWin, awayWin)}`}>
              {fixture.homeScore.gp}
              <span className="text-sm font-bold ml-1 opacity-70">({fixture.homeScore.total})</span>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="text-center text-gray-300 font-bold text-lg px-1 pt-1">–</div>

        {/* Away team */}
        <div className="text-left">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CountyColourBadge teamName={fixture.awayTeam} />
            <p className={`font-bold text-base leading-tight ${teamColour(awayWin, homeWin)}`}>
              {fixture.awayTeam}
            </p>
          </div>
          {fixture.awayScore && (
            <p className={`text-xl font-black tabular-nums ${scoreColour(awayWin, homeWin)}`}>
              {fixture.awayScore.gp}
              <span className="text-sm font-bold ml-1 opacity-70">({fixture.awayScore.total})</span>
            </p>
          )}
        </div>
      </div>

      {fixture.venue && (
        <p className="text-xs text-gray-400 text-center mt-2">{fixture.venue}</p>
      )}
    </article>
  )
}

export default function Results() {
  const [groupFilter, setGroupFilter] = useState('all')
  const { data: results, isLoading, isError, dataUpdatedAt } = useResults()

  const filtered = results.filter(
    (f) => groupFilter === 'all' || f.group === groupFilter
  )

  // Group by competition for easy browsing
  const byCompetition = filtered.reduce((acc, f) => {
    const key = f.competition
    if (!acc[key]) acc[key] = { short: f.competitionShort, items: [] }
    acc[key].items.push(f)
    return acc
  }, {})

  return (
    <PageWrapper title="Hurling Results">

      {/* Group filter */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4"
        role="tablist"
        aria-label="Competition filter"
      >
        {COMPETITION_GROUPS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={groupFilter === id}
            onClick={() => setGroupFilter(id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold min-h-[36px] border transition-colors ${
              groupFilter === id
                ? 'bg-gaa-green text-white border-gaa-green'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner label="Loading results…" />}

      {isError && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Couldn't load results. Check your connection and try again.
        </div>
      )}

      {!isLoading && Object.entries(byCompetition).length === 0 && (
        <p className="text-center text-gray-500 text-base py-8">
          No results found. Results appear here after games are played.
        </p>
      )}

      {Object.entries(byCompetition).map(([competitionName, group]) => (
        <section key={competitionName} className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
            {competitionName}
          </h2>
          {group.items.map((f) => <ResultCard key={f.id} fixture={f} />)}
        </section>
      ))}

      {dataUpdatedAt && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Source: TheSportsDB · Data updated{' '}
          {new Date(dataUpdatedAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </PageWrapper>
  )
}
