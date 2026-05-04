export default function UnavailableNotice({ fixture }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mt-3"
    >
      <p className="text-base font-bold text-gray-700 mb-1">
        Live in-game scores aren&apos;t available yet
      </p>
      <p className="text-sm text-gray-500 mb-1">
        We&apos;re sorry — we can&apos;t show a live score for{' '}
        <strong>{fixture.homeTeam} v {fixture.awayTeam}</strong> right now.
      </p>
      <p className="text-sm text-gray-500 mb-3">
        The final score will appear here as soon as the match ends, sourced from
        TheSportsDB, RTÉ Sport, BBC Sport, and Hoganstand. Real-time in-game
        scores are something we&apos;re working on bringing to the app in the future.
      </p>
      <p className="text-xs text-gray-400 mb-3">
        For live updates during the game, follow along on:
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
        <a
          href="https://www.hoganstand.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-gaa-green underline min-h-[48px] flex items-center"
        >
          Hoganstand ↗
        </a>
      </div>
    </div>
  )
}
