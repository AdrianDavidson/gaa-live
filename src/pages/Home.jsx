import { Link }             from 'react-router-dom'
import { Trophy }            from 'lucide-react'
import PageWrapper           from '../components/layout/PageWrapper'
import Spinner               from '../components/ui/Spinner'
import CodeIcon              from '../components/ui/CodeIcon'
import CodeSidebar           from '../components/ui/CodeSidebar'
import { useAppStore }       from '../store/appStore'
import { useGAAData }        from '../hooks/useFixtures'
import { useCodeFilter }     from '../contexts/CodeFilterContext'
import { formatMatchDate }   from '../utils/formatters'
import { isMatchWindow }     from '../utils/matchStatus'
import { winnerGradient }    from '../utils/countyColours'

function HeroFixture({ fixture }) {
  return (
    <div className="bg-gaa-green text-white rounded-2xl p-5 mb-5">
      <p className="text-xs font-bold text-green-200 mb-1 uppercase tracking-wide flex items-center gap-1">
        <CodeIcon code={fixture.code} size={12} colorClass="text-green-200" />
        {fixture.competitionShort ?? fixture.competition}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p className="font-black text-lg flex-1 text-center">{fixture.homeTeam}</p>
        <div className="text-center shrink-0">
          {fixture.homeScore ? (
            <div>
              <p className="text-2xl font-black tabular-nums">
                {fixture.homeScore.gp}–{fixture.awayScore?.gp}
              </p>
              <p className="text-xs text-green-200">Full time</p>
            </div>
          ) : (
            <p className="text-sm text-green-200">{formatMatchDate(fixture.startDate)}</p>
          )}
        </div>
        <p className="font-black text-lg flex-1 text-center">{fixture.awayTeam}</p>
      </div>
      {fixture.venue && (
        <p className="text-xs text-green-300 text-center mt-2">{fixture.venue}</p>
      )}
    </div>
  )
}

function MiniResultCard({ fixture }) {
  const homeWin  = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin  = fixture.awayScore?.total > fixture.homeScore?.total
  const bgImage  = winnerGradient(fixture.homeTeam, fixture.awayTeam, homeWin, awayWin)
  const showIcon = !bgImage && (homeWin || awayWin)

  return (
    <article
      className="flex bg-white border border-gray-200 rounded-xl mb-2 overflow-hidden"
      aria-label={`${fixture.homeTeam} vs ${fixture.awayTeam}`}
    >
      <CodeSidebar code={fixture.code} />
      <div
        className="flex-1 p-3 min-w-0"
        style={bgImage ? { backgroundImage: bgImage } : undefined}
      >
        <p className="text-xs text-gaa-green font-bold mb-1 truncate flex items-center gap-1">
          <CodeIcon code={fixture.code} size={11} className="shrink-0" />
          {fixture.competitionShort}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
          <p className="text-sm font-bold text-right truncate text-gray-900">{fixture.homeTeam}</p>
          <div className="text-center px-1 flex items-center gap-0.5">
            {showIcon && homeWin && <Trophy size={11} className="text-gaa-green shrink-0" />}
            <span className="text-base font-black tabular-nums text-gray-800">{fixture.homeScore?.gp}</span>
            <span className="text-gray-300 mx-0.5">–</span>
            <span className="text-base font-black tabular-nums text-gray-800">{fixture.awayScore?.gp}</span>
            {showIcon && awayWin && <Trophy size={11} className="text-gaa-green shrink-0" />}
          </div>
          <p className="text-sm font-bold text-left truncate text-gray-900">{fixture.awayTeam}</p>
        </div>
      </div>
    </article>
  )
}

function MiniFixtureCard({ fixture }) {
  return (
    <article
      className="flex bg-white border border-gray-200 rounded-xl mb-2 overflow-hidden"
      aria-label={`${fixture.homeTeam} vs ${fixture.awayTeam}`}
    >
      <CodeSidebar code={fixture.code} />
      <div className="flex-1 p-3 min-w-0">
        <p className="text-xs text-gaa-green font-bold mb-1 flex items-center gap-1 truncate">
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

export default function Home() {
  const { favouriteCounty } = useAppStore()
  const { data, isLoading } = useGAAData()
  const { filter }          = useCodeFilter()

  const allFixtures = data?.fixtures ?? []
  const allResults  = data?.results  ?? []

  const fixtures = filter === 'all' ? allFixtures : allFixtures.filter((f) => f.code === filter)
  const results  = filter === 'all' ? allResults  : allResults.filter((f)  => f.code === filter)

  const nextFixture = favouriteCounty
    ? fixtures.find((f) =>
        f.homeTeam.toLowerCase().includes(favouriteCounty.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(favouriteCounty.toLowerCase())
      ) ?? fixtures[0]
    : fixtures[0]

  const liveNow       = fixtures.filter((f) => isMatchWindow(f))
  const recentResults = results.slice(0, 5)

  return (
    <PageWrapper>
      {isLoading && <Spinner label="Loading GAA data…" />}

      {!isLoading && (
        <>
          {nextFixture && <HeroFixture fixture={nextFixture} />}

          {liveNow.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                  In Progress
                </h2>
                <Link to="/live" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">See all →</Link>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Live in-game scores aren&apos;t available yet — the result will appear once the match ends.
              </p>
              {liveNow.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {fixtures.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900">Upcoming</h2>
                <Link to="/fixtures" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">All fixtures →</Link>
              </div>
              {fixtures.slice(0, 3).map((f) => <MiniFixtureCard key={f.id} fixture={f} />)}
            </section>
          )}

          {recentResults.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900">Recent Results</h2>
                <Link to="/results" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">All results →</Link>
              </div>
              {recentResults.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {!nextFixture && !recentResults.length && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-base">Loading GAA data…</p>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
