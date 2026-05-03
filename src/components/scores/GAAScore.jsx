// Displays a GAA score in the traditional goals-points format.
// score = { gp: "1-18", total: 21 } or null

export default function GAAScore({ homeScore, awayScore, className = '' }) {
  if (!homeScore || !awayScore) return null

  const homeWin = homeScore.total > awayScore.total
  const awayWin = awayScore.total > homeScore.total

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-label={`Score: ${homeScore.gp} to ${awayScore.gp}`}>
      <span className={`text-2xl font-black tabular-nums ${homeWin ? 'text-gaa-green' : 'text-gray-800'}`}>
        {homeScore.gp}
      </span>
      <span className="text-gray-400 font-normal text-base">–</span>
      <span className={`text-2xl font-black tabular-nums ${awayWin ? 'text-gaa-green' : 'text-gray-800'}`}>
        {awayScore.gp}
      </span>
    </div>
  )
}
