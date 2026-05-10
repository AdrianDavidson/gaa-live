import PageWrapper       from '../components/layout/PageWrapper'
import Spinner           from '../components/ui/Spinner'
import CodeSidebar       from '../components/ui/CodeSidebar'
import CodeIcon          from '../components/ui/CodeIcon'
import CountyColourBadge from '../components/ui/CountyColourBadge'
import { Trophy, MapPin } from 'lucide-react'
import { useGAAData, useResults } from '../hooks/useFixtures'
import { formatMatchDate }        from '../utils/formatters'
import { winnerGradient }         from '../utils/countyColours'

function MiniResultCard({ fixture }) {
  const homeWin = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin = fixture.awayScore?.total > fixture.homeScore?.total
  const bgImage = winnerGradient(fixture.homeTeam, fixture.awayTeam, homeWin, awayWin)
  return (
    <article
      className="flex bg-white border border-gray-100 rounded-2xl mb-2 overflow-hidden shadow-sm"
      aria-label={`${fixture.homeTeam} vs ${fixture.awayTeam}`}
    >
      <CodeSidebar code={fixture.code} />
      <div className="flex-1 p-3 min-w-0" style={bgImage ? { backgroundImage: bgImage } : undefined}>
        <p className="text-xs text-gaa-green font-bold mb-1 truncate flex items-center gap-1">
          <CodeIcon code={fixture.code} size={11} className="shrink-0" />
          {fixture.competitionShort}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
          <p className="text-sm font-bold text-right truncate">{fixture.homeTeam}</p>
          <div className="text-center px-1 flex items-center gap-0.5">
            {homeWin && <Trophy size={10} className="text-gaa-green shrink-0" />}
            <span className="text-base font-black tabular-nums">
              {fixture.homeScore ? (fixture.homeScore.gp ?? fixture.homeScore.total) : '–'}
            </span>
            <span className="text-gray-300 mx-0.5">–</span>
            <span className="text-base font-black tabular-nums">
              {fixture.awayScore ? (fixture.awayScore.gp ?? fixture.awayScore.total) : '–'}
            </span>
            {awayWin && <Trophy size={10} className="text-gaa-green shrink-0" />}
          </div>
          <p className="text-sm font-bold truncate">{fixture.awayTeam}</p>
        </div>
      </div>
    </article>
  )
}

function MiniFixtureCard({ fixture }) {
  return (
    <article
      className="flex bg-white border border-gray-100 rounded-2xl mb-2 overflow-hidden shadow-sm"
      aria-label={`${fixture.homeTeam} vs ${fixture.awayTeam}`}
    >
      <CodeSidebar code={fixture.code} />
      <div className="flex-1 p-3 min-w-0">
        <p className="text-xs text-gaa-green font-bold mb-1 truncate flex items-center gap-1">
          <CodeIcon code={fixture.code} size={11} className="shrink-0" />
          {fixture.competitionShort}
        </p>
        <div className="flex items-center justify-between font-bold gap-2">
          <span className="text-sm truncate">{fixture.homeTeam}</span>
          <span className="text-xs text-gray-400 font-normal shrink-0">{formatMatchDate(fixture.startDate)}</span>
          <span className="text-sm truncate text-right">{fixture.awayTeam}</span>
        </div>
      </div>
    </article>
  )
}

export default function Senior() {
  const { data: gaaData, isLoading } = useGAAData()
  const { data: results }            = useResults()
  const fixtures = gaaData?.fixtures ?? []
  const recent   = results.slice(0, 10)

  return (
    <PageWrapper title="Senior County Hurling">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800">
        Powered by TheSportsDB — supplementary data for senior county hurling.
      </div>

      {isLoading && <Spinner label="Loading senior data…" />}

      {recent.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Recent Results</h2>
          {recent.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
        </section>
      )}

      {fixtures.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">Upcoming Fixtures</h2>
          {fixtures.slice(0, 10).map((f) => <MiniFixtureCard key={f.id} fixture={f} />)}
        </section>
      )}

      {!isLoading && !recent.length && !fixtures.length && (
        <p className="text-center text-gray-400 text-sm py-10">No senior data available.</p>
      )}
    </PageWrapper>
  )
}
