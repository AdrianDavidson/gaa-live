import { useClubTheme } from '../../hooks/useClubTheme'

export default function StandingsTable({ rows }) {
  const theme = useClubTheme()

  return (
    <div className="overflow-x-auto rounded-xl border border-gaa-border">
      <table className="w-full text-xs min-w-[360px]">
        <thead>
          <tr className="bg-gaa-surface-raised border-b border-gaa-border">
            <th className="text-left px-3 py-2 font-bold text-gaa-text-muted">Club</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">P</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">W</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">D</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">L</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">F</th>
            <th className="px-2 py-2 font-bold text-gaa-text-muted">A</th>
            <th className="px-2 py-2 font-bold text-gaa-amber">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isMyClub = theme.name && row.team === theme.name
            return (
              <tr
                key={row.team}
                className={`border-b border-gaa-border last:border-0 ${isMyClub ? 'bg-gaa-surface-raised' : 'bg-gaa-surface'}`}
                style={isMyClub ? { borderLeft: `3px solid ${theme.primary ?? '#7C3AED'}` } : {}}
              >
                <td className="px-3 py-2 text-gaa-text">
                  {isMyClub && <span className="mr-1 text-gaa-amber" aria-hidden="true">▶</span>}
                  {row.team}
                </td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.played}</td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.won}</td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.drawn}</td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.lost}</td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.for}</td>
                <td className="px-2 py-2 text-center text-gaa-text-muted">{row.against}</td>
                <td className="px-2 py-2 text-center font-black text-gaa-amber">{row.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
