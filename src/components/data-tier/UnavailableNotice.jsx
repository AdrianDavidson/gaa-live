export default function UnavailableNotice({ fixture }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mt-3"
    >
      <p className="text-lg font-bold text-gray-700 mb-1">
        No live data for this match
      </p>
      <p className="text-base text-gray-500 mb-3">
        We weren't able to find a live stream or score updates for{' '}
        <strong>{fixture.homeTeam} v {fixture.awayTeam}</strong> right now.
      </p>
      <p className="text-sm text-gray-400 mb-3">
        The result will appear here once it's published. You can follow the game
        on RTÉ Sport or BBC Sport in the meantime.
      </p>
      <div className="flex justify-center gap-4">
        <a
          href="https://www.rte.ie/sport/gaa/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-gaa-green underline min-h-[48px] flex items-center"
        >
          RTÉ Sport ↗
        </a>
        <a
          href="https://www.bbc.co.uk/sport/gaelic-games"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-gaa-green underline min-h-[48px] flex items-center"
        >
          BBC Sport ↗
        </a>
      </div>
    </div>
  )
}
