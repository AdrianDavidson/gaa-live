import { useQuery } from '@tanstack/react-query'

async function fetchStandings(competitionId) {
  const res = await fetch(`/api/standings?competitionId=${competitionId}`)
  if (!res.ok) throw new Error('Failed to fetch standings')
  return res.json()
}

export function useStandings(competitionId) {
  return useQuery({
    queryKey: ['standings', competitionId],
    queryFn:  () => fetchStandings(competitionId),
    enabled:  !!competitionId,
    staleTime: 5 * 60 * 1000,
  })
}
