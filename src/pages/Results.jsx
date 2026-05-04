import { useState }          from 'react'
import { Trophy, MapPin, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PageWrapper             from '../components/layout/PageWrapper'
import Spinner                 from '../components/ui/Spinner'
import CountyColourBadge       from '../components/ui/CountyColourBadge'
import { useResults }          from '../hooks/useFixtures'
import { COMPETITION_GROUPS }  from '../data/competitions'
import { winnerGradient }      from '../utils/countyColours'
import { formatMatchDate }     from '../utils/formatters'

// ─── Result card ───────────────────────────────────────────────────────────

function ResultCard({ fixture }) {
  const [expanded, setExpanded] = useState(false)

  const homeWin  = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin  = fixture.awayScore?.total > fixture.homeScore?.total
  const bgImage  = winnerGradient(fixture.homeTeam, fixture.awayTeam, homeWin, awayWin)
  const showIcon = !bgImage && (homeWin || awayWin)

  // Highlights: YouTube search works well for clips — no API key needed.
  // TODO (future): Upgrade to YouTube Data API v3 (VITE_YOUTUBE_API_KEY) to search
  // the official GAA channel (UC14eltCtgNDkBCTbGIYcRpg) and return a direct video
  // link with thumbnail instead of a search results page. See youtubeService.js.
  const searchTerm    = `${fixture.homeTeam} ${fixture.awayTeam} hurling ${fixture.season ?? ''} ${fixture.competitionShort ?? ''}`
  const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${searchTerm} highlights`)}`

  // Full match replays — link directly to each platform's search/GAA section.
  // RTÉ Player and TG4 are free; GAA GO requires a subscription.
  const rteUrl  = `https://www.rte.ie/player/search?q=${encodeURIComponent(searchTerm)}`
  const tg4Url  = `https://www.tg4.ie/en/player/categories/sport-tv-player/?series=GAA+2025&genre=Sport`
  const gaaGoUrl = `https://www.gaago.ie/`

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3 overflow-hidden"
      style={bgImage ? { backgroundImage: bgImage } : undefined}
      aria-label={`Result: ${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gaa-green uppercase tracking-wide flex items-center gap-1">
          {fixture.leagueBadge
            ? <img src={fixture.leagueBadge} alt="" className="w-4 h-4 object-contain shrink-0" aria-hidden="true" />
            : <Trophy size={11} className="shrink-0" aria-hidden="true" />
          }
          {fixture.competitionShort ?? fixture.competition}
          {fixture.season && <span className="text-gray-400 font-normal normal-case">{fixture.season}</span>}
        </span>
        <span className="text-xs text-gray-400">{formatMatchDate(fixture.startDate)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">

        {/* Home team */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-0.5">
            <p className="font-bold text-base leading-tight text-gray-900">
              {fixture.homeTeam}
            </p>
            <CountyColourBadge teamName={fixture.homeTeam} />
          </div>
          {fixture.homeScore && (
            <p className="text-xl font-black tabular-nums text-gray-800 flex items-center justify-end gap-1">
              {showIcon && homeWin && <Trophy size={13} className="text-gaa-green shrink-0" />}
              {fixture.homeScore.gp}
              <span className="text-sm font-bold ml-1 opacity-60">({fixture.homeScore.total})</span>
            </p>
          )}
        </div>

        {/* Centre divider */}
        <div className="text-center text-gray-300 font-bold text-lg px-1 pt-1">–</div>

        {/* Away team */}
        <div className="text-left">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CountyColourBadge teamName={fixture.awayTeam} />
            <p className="font-bold text-base leading-tight text-gray-900">
              {fixture.awayTeam}
            </p>
          </div>
          {fixture.awayScore && (
            <p className="text-xl font-black tabular-nums text-gray-800 flex items-center gap-1">
              {fixture.awayScore.gp}
              <span className="text-sm font-bold ml-1 opacity-60">({fixture.awayScore.total})</span>
              {showIcon && awayWin && <Trophy size={13} className="text-gaa-green shrink-0" />}
            </p>
          )}
        </div>

      </div>

      {fixture.venue && (
        <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          {fixture.venue}
        </p>
      )}

      {/* Watch on YouTube — tap to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gaa-green transition-colors min-h-[36px]"
        aria-expanded={expanded}
      >
        <PlayCircle size={13} />
        Watch on YouTube
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-3">

          {/* Highlights */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Highlights</p>
            <a
              href={highlightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <PlayCircle size={13} />
              Search YouTube
            </a>
          </div>

          {/* Full match replay platforms */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Full Match Replay</p>
            <div className="flex gap-2">
              <a
                href={rteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                RTÉ Player
              </a>
              <a
                href={tg4Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                TG4 Player
              </a>
              <a
                href={gaaGoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                GAA GO
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              RTÉ &amp; TG4 are free · GAA GO requires a subscription
            </p>
          </div>

        </div>
      )}
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Results() {
  const [groupFilter, setGroupFilter] = useState('all')
  const { data: results, isLoading, isError, dataUpdatedAt } = useResults()

  const filtered = results.filter(
    (f) => groupFilter === 'all' || f.group === groupFilter
  )

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
