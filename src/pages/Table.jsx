import { useState }              from 'react'
import PageWrapper               from '../components/layout/PageWrapper'
import Spinner                   from '../components/ui/Spinner'
import StandingsTable            from '../components/minor/StandingsTable'
import { SkeletonTablePage }     from '../components/ui/Skeletons'
import { useStandings }          from '../hooks/useStandings'
import { useCompetitions }       from '../hooks/useCompetitions'

function CompetitionStandings({ competition }) {
  const { data: rows = [], isLoading } = useStandings(competition.id)

  if (competition.format === 'championship') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-500 font-medium">Knockout competition — no standings table.</p>
        <p className="text-xs text-gray-400 mt-1">Results show in match cards above.</p>
      </div>
    )
  }

  if (isLoading) return <Spinner label={`Loading ${competition.short_name} standings…`} />

  if (!rows.length) {
    return (
      <p className="text-center text-gray-400 text-sm py-4 mb-6">
        No results yet for {competition.short_name}.
      </p>
    )
  }

  return (
    <div className="mb-6">
      <StandingsTable rows={rows} />
    </div>
  )
}

export default function Table() {
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions()
  const [selectedId, setSelectedId] = useState(null)

  const leagueComps  = competitions.filter((c) => c.grade === 'minor' && c.code === 'hurling')
  const activeId     = selectedId ?? leagueComps[0]?.id
  const activeComp   = leagueComps.find((c) => c.id === activeId)

  return (
    <PageWrapper title="Table">
      {compsLoading && <SkeletonTablePage />}

      {!compsLoading && leagueComps.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-10">
          No competitions set up yet. Contact the county board.
        </p>
      )}

      {leagueComps.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {leagueComps.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                c.id === activeId
                  ? 'bg-gaa-minor text-white border-gaa-minor'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {c.short_name}
            </button>
          ))}
        </div>
      )}

      {activeComp && (
        <section>
          <h2 className="text-sm font-black text-gray-900 mb-3">{activeComp.name}</h2>
          <CompetitionStandings competition={activeComp} />
        </section>
      )}
    </PageWrapper>
  )
}
