import { useQuery } from '@tanstack/react-query'

const SOURCE_LABELS = {
  rte:        'RTÉ Sport',
  bbc:        'BBC Sport',
  hoganstand: 'Hoganstand',
}

async function fetchLiveRss() {
  const res = await fetch('/api/poll-scores')
  if (!res.ok) throw new Error(`RSS poll failed: ${res.status}`)
  return res.json()
}

export function useLiveRss(enabled) {
  return useQuery({
    queryKey:        ['live-rss'],
    queryFn:         fetchLiveRss,
    enabled:         !!enabled,
    refetchInterval: enabled ? 2 * 60 * 1000 : false,
    staleTime:       90 * 1000,
    retry:           0,
    select: (data) => ({
      items:     data.items ?? [],
      updatedAt: data.updatedAt ?? null,
      fresh:     data.fresh ?? false,
    }),
  })
}

export function filterRssForMatch(items, homeTeam, awayTeam) {
  const terms = [homeTeam, awayTeam].map((t) => t.toLowerCase())
  return items
    .filter((item) => terms.some((t) => item.title?.toLowerCase().includes(t)))
    .slice(0, 4)
}

export { SOURCE_LABELS }
