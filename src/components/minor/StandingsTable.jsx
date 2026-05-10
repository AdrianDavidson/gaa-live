import { useClubTheme } from '../../hooks/useClubTheme'

export default function StandingsTable({ rows }) {
  const theme = useClubTheme()

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-xs min-w-[360px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 font-bold text-gray-600">Club</th>
            <th className="px-2 py-2 font-bold text-gray-600">P</th>
            <th className="px-2 py-2 font-bold text-gray-600">W</th>
            <th className="px-2 py-2 font-bold text-gray-600">D</th>
            <th className="px-2 py-2 font-bold text-gray-600">L</th>
            <th className="px-2 py-2 font-bold text-gray-600">F</th>
            <th className="px-2 py-2 font-bold text-gray-600">A</th>
            <th className="px-2 py-2 font-bold text-gray-600">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isMyClub = theme.name && row.team === theme.name
            return (
              <tr
                key={row.team}
                className={`border-b border-gray-100 last:border-0 ${isMyClub ? 'font-bold bg-white' : 'font-normal'}`}
                style={isMyClub ? { borderLeft: `3px solid ${theme.primary}` } : {}}
              >
                <td className="px-3 py-2 text-gray-900">
                  {isMyClub && <span className="mr-1 text-gaa-minor" aria-hidden="true">▶</span>}
                  {row.team}
                </td>
                <td className="px-2 py-2 text-center text-gray-700">{row.played}</td>
                <td className="px-2 py-2 text-center text-gray-700">{row.won}</td>
                <td className="px-2 py-2 text-center text-gray-700">{row.drawn}</td>
                <td className="px-2 py-2 text-center text-gray-700">{row.lost}</td>
                <td className="px-2 py-2 text-center text-gray-700">{row.for}</td>
                <td className="px-2 py-2 text-center text-gray-700">{row.against}</td>
                <td className="px-2 py-2 text-center font-black text-gaa-minor">{row.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
