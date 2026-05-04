import { Link }             from 'react-router-dom'
import PageWrapper           from '../components/layout/PageWrapper'
import Spinner               from '../components/ui/Spinner'
import GAAScore              from '../components/scores/GAAScore'
import { useAppStore }       from '../store/appStore'
import { useHurlingData }    from '../hooks/useFixtures'
import { formatMatchDate }   from '../utils/formatters'
import { isMatchWindow }     from '../utils/matchStatus'

function HeroFixture({ fixture }) {
  return (
    <div className="bg-gaa-green text-white rounded-2xl p-5 mb-5">
      <p className="text-xs font-bold text-green-200 mb-1 uppercase tracking-wide">
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
  const homeWin = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin = fixture.awayScore?.total > fixture.homeScore?.total
  return (
    <article className="bg-white border border-gray-200 rounded-xl p-3 mb-2">
      <p className="text-xs text-gaa-green font-bold mb-1 truncate">
        {fixture.competitionShort}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
        <p className={`text-sm font-bold text-right truncate ${homeWin ? 'text-gaa-green' : ''}`}>
          {fixture.homeTeam}
        </p>
        <div className="text-center px-1">
          <span className={`text-base font-black tabular-nums ${homeWin ? 'text-gaa-green' : 'text-gray-700'}`}>
            {fixture.homeScore?.gp}
          </span>
          <span className="text-gray-300 mx-0.5">–</span>
          <span className={`text-base font-black tabular-nums ${awayWin ? 'text-gaa-green' : 'text-gray-700'}`}>
            {fixture.awayScore?.gp}
          </span>
        </div>
        <p className={`text-sm font-bold text-left truncate ${awayWin ? 'text-gaa-green' : ''}`}>
          {fixture.awayTeam}
        </p>
      </div>
    </article>
  )
}

export default function Home() {
  const { favouriteCounty } = useAppStore()
  const { data, isLoading } = useHurlingData()

  const fixtures = data?.fixtures ?? []
  const results  = data?.results  ?? []

  // Next fixture — prefer favourite county if set
  const nextFixture = favouriteCounty
    ? fixtures.find((f) =>
        f.homeTeam.toLowerCase().includes(favouriteCounty.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(favouriteCounty.toLowerCase())
      ) ?? fixtures[0]
    : fixtures[0]

  // Live right now
  const liveNow = fixtures.filter((f) => isMatchWindow(f))

  // Recent results (last 5)
  const recentResults = results.slice(0, 5)

  return (
    <PageWrapper>
      {isLoading && <Spinner label="Loading GAA data…" />}

      {!isLoading && (
        <>
          {/* Hero — next fixture */}
          {nextFixture && <HeroFixture fixture={nextFixture} />}

          {/* Live now */}
          {liveNow.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                  In Progress
                </h2>
                <Link to="/live" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">
                  See all →
                </Link>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Live in-game scores aren&apos;t available yet — the result will appear once the match ends.
              </p>
              {liveNow.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {/* Upcoming fixtures */}
          {fixtures.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900">Upcoming</h2>
                <Link to="/fixtures" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">
                  All fixtures →
                </Link>
              </div>
              {fixtures.slice(0, 3).map((f) => (
                <article key={f.id} className="bg-white border border-gray-200 rounded-xl p-3 mb-2">
                  <p className="text-xs text-gaa-green font-bold mb-1">{f.competitionShort}</p>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sm">{f.homeTeam}</span>
                    <span className="text-xs text-gray-400 font-normal">{formatMatchDate(f.startDate)}</span>
                    <span className="text-sm">{f.awayTeam}</span>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Recent results */}
          {recentResults.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900">Recent Results</h2>
                <Link to="/results" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">
                  All results →
                </Link>
              </div>
              {recentResults.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {!nextFixture && !recentResults.length && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-base">Loading hurling data…</p>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
