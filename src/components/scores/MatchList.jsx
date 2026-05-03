import ScoreCard from './ScoreCard'

export default function MatchList({ fixtures, emptyMessage = 'No matches found.' }) {
  if (!fixtures?.length) {
    return (
      <p className="text-center text-gray-500 text-base py-8">{emptyMessage}</p>
    )
  }

  return (
    <section aria-label="Match list">
      {fixtures.map((fixture) => (
        <ScoreCard key={fixture.id} fixture={fixture} />
      ))}
    </section>
  )
}
