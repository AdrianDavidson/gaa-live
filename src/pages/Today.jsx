import PageWrapper           from '../components/layout/PageWrapper'
import ClubHeroCard          from '../components/minor/ClubHeroCard'
import MinorGameCard         from '../components/minor/MinorGameCard'
import FixtureCard           from '../components/minor/FixtureCard'
import { SkeletonTodayPage } from '../components/ui/Skeletons'
import { useGames }          from '../hooks/useGames'
import { useAppStore }       from '../store/appStore'

const LIVE_GREEN = '#3a7d44'

function SectionHeader({ title, pulse }) {
  return (
    <h2 className="font-barlow text-base font-black text-gaa-text uppercase tracking-wide flex items-center gap-2 mb-3">
      {pulse && (
        <span
          className="w-2 h-2 rounded-full animate-pulse shrink-0"
          style={{ backgroundColor: LIVE_GREEN }}
          aria-hidden="true"
        />
      )}
      {title}
    </h2>
  )
}

export default function Today() {
  const homeClubId   = useAppStore((s) => s.homeClubId)
  const today        = new Date().toISOString().split('T')[0]
  const tomorrow     = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  const { data: todayGames = [], isLoading } = useGames({ date: today })
  const { data: tomorrowGames = [] }         = useGames({ date: tomorrow })

  const liveNow      = todayGames.filter((g) => g.period && g.period !== 'FT')
  const finishedToday = todayGames.filter((g) => g.period === 'FT')
  const laterToday   = todayGames.filter((g) => !g.period)

  const myClubId   = homeClubId
  const myNextGame =
    todayGames.find((g) => g.home_club?.id === myClubId || g.away_club?.id === myClubId) ??
    tomorrowGames.find((g) => g.home_club?.id === myClubId || g.away_club?.id === myClubId)

  const hasAnything = liveNow.length || finishedToday.length || laterToday.length || tomorrowGames.length

  return (
    <PageWrapper title="Today">
      {isLoading && <SkeletonTodayPage />}

      {!isLoading && (
        <div className="space-y-5">

          <ClubHeroCard nextGame={myNextGame} />

          {liveNow.length > 0 && (
            <section aria-labelledby="live-heading">
              <SectionHeader title="Live Now" pulse />
              {liveNow.map((g) => <MinorGameCard key={g.id} game={g} />)}
            </section>
          )}

          {laterToday.length > 0 && (
            <section aria-labelledby="later-heading">
              <SectionHeader title="Later Today" />
              {laterToday.map((g) => <FixtureCard key={g.id} game={g} />)}
            </section>
          )}

          {finishedToday.length > 0 && (
            <section aria-labelledby="ft-heading">
              <SectionHeader title="Full Time" />
              {finishedToday.map((g) => <MinorGameCard key={g.id} game={g} />)}
            </section>
          )}

          {tomorrowGames.length > 0 && (
            <section aria-labelledby="tomorrow-heading">
              <SectionHeader title="Tomorrow" />
              {tomorrowGames.map((g) => <FixtureCard key={g.id} game={g} dim />)}
            </section>
          )}

          {!hasAnything && (
            <div className="text-center py-16">
              <p className="text-gaa-text-muted text-sm">No games today or tomorrow.</p>
              <p className="text-gaa-text-muted text-xs mt-1 opacity-60">Check Fixtures for upcoming games.</p>
            </div>
          )}

        </div>
      )}
    </PageWrapper>
  )
}
