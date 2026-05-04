import { useQuery } from '@tanstack/react-query'

export const SOURCE_LABELS = {
  rte:        'RTÉ Sport',
  bbc:        'BBC Sport',
  hoganstand: 'Hoganstand',
}

const HURLING_KEYWORDS  = ['hurling', 'hurler', 'sliotar', 'camán', 'camogie']
const FOOTBALL_KEYWORDS = ['football', 'footballer', 'gaa football']

function guessRssCode(title = '', content = '') {
  const text = `${title} ${content}`.toLowerCase()
  if (FOOTBALL_KEYWORDS.some((k) => text.includes(k))) return 'football'
  if (HURLING_KEYWORDS.some((k) => text.includes(k)))  return 'hurling'
  return 'unknown'
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
      items: (data.items ?? []).map((item) => ({
        ...item,
        code: guessRssCode(item.title, item.content),
      })),
      updatedAt: data.updatedAt ?? null,
      fresh:     data.fresh ?? false,
    }),
  })
}

// codeFilter: 'all' | 'football' | 'hurling'
export function filterRssForMatch(items, homeTeam, awayTeam, codeFilter = 'all') {
  const terms = [homeTeam, awayTeam].map((t) => t.toLowerCase())

  return items
    .filter((item) => {
      // team name match
      if (!terms.some((t) => item.title?.toLowerCase().includes(t))) return false
      // code filter — unknown items always shown
      if (codeFilter !== 'all' && item.code !== 'unknown' && item.code !== codeFilter) return false
      return true
    })
    .slice(0, 4)
}
