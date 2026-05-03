import { Link }          from 'react-router-dom'
import PageWrapper        from '../components/layout/PageWrapper'
import MatchList          from '../components/scores/MatchList'
import { useAppStore }    from '../store/appStore'
import { TODAY_FIXTURES, LIVE_FIXTURES } from '../data/mockFixtures'
import { formatMatchDate } from '../utils/formatters'

export default function Home() {
  const { favouriteCounty } = useAppStore()

  const nextFixture = TODAY_FIXTURES.find(
    (f) =>
      favouriteCounty &&
      (f.homeTeam.toLowerCase().includes(favouriteCounty.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(favouriteCounty.toLowerCase()))
  ) ?? TODAY_FIXTURES[0]

  return (
    <PageWrapper>
      {/* Hero — next fixture */}
      {nextFixture && (
        <div className="bg-gaa-green text-white rounded-2xl p-5 mb-5">
          <p className="text-sm font-medium text-green-200 mb-1">
            {favouriteCounty ? `Next ${favouriteCounty} match` : 'Coming up'}
          </p>
          <p className="text-xl font-black">
            {nextFixture.homeTeam} <span className="font-normal">v</span>{' '}
            {nextFixture.awayTeam}
          </p>
          <p className="text-sm text-green-200 mt-1">
            {formatMatchDate(nextFixture.startDate)} · {nextFixture.venue}
          </p>
          <p className="text-xs text-green-300 mt-0.5">{nextFixture.competition}</p>
        </div>
      )}

      {/* Live now strip */}
      {LIVE_FIXTURES.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
              Live Now
            </h2>
            <Link to="/live" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">
              See all →
            </Link>
          </div>
          <MatchList fixtures={LIVE_FIXTURES} />
        </div>
      )}

      {/* Today's fixtures */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-black text-gray-900">Today's Games</h2>
          <Link to="/fixtures" className="text-sm font-bold text-gaa-green min-h-[44px] flex items-center">
            All fixtures →
          </Link>
        </div>
        <MatchList
          fixtures={TODAY_FIXTURES}
          emptyMessage="No games today. Check the Fixtures tab for what's coming up."
        />
      </div>
    </PageWrapper>
  )
}
