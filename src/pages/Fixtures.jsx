import { useState }                from 'react'
import PageWrapper                 from '../components/layout/PageWrapper'
import FixtureCard                 from '../components/minor/FixtureCard'
import { SkeletonFixturesPage }    from '../components/ui/Skeletons'
import { useUpcomingGames }        from '../hooks/useGames'
import { useCompetitions }         from '../hooks/useCompetitions'
import { useAppStore }             from '../store/appStore'
import { formatDateGroup, compPillLabel } from '../utils/formatters'

function addDays(n) {
  const d = new Date(Date.now() + n * 86_400_000)
  return d.toISOString().split('T')[0]
}

function groupByDate(games) {
  const grouped = {}
  for (const g of games) {
    const date = new Date(g.start_time).toISOString().split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(g)
  }
  return grouped
}

export default function Fixtures() {
  const [competitionFilter, setCompetitionFilter] = useState('all')
  const [myClubsOnly, setMyClubsOnly]             = useState(false)

  const homeClubId              = useAppStore((s) => s.homeClubId)
  const { data: competitions = [] } = useCompetitions()

  const today   = addDays(0)
  const twoWeeks = addDays(13)

  const { data: allGames = [], isLoading, isError } = useUpcomingGames({
    dateFrom: today,
    dateTo:   twoWeeks,
  })

  const filtered = allGames.filter((g) => {
    if (competitionFilter !== 'all' && g.competition_id !== competitionFilter) return false
    if (myClubsOnly && homeClubId) {
      if (g.home_club?.id !== homeClubId && g.away_club?.id !== homeClubId) return false
    }
    return true
  })

  const grouped  = groupByDate(filtered)
  const dateKeys = Object.keys(grouped).sort()

  return (
    <PageWrapper title="Fixtures">

      {isLoading && <SkeletonFixturesPage />}

      {!isLoading && (
        <>
          {/* Filter pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            role="group"
            aria-label="Filter fixtures"
          >
            {homeClubId && (
              <button
                onClick={() => setMyClubsOnly((v) => !v)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                  myClubsOnly
                    ? 'bg-gaa-minor text-white border-gaa-minor'
                    : 'bg-gaa-surface text-gaa-text-muted border-gaa-border'
                }`}
              >
                My Club
              </button>
            )}
            <button
              onClick={() => setCompetitionFilter('all')}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                competitionFilter === 'all'
                  ? 'bg-gaa-minor text-white border-gaa-minor'
                  : 'bg-gaa-surface text-gaa-text-muted border-gaa-border'
              }`}
            >
              All
            </button>
            {competitions.map((c) => (
              <button
                key={c.id}
                onClick={() => setCompetitionFilter(c.id)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                  competitionFilter === c.id
                    ? 'bg-gaa-minor text-white border-gaa-minor'
                    : 'bg-gaa-surface text-gaa-text-muted border-gaa-border'
                }`}
              >
                {compPillLabel(c.name, c.short_name)}
              </button>
            ))}
          </div>

          {isError && (
            <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
              Couldn't load fixtures. Check your connection and try again.
            </div>
          )}

          {!isError && filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">
              No upcoming fixtures in the next 2 weeks.
            </p>
          )}

          {dateKeys.map((date) => (
            <section key={date} className="mb-5">
              <h2 className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-gaa-border shrink-0" aria-hidden="true" />
                {formatDateGroup(date)}
              </h2>
              {grouped[date].map((g) => <FixtureCard key={g.id} game={g} />)}
            </section>
          ))}
        </>
      )}
    </PageWrapper>
  )
}
