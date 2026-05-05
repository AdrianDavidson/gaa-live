import { useState }          from 'react'
import { Trophy, MapPin, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PageWrapper             from '../components/layout/PageWrapper'
import Spinner                 from '../components/ui/Spinner'
import CountyColourBadge       from '../components/ui/CountyColourBadge'
import CodeIcon                from '../components/ui/CodeIcon'
import CodeSidebar             from '../components/ui/CodeSidebar'
import CodeToggle              from '../components/ui/CodeToggle'
import { useResults, useGAAData } from '../hooks/useFixtures'
import { useCodeFilter }       from '../contexts/CodeFilterContext'
import { winnerGradient }      from '../utils/countyColours'
import { formatMatchDate, weekMondayKey, formatWeekRange } from '../utils/formatters'

// ─── Result card ───────────────────────────────────────────────────────────

function ResultCard({ fixture }) {
  const [expanded, setExpanded] = useState(false)

  const homeWin  = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin  = fixture.awayScore?.total > fixture.homeScore?.total
  const bgImage  = winnerGradient(fixture.homeTeam, fixture.awayTeam, homeWin, awayWin)
  const showIcon = !bgImage && (homeWin || awayWin)

  const searchTerm    = `${fixture.homeTeam} ${fixture.awayTeam} ${fixture.code ?? 'GAA'} ${fixture.season ?? ''} ${fixture.competitionShort ?? ''}`
  const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${searchTerm} highlights`)}`
  const rteUrl        = `https://www.rte.ie/player/search?q=${encodeURIComponent(searchTerm)}`
  const tg4Url        = `https://www.tg4.ie/en/player/categories/sport-tv-player/?series=GAA+2025&genre=Sport`
  const gaaGoUrl      = `https://www.gaago.ie/`

  return (
    <article
      className="flex bg-white border border-gray-200 rounded-xl mb-3 overflow-hidden"
      aria-label={`Result: ${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <CodeSidebar code={fixture.code} />

      {/* Content — winner gradient applied here only, not over the sidebar */}
      <div
        className="flex-1 p-4 min-w-0"
        style={bgImage ? { backgroundImage: bgImage } : undefined}
      >
        {/* Competition row */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gaa-green uppercase tracking-wide flex items-center gap-1 min-w-0">
            {fixture.leagueBadge
              ? <img src={fixture.leagueBadge} alt="" className="w-4 h-4 object-contain shrink-0" aria-hidden="true" />
              : <CodeIcon code={fixture.code} size={13} className="shrink-0" />
            }
            <span className="truncate">{fixture.competitionShort ?? fixture.competition}</span>
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{formatMatchDate(fixture.startDate)}</span>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <p className="font-bold text-base leading-tight text-gray-900">{fixture.homeTeam}</p>
              <CountyColourBadge teamName={fixture.homeTeam} />
            </div>
            {fixture.homeScore && (
              <p className="text-xl font-black tabular-nums text-gray-800 flex items-center justify-end gap-1">
                {showIcon && homeWin && <Trophy size={13} className="text-gaa-green shrink-0" />}
                {fixture.homeScore.gp ?? fixture.homeScore.total}
                {fixture.homeScore.gp != null && (
                  <span className="text-sm font-bold ml-1 opacity-60">({fixture.homeScore.total})</span>
                )}
              </p>
            )}
          </div>

          <div className="text-center text-gray-300 font-bold text-lg px-1 pt-1">–</div>

          <div className="text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CountyColourBadge teamName={fixture.awayTeam} />
              <p className="font-bold text-base leading-tight text-gray-900">{fixture.awayTeam}</p>
            </div>
            {fixture.awayScore && (
              <p className="text-xl font-black tabular-nums text-gray-800 flex items-center gap-1">
                {fixture.awayScore.gp ?? fixture.awayScore.total}
                {fixture.awayScore.gp != null && (
                  <span className="text-sm font-bold ml-1 opacity-60">({fixture.awayScore.total})</span>
                )}
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

        {/* Watch — tap to expand */}
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
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Highlights</p>
              <a href={highlightsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                <PlayCircle size={13} /> Search YouTube
              </a>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Full Match Replay</p>
              <div className="flex gap-2">
                <a href={rteUrl}   target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-blue-50   text-blue-700   border border-blue-200   hover:bg-blue-100   transition-colors">RTÉ Player</a>
                <a href={tg4Url}   target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">TG4 Player</a>
                <a href={gaaGoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-gray-50   text-gray-600   border border-gray-200   hover:bg-gray-100   transition-colors">GAA GO</a>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-center">RTÉ &amp; TG4 are free · GAA GO requires a subscription</p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Grouping helpers ──────────────────────────────────────────────────────

function groupBySeason(results) {
  const bySeason = {}
  for (const r of results) {
    const season = r.season ?? 'Unknown'
    if (!bySeason[season]) bySeason[season] = {}
    const wk = weekMondayKey(r.startDate)
    if (!bySeason[season][wk]) bySeason[season][wk] = []
    bySeason[season][wk].push(r)
  }
  return bySeason
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Results() {
  const { data: results, isLoading, isError, dataUpdatedAt } = useResults()
  const { data: gaaData }      = useGAAData()
  const { filter: codeFilter } = useCodeFilter()

  const filtered = results.filter(
    (f) => codeFilter === 'all' || f.code === codeFilter
  )

  const bySeason   = groupBySeason(filtered)
  const seasonKeys = Object.keys(bySeason).sort((a, b) => b.localeCompare(a))

  const emptyMessage = codeFilter === 'football'
    ? 'No football results to show.'
    : codeFilter === 'hurling'
      ? 'No hurling results to show.'
      : 'No results found. Results appear here after games are played.'

  return (
    <PageWrapper title="Results" titleAction={<CodeToggle />}>

      {isLoading && <Spinner label="Loading results…" />}

      {isError && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Couldn't load results. Check your connection and try again.
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-gray-500 text-base py-8">{emptyMessage}</p>
      )}

      {seasonKeys.map((season) => {
        const weekKeys = Object.keys(bySeason[season]).sort((a, b) => b.localeCompare(a))
        return (
          <section key={season} className="mb-2">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-black text-gray-800">{season} Season</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{filtered.filter(r => r.season === season).length} results</span>
            </div>

            {weekKeys.map((wk) => {
              const matches = bySeason[season][wk]
              return (
                <section key={wk} className="mb-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 rounded-full bg-gray-300 shrink-0" aria-hidden="true" />
                    {formatWeekRange(wk)}
                  </h3>
                  {matches.map((f) => <ResultCard key={f.id} fixture={f} />)}
                </section>
              )
            })}
          </section>
        )
      })}

      {dataUpdatedAt && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Source: TheSportsDB · Season {gaaData?.season ?? '—'} · Updated{' '}
          {new Date(dataUpdatedAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

    </PageWrapper>
  )
}
