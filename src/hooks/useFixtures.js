import { useQuery } from '@tanstack/react-query'
import { fetchGAAData } from '../services/fixturesService'

export function useGAAData() {
  return useQuery({
    queryKey:        ['gaa-data'],
    queryFn:         fetchGAAData,
    staleTime:       3 * 60 * 1000,    // 3 min
    refetchInterval: 5 * 60 * 1000,    // background refresh every 5 min
    retry:           2,
  })
}

// backward-compat alias used by existing page components
export const useHurlingData = useGAAData

export function useFixtures() {
  const query = useGAAData()
  return {
    ...query,
    data: query.data?.fixtures ?? [],
  }
}

export function useResults() {
  const query = useGAAData()
  return {
    ...query,
    data: query.data?.results ?? [],
  }
}
