import { useQuery } from '@tanstack/react-query'
import { resolveFixtureTier, DATA_TIERS } from '../services/dataTierResolver'

const REFETCH_INTERVALS = {
  [DATA_TIERS.STREAM]: 60_000,
  [DATA_TIERS.LIVE]:   30_000,
  [DATA_TIERS.POLLED]: 600_000,
  [DATA_TIERS.NONE]:   300_000,
}

export function useMatchData(fixture) {
  return useQuery({
    queryKey: ['tier', fixture.id],
    queryFn:  () => resolveFixtureTier(fixture),
    refetchInterval: (query) =>
      REFETCH_INTERVALS[query.state.data?.tier] ?? 300_000,
    enabled: !!fixture,
  })
}
