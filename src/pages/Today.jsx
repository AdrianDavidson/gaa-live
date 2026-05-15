import PageWrapper           from '../components/layout/PageWrapper'
import ClubHeroCard          from '../components/minor/ClubHeroCard'
import MinorGameCard         from '../components/minor/MinorGameCard'
import FixtureCard           from '../components/minor/FixtureCard'
import { SkeletonTodayPage } from '../components/ui/Skeletons'
import { useGames }          from '../hooks/useGames'
import { useAppStore }       from '../store/appStore'

function SectionHeader({ title, pulse }) {
  return (
    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
      {pulse && (
        <span className="w-2 h-2 bg-gaa-minor rounded-full animate-pulse" aria-hidden="true" />
      )}
      {title}
    </h2>
  )
}

export default function Today() {
  const homeClubId   = useAppStore((s) => s.homeClubId)
  const today        = new Date().toISOString().split('T')[0]
  const tomorrow     = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  const { data: todayGames = [], isLoading }    = useGames({ date: today })
  const { data: tomorrowGames = [] }            = useGames({ date: tomorrow })

  const liveNow   = todayGames.filter((g) => g.period && g.period !== 'FT')
  const laterToday = todayGames.filter((g) => !g.period)

  const myClubId  = homeClubId
  const myNextGame =
    todayGames.find((g) => g.home_club?.id === myClubId || g.away_club?.id === myClubId) ??
    tomorrowGames.find((g) => g.home_club?.id === myClubId || g.away_club?.id === myClubId)

  return (
    <PageWrapper title="Today">
      {isLoading && <SkeletonTodayPage />}

      {!isLoading && (
        <div className="space-y-5">

          {/* My club hero */}
          <ClubHeroCard nextGame={myNextGame} />

          {/* Live now */}
          {liveNow.length > 0 && (
            <section aria-labelledby="live-heading">
              <SectionHeader title="Live Now" pulse id="live-heading" />
              {liveNow.map((g) => <MinorGameCard key={g.id} game={g} />)}
            </section>
          )}

          {/* Later today */}
          {laterToday.length > 0 && (
            <section aria-labelledby="later-heading">
              <SectionHeader title="Later Today" id="later-heading" />
              {laterToday.map((g) => <FixtureCard key={g.id} game={g} />)}
            </section>
          )}

          {/* Tomorrow */}
          {tomorrowGames.length > 0 && (
            <section aria-labelledby="tomorrow-heading">
              <SectionHeader title="Tomorrow" id="tomorrow-heading" />
              {tomorrowGames.slice(0, 5).map((g) => <FixtureCard key={g.id} game={g} />)}
            </section>
          )}

          {!liveNow.length && !laterToday.length && !tomorrowGames.length && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No games today or tomorrow.</p>
              <p className="text-gray-300 text-xs mt-1">Check Fixtures for upcoming games.</p>
            </div>
          )}

        </div>
      )}
    </PageWrapper>
  )
}
