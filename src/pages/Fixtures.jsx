import { useState }             from 'react'
import PageWrapper               from '../components/layout/PageWrapper'
import Spinner                   from '../components/ui/Spinner'
import { useFixtures }           from '../hooks/useFixtures'
import { COMPETITION_GROUPS, HURLING_COMPETITIONS } from '../data/competitions'
import { formatMatchDate, formatDateGroup } from '../utils/formatters'

function groupByDate(fixtures) {
  return fixtures.reduce((acc, f) => {
    const key = new Date(f.startDate).toDateString()
    if (!acc[key]) acc[key] = { label: formatDateGroup(f.startDate), items: [] }
    acc[key].items.push(f)
    return acc
  }, {})
}

function FixtureCard({ fixture }) {
  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-xs font-bold text-gaa-green uppercase tracking-wide block truncate">
            {fixture.competitionShort ?? fixture.competition}
          </span>
          {fixture.tvChannel && (
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">
              {fixture.tvChannel}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0 font-medium">
          {formatMatchDate(fixture.startDate)}
        </span>
      </div>

      <div className="flex items-center justify-between font-bold text-lg gap-2">
        <span className="flex-1 text-left">{fixture.homeTeam}</span>
        <span className="text-gray-400 font-normal text-base shrink-0">vs</span>
        <span className="flex-1 text-right">{fixture.awayTeam}</span>
      </div>

      {fixture.venue && (
        <p className="text-sm text-gray-400 mt-1 truncate">{fixture.venue}</p>
      )}
    </article>
  )
}

export default function Fixtures() {
  const [groupFilter, setGroupFilter] = useState('all')
  const { data: fixtures, isLoading, isError, dataUpdatedAt } = useFixtures()

  const filtered = fixtures.filter(
    (f) => groupFilter === 'all' || f.group === groupFilter
  )

  const grouped = groupByDate(filtered)

  // Competitions with no TheSportsDB data yet (shown as "coming soon")
  const unavailableGroups = HURLING_COMPETITIONS.filter(
    (c) => c.theSportsDbId === null &&
    (groupFilter === 'all' || c.group === groupFilter)
  )

  return (
    <PageWrapper title="Hurling Fixtures">

      {/* Competition group filter */}
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

      {isLoading && <Spinner label="Loading fixtures…" />}

      {isError && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Couldn't load live fixture data. Check your connection and try again.
        </div>
      )}

      {!isLoading && (
        <>
          {/* Fixtures grouped by date */}
          {Object.entries(grouped).length === 0 && !isLoading && (
            <p className="text-center text-gray-500 text-base py-4">
              No upcoming fixtures found for this filter.
            </p>
          )}

          {Object.entries(grouped).map(([key, group]) => (
            <section key={key} className="mb-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
                {group.label}
              </h2>
              {group.items.map((f) => <FixtureCard key={f.id} fixture={f} />)}
            </section>
          ))}

          {/* Competitions not yet covered — honest notice */}
          {unavailableGroups.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
              <p className="text-sm font-bold text-gray-600 mb-2">
                Fixtures not yet available for:
              </p>
              <ul className="space-y-1">
                {unavailableGroups.map((c) => (
                  <li key={c.id} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-gray-300">•</span> {c.name}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Full fixture data for these competitions requires the{' '}
                <strong>Foireann API</strong> — see Settings for how to unlock it.
              </p>
            </div>
          )}
        </>
      )}

      {dataUpdatedAt && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Data from TheSportsDB · Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </PageWrapper>
  )
}
