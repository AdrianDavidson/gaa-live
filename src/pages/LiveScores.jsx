import { useState, useEffect }                    from 'react'
import PageWrapper                                  from '../components/layout/PageWrapper'
import Spinner                                      from '../components/ui/Spinner'
import CountyColourBadge                            from '../components/ui/CountyColourBadge'
import { useHurlingData }                           from '../hooks/useFixtures'
import { useLiveRss, filterRssForMatch, SOURCE_LABELS } from '../hooks/useLiveRss'
import { isMatchWindow, getElapsedMinutes, formatTimeAgo } from '../utils/matchStatus'
import { formatMatchDate }                          from '../utils/formatters'

// ─── Match card ────────────────────────────────────────────────────────────

function LiveCard({ fixture, rssItems }) {
  const homeWin = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin = fixture.awayScore?.total > fixture.homeScore?.total
  const elapsed = getElapsedMinutes(fixture)

  const relevant = rssItems?.length
    ? filterRssForMatch(rssItems, fixture.homeTeam, fixture.awayTeam)
    : []

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      aria-live="polite"
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
        <span className="text-xs font-bold text-red-600 uppercase">
          In Progress — {elapsed}&apos; (est.)
        </span>
        <span className="ml-auto text-xs text-gray-400">{fixture.competitionShort}</span>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className={`flex items-center justify-end gap-1.5 font-bold text-lg ${homeWin ? 'text-gaa-green' : awayWin ? 'text-red-600' : ''}`}>
          {fixture.homeTeam}
          <CountyColourBadge teamName={fixture.homeTeam} />
        </div>

        <div className="text-center min-w-[80px]">
          {fixture.homeScore ? (
            <>
              <p className="text-xs text-gray-400 mb-0.5">Last known</p>
              <p className="text-base font-black tabular-nums">
                {fixture.homeScore.gp} – {fixture.awayScore?.gp}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">{formatMatchDate(fixture.startDate)}</p>
          )}
        </div>

        <div className={`flex items-center gap-1.5 font-bold text-lg ${awayWin ? 'text-gaa-green' : homeWin ? 'text-red-600' : ''}`}>
          <CountyColourBadge teamName={fixture.awayTeam} />
          {fixture.awayTeam}
        </div>
      </div>

      {fixture.venue && (
        <p className="text-xs text-gray-400 text-center mt-2">{fixture.venue}</p>
      )}

      {/* RSS news for this match */}
      {relevant.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Latest updates
          </p>
          <ul className="space-y-2">
            {relevant.map((item, i) => (
              <li key={i}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-800 font-medium leading-snug hover:text-gaa-green block"
                >
                  {item.title}
                </a>
                <p className="text-xs text-gray-400 mt-0.5">
                  {SOURCE_LABELS[item.source] ?? item.source}
                  {item.pubDate && ` · ${formatTimeAgo(item.pubDate)}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LiveScores() {
  const [secondsAgo, setSecondsAgo] = useState(0)
  const { data, isLoading, dataUpdatedAt } = useHurlingData()

  const allFixtures = [...(data?.fixtures ?? []), ...(data?.results ?? [])]
  const liveNow     = allFixtures.filter((f) => isMatchWindow(f))
  const hasLive     = liveNow.length > 0

  // RSS polling — only active when there are live matches
  const { data: rssData, dataUpdatedAt: rssUpdatedAt } = useLiveRss(hasLive)
  const rssItems    = rssData?.items ?? []
  const rssSeconds  = rssUpdatedAt
    ? Math.floor((Date.now() - new Date(rssUpdatedAt).getTime()) / 1000)
    : null

  // Seconds-ago counter for fixture data
  useEffect(() => {
    setSecondsAgo(0)
    const id = setInterval(() => setSecondsAgo((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [dataUpdatedAt])

  return (
    <PageWrapper title="Live Scores">

      {/* Data freshness indicator */}
      <p className="text-sm text-gray-500 mb-4" aria-live="polite">
        {dataUpdatedAt
          ? `Fixtures refreshed ${secondsAgo}s ago`
          : 'Loading…'}
        {hasLive && rssSeconds !== null && (
          <span className="ml-2 text-gray-400">
            · News checked {rssSeconds}s ago
          </span>
        )}
      </p>

      {isLoading && <Spinner label="Checking for live games…" />}

      <div aria-live="polite">
        {!isLoading && liveNow.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-bold text-gray-600 mb-1">No live hurling right now</p>
            <p className="text-sm text-gray-400">
              This page activates 30 minutes before kick-off and stays live for 110 minutes.
            </p>
          </div>
        )}

        {liveNow.map((f) => (
          <LiveCard key={f.id} fixture={f} rssItems={rssItems} />
        ))}
      </div>

      {/* Info banner */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-bold text-amber-800 mb-2">About live scores</p>
        <p className="text-xs text-amber-700 mb-2">
          We&apos;re sorry that real-time in-game scores aren&apos;t available yet. Final scores
          appear here shortly after full time, sourced from TheSportsDB, RTÉ Sport,
          BBC Sport, and Hoganstand.
        </p>
        <p className="text-xs text-amber-700">
          During match windows, the latest news headlines from those sources are checked
          every 2 minutes and shown inside each match card above. True live in-game
          scores are something we&apos;re actively working on bringing to the app.
        </p>
      </div>

    </PageWrapper>
  )
}
