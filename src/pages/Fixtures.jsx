import { MapPin }                from 'lucide-react'
import PageWrapper               from '../components/layout/PageWrapper'
import Spinner                   from '../components/ui/Spinner'
import CountyColourBadge         from '../components/ui/CountyColourBadge'
import CodeIcon                  from '../components/ui/CodeIcon'
import CodeToggle                from '../components/ui/CodeToggle'
import { useFixtures }           from '../hooks/useFixtures'
import { useCodeFilter }         from '../contexts/CodeFilterContext'
import { formatMatchDate, formatDateGroup } from '../utils/formatters'

const CODE_BORDER = {
  hurling:  'border-l-[3px] border-l-gaa-hurling',
  football: 'border-l-[3px] border-l-gaa-football',
}

function groupByDate(fixtures) {
  return fixtures.reduce((acc, f) => {
    const key = new Date(f.startDate).toDateString()
    if (!acc[key]) acc[key] = { label: formatDateGroup(f.startDate), items: [] }
    acc[key].items.push(f)
    return acc
  }, {})
}

function FixtureCard({ fixture }) {
  const borderClass = CODE_BORDER[fixture.code] ?? ''

  return (
    <article
      className={`bg-white border border-gray-200 rounded-xl p-4 mb-3 ${borderClass}`}
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-gaa-green uppercase tracking-wide flex items-center gap-1 min-w-0 flex-1 pr-2 truncate">
          {fixture.leagueBadge
            ? <img src={fixture.leagueBadge} alt="" className="w-4 h-4 object-contain shrink-0" aria-hidden="true" />
            : <CodeIcon code={fixture.code} size={13} className="shrink-0" />
          }
          {fixture.competitionShort ?? fixture.competition}
          {fixture.season && <span className="text-gray-400 font-normal normal-case ml-1">{fixture.season}</span>}
        </span>
        <span className="text-xs text-gray-400 shrink-0 font-medium">{formatMatchDate(fixture.startDate)}</span>
      </div>

      <div className="flex items-center justify-between font-bold text-lg gap-2">
        <span className="flex-1 flex items-center gap-1.5">
          <CountyColourBadge teamName={fixture.homeTeam} />
          {fixture.homeTeam}
        </span>
        <span className="text-gray-400 font-normal text-base shrink-0">vs</span>
        <span className="flex-1 flex items-center justify-end gap-1.5">
          {fixture.awayTeam}
          <CountyColourBadge teamName={fixture.awayTeam} />
        </span>
      </div>

      {fixture.venue && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 truncate">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          {fixture.venue}
        </p>
      )}
    </article>
  )
}

export default function Fixtures() {
  const { data: fixtures, isLoading, isError, dataUpdatedAt } = useFixtures()
  const { filter: codeFilter } = useCodeFilter()

  const filtered = codeFilter === 'all'
    ? fixtures
    : fixtures.filter((f) => f.code === codeFilter)

  const grouped = groupByDate(filtered)

  const emptyMessage = codeFilter === 'football'
    ? 'No upcoming football fixtures. Check back when the new season kicks off.'
    : codeFilter === 'hurling'
      ? 'No upcoming hurling fixtures. Check back when the new season gets underway.'
      : 'No upcoming fixtures found. Check back when the new season gets underway.'

  return (
    <PageWrapper title="Fixtures" titleAction={<CodeToggle />}>

      {isLoading && <Spinner label="Loading fixtures…" />}

      {isError && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Couldn't load fixture data. Check your connection and try again.
        </div>
      )}

      {!isLoading && Object.entries(grouped).length === 0 && (
        <p className="text-center text-gray-500 text-base py-8">{emptyMessage}</p>
      )}

      {Object.entries(grouped).map(([key, group]) => (
        <section key={key} className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">{group.label}</h2>
          {group.items.map((f) => <FixtureCard key={f.id} fixture={f} />)}
        </section>
      ))}

      {dataUpdatedAt && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Data from TheSportsDB · Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </PageWrapper>
  )
}
