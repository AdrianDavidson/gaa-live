import PageWrapper    from '../components/layout/PageWrapper'
import MatchList      from '../components/scores/MatchList'
import { LIVE_FIXTURES } from '../data/mockFixtures'
import { DATA_TIERS } from '../services/dataTierResolver'
import { useMatchData } from '../hooks/useMatchData'
import EmbedPlayer    from '../components/streams/EmbedPlayer'
import Spinner        from '../components/ui/Spinner'

function WatchCard({ fixture }) {
  const { data: tierData, isLoading } = useMatchData(fixture)
  if (isLoading) return <Spinner />
  if (tierData?.tier !== DATA_TIERS.STREAM || !tierData?.streamData) return null

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <p className="font-bold text-lg mb-3">
        {fixture.homeTeam} v {fixture.awayTeam}
      </p>
      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
        {fixture.competition}
      </p>
      <EmbedPlayer stream={tierData.streamData} />
    </article>
  )
}

export default function Watch() {
  return (
    <PageWrapper title="Watch Free">
      <p className="text-sm text-gray-500 mb-4">
        GAA Live links to free, publicly available streams. We do not host video.
      </p>

      {LIVE_FIXTURES.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl font-black text-gray-400 mb-2">Nothing live right now</p>
          <p className="text-base text-gray-500">
            Check the Fixtures tab to see what's coming up.
          </p>
        </div>
      ) : (
        LIVE_FIXTURES.map((fixture) => (
          <WatchCard key={fixture.id} fixture={fixture} />
        ))
      )}
    </PageWrapper>
  )
}
