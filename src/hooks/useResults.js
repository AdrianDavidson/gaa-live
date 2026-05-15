import { useQuery } from '@tanstack/react-query'

async function fetchResults({ county = 'Cork', grade = 'minor', code = 'hurling', season } = {}) {
  const params = new URLSearchParams({ county, grade, code })
  if (season) params.set('season', season)
  const res = await fetch(`/api/results?${params}`)
  if (!res.ok) throw new Error('Failed to fetch results')
  return res.json()
}

export function useResults({ county, grade, code, season } = {}) {
  return useQuery({
    queryKey: ['results', county ?? 'Cork', grade ?? 'minor', code ?? 'hurling', season ?? 'all'],
    queryFn:  () => fetchResults({ county, grade, code, season }),
    staleTime: 5 * 60 * 1000,
  })
}
