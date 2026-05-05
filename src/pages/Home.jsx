import { Link }             from 'react-router-dom'
import { Trophy, MapPin, ChevronRight, Newspaper } from 'lucide-react'
import PageWrapper           from '../components/layout/PageWrapper'
import Spinner               from '../components/ui/Spinner'
import CodeIcon              from '../components/ui/CodeIcon'
import CodeSidebar           from '../components/ui/CodeSidebar'
import CountyColourBadge     from '../components/ui/CountyColourBadge'
import { useAppStore }       from '../store/appStore'
import { useGAAData }        from '../hooks/useFixtures'
import { useLiveRss, SOURCE_LABELS } from '../hooks/useLiveRss'
import { useCodeFilter }     from '../contexts/CodeFilterContext'
import { formatMatchDate }   from '../utils/formatters'
import { isMatchWindow }     from '../utils/matchStatus'
import { winnerGradient, COUNTY_COLOURS, COUNTY_FLAGS } from '../utils/countyColours'

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return '0, 102, 51'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

// ─── County hero ────────────────────────────────────────────────────────────

function CountyHeroCard({ fixture, county }) {
  const colours = COUNTY_COLOURS[county]
  const primary = colours?.primary ?? '#006633'
  const rgb     = hexToRgb(primary)
  const flagUrl = COUNTY_FLAGS[county]

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={flagUrl ? {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.87) 0%, rgba(255,255,255,0.93) 100%), url(${flagUrl})`,
        backgroundSize:  'cover',
        backgroundPosition: 'center',
        border: `1px solid rgba(${rgb}, 0.22)`,
      } : {
        background: `linear-gradient(145deg, rgba(${rgb}, 0.13) 0%, rgba(${rgb}, 0.04) 100%)`,
        border:     `1px solid rgba(${rgb}, 0.22)`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: primary }} />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{county} · Next Game</p>
      </div>

      <p className="text-[11px] font-bold mb-4 flex items-center gap-1.5" style={{ color: primary }}>
        <CodeIcon code={fixture.code} size={11} />
        {fixture.competitionShort ?? fixture.competition}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
            <p className="font-black text-sm text-gray-900 leading-tight">{fixture.homeTeam}</p>
            <CountyColourBadge teamName={fixture.homeTeam} />
          </div>
          {fixture.homeScore && (
            <p className="text-2xl font-black tabular-nums text-gray-900">
              {fixture.homeScore.gp ?? fixture.homeScore.total}
            </p>
          )}
        </div>

        <div className="text-center px-3">
          {fixture.homeScore ? (
            <>
              <p className="text-gray-300 font-black text-2xl leading-none">–</p>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wide">FT</p>
            </>
          ) : (
            <p className="text-sm font-bold text-gray-600 text-center leading-tight">
              {formatMatchDate(fixture.startDate)}
            </p>
          )}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5 mb-1">
            <CountyColourBadge teamName={fixture.awayTeam} />
            <p className="font-black text-sm text-gray-900 leading-tight">{fixture.awayTeam}</p>
          </div>
          {fixture.awayScore && (
            <p className="text-2xl font-black tabular-nums text-gray-900">
              {fixture.awayScore.gp ?? fixture.awayScore.total}
            </p>
          )}
        </div>
      </div>

      {fixture.venue && (
        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1 mt-4">
          <MapPin size={10} aria-hidden="true" />
          {fixture.venue}
        </p>
      )}
    </div>
  )
}

// ─── News scroll card ───────────────────────────────────────────────────────

function NewsCard({ item }) {
  const sourceLabel = SOURCE_LABELS[item.source] ?? item.source ?? 'GAA'
  const pubDate     = item.pubDate ? new Date(item.pubDate) : null

  return (
    <a
      href={item.link ?? item.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 w-48 bg-white border border-gray-100 rounded-2xl p-3.5 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform"
      aria-label={item.title}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sourceLabel}</span>
        {item.code && item.code !== 'unknown' && <CodeIcon code={item.code} size={10} />}
      </div>
      <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-4 flex-1">{item.title}</p>
      {pubDate && (
        <p className="text-[10px] text-gray-400">
          {pubDate.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
          {' · '}
          {pubDate.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </a>
  )
}

// ─── Match cards ────────────────────────────────────────────────────────────

function MiniResultCard({ fixture }) {
  const homeWin  = fixture.homeScore?.total > fixture.awayScore?.total
  const awayWin  = fixture.awayScore?.total > fixture.homeScore?.total
  const bgImage  = winnerGradient(fixture.homeTeam, fixture.awayTeam, homeWin, awayWin)
  const showIcon = !bgImage && (homeWin || awayWin)

  return (
    <article
      className="flex bg-white border border-gray-100 rounded-2xl mb-2 overflow-hidden shadow-sm"
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
            <span className="text-base font-black tabular-nums text-gray-800">
              {fixture.homeScore ? (fixture.homeScore.gp ?? fixture.homeScore.total) : '–'}
            </span>
            <span className="text-gray-300 mx-0.5">–</span>
            <span className="text-base font-black tabular-nums text-gray-800">
              {fixture.awayScore ? (fixture.awayScore.gp ?? fixture.awayScore.total) : '–'}
            </span>
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
      className="flex bg-white border border-gray-100 rounded-2xl mb-2 overflow-hidden shadow-sm"
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

// ─── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-gray-400" />}
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs font-bold text-gaa-green flex items-center gap-0.5 min-h-[44px] content-center"
        >
          {linkLabel} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  const { favouriteCounty } = useAppStore()
  const { data, isLoading } = useGAAData()
  const { filter }          = useCodeFilter()
  const { data: rssData }   = useLiveRss(true)

  const allFixtures = data?.fixtures ?? []
  const allResults  = data?.results  ?? []

  const fixtures = filter === 'all' ? allFixtures : allFixtures.filter((f) => f.code === filter)
  const results  = filter === 'all' ? allResults  : allResults.filter((f)  => f.code === filter)

  const countyFixture = favouriteCounty
    ? fixtures.find((f) =>
        f.homeTeam.toLowerCase().includes(favouriteCounty.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(favouriteCounty.toLowerCase())
      )
    : null

  const liveNow        = fixtures.filter((f) => isMatchWindow(f))
  const upcomingOthers = fixtures.filter((f) => !isMatchWindow(f)).slice(0, 3)
  const recentResults  = results.slice(0, 4)
  const newsItems      = rssData?.items ?? []

  return (
    <PageWrapper>
      {isLoading && <Spinner label="Loading GAA data…" />}

      {!isLoading && (
        <div className="space-y-5">

          {/* My county — next game */}
          {favouriteCounty && countyFixture ? (
            <CountyHeroCard fixture={countyFixture} county={favouriteCounty} />
          ) : !favouriteCounty ? (
            <Link
              to="/settings"
              className="block rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-5 text-center"
            >
              <p className="text-sm font-bold text-gray-600 mb-1">Pick your county</p>
              <p className="text-xs text-gray-400">See your next game right here →</p>
            </Link>
          ) : null}

          {/* Live / in progress */}
          {liveNow.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                  In Progress
                </h2>
                <Link to="/live" className="text-xs font-bold text-gaa-green flex items-center gap-0.5 min-h-[44px] content-center">
                  See all <ChevronRight size={13} />
                </Link>
              </div>
              <p className="text-xs text-gray-400 -mt-1 mb-2">Scores update at full time.</p>
              {liveNow.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {/* Latest news — horizontal scroll */}
          {newsItems.length > 0 && (
            <section>
              <SectionHeader title="Latest News" icon={Newspaper} />
              <div
                className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {newsItems.map((item, i) => (
                  <NewsCard key={i} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming fixtures */}
          {upcomingOthers.length > 0 ? (
            <section>
              <SectionHeader title="Upcoming" linkTo="/fixtures" linkLabel="All fixtures" />
              {upcomingOthers.map((f) => <MiniFixtureCard key={f.id} fixture={f} />)}
            </section>
          ) : filter === 'football' && (
            <section>
              <SectionHeader title="Upcoming" />
              <p className="text-sm text-gray-400">
                No football fixtures scheduled yet.{' '}
                <a
                  href="https://www.gaa.ie/fixtures-results/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gaa-football font-bold underline"
                >
                  GAA.ie →
                </a>
              </p>
            </section>
          )}

          {/* Recent results */}
          {recentResults.length > 0 && (
            <section>
              <SectionHeader title="Recent Results" linkTo="/results" linkLabel="All results" />
              {recentResults.map((f) => <MiniResultCard key={f.id} fixture={f} />)}
            </section>
          )}

          {/* Empty state */}
          {!countyFixture && !upcomingOthers.length && !recentResults.length && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No GAA data available right now.</p>
            </div>
          )}

        </div>
      )}
    </PageWrapper>
  )
}
