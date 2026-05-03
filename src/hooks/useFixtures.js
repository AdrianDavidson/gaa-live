import { useQuery } from '@tanstack/react-query'
import { fetchHurlingData } from '../services/fixturesService'

export function useHurlingData() {
  return useQuery({
    queryKey:        ['hurling-data'],
    queryFn:         fetchHurlingData,
    staleTime:       10 * 60 * 1000,   // 10 min
    refetchInterval: 15 * 60 * 1000,   // background refresh every 15 min
    retry:           2,
  })
}

export function useFixtures() {
  const query = useHurlingData()
  return {
    ...query,
    data: query.data?.fixtures ?? [],
  }
}

export function useResults() {
  const query = useHurlingData()
  return {
    ...query,
    data: query.data?.results ?? [],
  }
}
