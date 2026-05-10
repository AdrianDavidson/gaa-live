import { useQuery } from '@tanstack/react-query'

async function fetchGames({ date, dateTo, county = 'Cork', grade = 'minor', code = 'hurling' }) {
  const params = new URLSearchParams({ date, county, grade, code })
  if (dateTo && dateTo !== date) params.set('dateTo', dateTo)
  const res = await fetch(`/api/games?${params}`)
  if (!res.ok) throw new Error('Failed to fetch games')
  return res.json()
}

// For Today page — live refetch every 2 min
export function useGames({ date, dateTo, county, grade, code } = {}) {
  const today = date ?? new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['games', today, dateTo ?? today, county, grade, code],
    queryFn:  () => fetchGames({ date: today, dateTo: dateTo ?? today, county, grade, code }),
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: false,
  })
}

// For Fixtures page — no live refetch needed, stale for 5 min
export function useUpcomingGames({ dateFrom, dateTo, county, grade, code } = {}) {
  const from = dateFrom ?? new Date().toISOString().split('T')[0]
  const to   = dateTo   ?? addDays(from, 13)
  return useQuery({
    queryKey: ['games-range', from, to, county, grade, code],
    queryFn:  () => fetchGames({ date: from, dateTo: to, county, grade, code }),
    staleTime: 5 * 60 * 1000,
  })
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}
