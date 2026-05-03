import { useMatchData }         from '../../hooks/useMatchData'
import { DATA_TIERS }           from '../../services/dataTierResolver'
import TierBadge                from '../data-tier/TierBadge'
import UnavailableNotice        from '../data-tier/UnavailableNotice'
import DataSourceNotice         from '../data-tier/DataSourceNotice'
import EmbedPlayer              from '../streams/EmbedPlayer'
import { getElapsedMinutes, formatTimeAgo } from '../../utils/matchStatus'
import { formatMatchDate }      from '../../utils/formatters'

function ScoreCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 animate-pulse" aria-hidden="true">
      <div className="flex justify-between mb-3">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-24 bg-gray-200 rounded flex-1" />
        <div className="h-8 w-20 bg-gray-200 rounded mx-4" />
        <div className="h-5 w-24 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  )
}

export default function ScoreCard({ fixture }) {
  const { data: tierData, isLoading } = useMatchData(fixture)

  if (isLoading) return <ScoreCardSkeleton />

  const { tier, streamData, scoreData } = tierData

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {fixture.competition}
          </span>
          {fixture.tvChannel && (
            <span className="ml-2 text-xs font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              {fixture.tvChannel}
            </span>
          )}
        </div>
        <TierBadge tier={tier} />
      </div>

      <div
        className="flex items-center justify-between gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex-1 text-center font-bold text-lg">{fixture.homeTeam}</div>

        <div className="text-center min-w-[100px]">
          {tier === DATA_TIERS.STREAM && (
            <div className="text-sm font-bold text-gaa-green">Streaming now</div>
          )}
          {tier === DATA_TIERS.LIVE && scoreData && (
            <>
              <div className="text-3xl font-black tabular-nums">
                {scoreData.homeScore} · {scoreData.awayScore}
              </div>
              <div className="text-xs text-gaa-live font-bold mt-1">
                {getElapsedMinutes(fixture)}' (est.)
              </div>
            </>
          )}
          {tier === DATA_TIERS.POLLED && scoreData && (
            <>
              <div className="text-base font-bold">{scoreData.title}</div>
              <div className="text-xs text-amber-600 mt-1">
                Updated {formatTimeAgo(scoreData.fetchedAt)}
              </div>
            </>
          )}
          {tier === DATA_TIERS.NONE && (
            <div className="text-sm text-gray-400 font-bold">
              {formatMatchDate(fixture.startDate)}
            </div>
          )}
        </div>

        <div className="flex-1 text-center font-bold text-lg">{fixture.awayTeam}</div>
      </div>

      {tier === DATA_TIERS.STREAM && streamData && (
        <div className="mt-3">
          <EmbedPlayer stream={streamData} />
        </div>
      )}

      {tier === DATA_TIERS.POLLED && scoreData && (
        <DataSourceNotice source={scoreData.source} />
      )}

      {tier === DATA_TIERS.NONE && (
        <UnavailableNotice fixture={fixture} />
      )}
    </article>
  )
}
