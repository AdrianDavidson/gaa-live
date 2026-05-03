import { useState }      from 'react'
import PageWrapper        from '../components/layout/PageWrapper'
import { MOCK_FIXTURES }  from '../data/mockFixtures'
import { formatDateGroup, formatMatchDate } from '../utils/formatters'

const SPORTS = ['All', 'Football', 'Hurling', 'Ladies', 'Camogie']

function groupByDate(fixtures) {
  return fixtures.reduce((acc, f) => {
    const key = new Date(f.startDate).toDateString()
    if (!acc[key]) acc[key] = { label: formatDateGroup(f.startDate), items: [] }
    acc[key].items.push(f)
    return acc
  }, {})
}

export default function Fixtures() {
  const [filter, setFilter] = useState('All')

  const filtered = MOCK_FIXTURES.filter(
    (f) => filter === 'All' || f.sport.toLowerCase() === filter.toLowerCase()
  )
  const groups = groupByDate(filtered)

  return (
    <PageWrapper title="Fixtures">
      {/* Sport filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4" role="tablist" aria-label="Sport filter">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            role="tab"
            aria-selected={filter === sport}
            onClick={() => setFilter(sport)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold min-h-[36px] border transition-colors ${
              filter === sport
                ? 'bg-gaa-green text-white border-gaa-green'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {Object.entries(groups).length === 0 && (
        <p className="text-center text-gray-500 text-base py-8">No fixtures found.</p>
      )}

      {Object.entries(groups).map(([key, group]) => (
        <section key={key} className="mb-6">
          <h2 className="text-base font-bold text-gray-500 uppercase tracking-wide mb-3">
            {group.label}
          </h2>
          {group.items.map((fixture) => (
            <article
              key={fixture.id}
              className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
              aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {fixture.competition}
                  </span>
                  {fixture.tvChannel && (
                    <span className="ml-2 text-xs font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                      {fixture.tvChannel}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">{formatMatchDate(fixture.startDate)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-lg">
                <span>{fixture.homeTeam}</span>
                <span className="text-gray-400 font-normal text-base">vs</span>
                <span>{fixture.awayTeam}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{fixture.venue}</p>
            </article>
          ))}
        </section>
      ))}
    </PageWrapper>
  )
}
