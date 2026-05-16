import { useState, useEffect }    from 'react'
import PageWrapper                 from '../components/layout/PageWrapper'
import StandingsTable              from '../components/minor/StandingsTable'
import { SkeletonTablePage }       from '../components/ui/Skeletons'
import { useCompetitions }         from '../hooks/useCompetitions'
import { compPillLabel }           from '../utils/formatters'

export default function Table() {
  const { data: competitions = [], isLoading: compsLoading } = useCompetitions()

  const [standingsMap, setStandingsMap] = useState({})   // { compId: row[] }
  const [loadingAll,   setLoadingAll]   = useState(true)
  const [selectedId,   setSelectedId]  = useState(null)

  const leagueComps = competitions.filter((c) => c.grade === 'minor' && c.code === 'hurling' && c.format === 'league')

  // Fetch all league standings in parallel; keep only those with data
  useEffect(() => {
    if (!leagueComps.length) { setLoadingAll(false); return }

    setLoadingAll(true)
    Promise.all(
      leagueComps.map((c) =>
        fetch(`/api/standings?competitionId=${c.id}`)
          .then((r) => r.ok ? r.json() : [])
          .catch(() => [])
          .then((rows) => [c.id, rows])
      )
    ).then((entries) => {
      const map = Object.fromEntries(entries)
      setStandingsMap(map)
      setLoadingAll(false)
    })
  }, [leagueComps.map((c) => c.id).join(',')])

  const activeComps = leagueComps.filter((c) => (standingsMap[c.id] ?? []).length > 0)
  const activeId    = selectedId && activeComps.find((c) => c.id === selectedId)
    ? selectedId
    : activeComps[0]?.id
  const activeComp  = activeComps.find((c) => c.id === activeId)
  const activeRows  = standingsMap[activeId] ?? []

  const isLoading = compsLoading || loadingAll

  return (
    <PageWrapper title="Table">
      {isLoading && <SkeletonTablePage />}

      {!isLoading && activeComps.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gaa-text-muted text-sm">No results have been submitted yet.</p>
          <p className="text-gaa-text-muted text-xs mt-1 opacity-60">Tables will appear once match scores are recorded.</p>
        </div>
      )}

      {!isLoading && activeComps.length > 0 && (
        <>
          {activeComps.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {activeComps.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                    c.id === activeId
                      ? 'bg-gaa-minor text-white border-gaa-minor'
                      : 'bg-gaa-surface text-gaa-text-muted border-gaa-border'
                  }`}
                >
                  {compPillLabel(c.name, c.short_name)}
                </button>
              ))}
            </div>
          )}

          {activeComp && (
            <section>
              <p className="text-[11px] text-gaa-text-muted font-semibold uppercase tracking-wider mb-3">
                {activeComp.name}
              </p>
              <StandingsTable rows={activeRows} />
            </section>
          )}
        </>
      )}
    </PageWrapper>
  )
}
