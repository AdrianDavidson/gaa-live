import { useQuery }   from '@tanstack/react-query'
import PageWrapper     from '../components/layout/PageWrapper'
import Spinner         from '../components/ui/Spinner'
import { formatTimeAgo } from '../utils/matchStatus'

async function fetchResults() {
  const res  = await fetch('/api/scores')
  const data = await res.json()
  return data
}

export default function Results() {
  const { data, isLoading, isError } = useQuery({
    queryKey:       ['results'],
    queryFn:        fetchResults,
    refetchInterval: 600_000,
    retry: false,
  })

  const SOURCE_LABELS = {
    rte:        'RTÉ Sport',
    bbc:        'BBC Sport',
    hoganstand: 'HoganStand',
  }

  return (
    <PageWrapper title="Results">
      {isLoading && <Spinner label="Loading results…" />}

      {isError && (
        <div role="alert" className="text-center text-gray-500 py-8">
          <p className="text-base font-medium mb-2">
            We couldn't load results right now.
          </p>
          <p className="text-sm">Check your internet connection and try again.</p>
        </div>
      )}

      {data?.updatedAt && (
        <p className="text-sm text-gray-400 mb-4">
          Last updated {formatTimeAgo(data.updatedAt)}
        </p>
      )}

      {data?.items?.length === 0 && (
        <p className="text-center text-gray-500 text-base py-8">
          No results yet. Check back after today's games.
        </p>
      )}

      {data?.items?.map((item, i) => (
        <article
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
        >
          <div className="flex justify-between items-start mb-1">
            <p className="font-bold text-base text-gray-900 flex-1 pr-2">{item.title}</p>
            <span className="text-xs text-gray-400 shrink-0">
              {SOURCE_LABELS[item.source] ?? item.source}
            </span>
          </div>
          {item.pubDate && (
            <p className="text-xs text-gray-400">
              Published {formatTimeAgo(item.pubDate)}
            </p>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gaa-green font-bold mt-1 inline-block min-h-[44px] flex items-center hover:underline"
            >
              Read more ↗
            </a>
          )}
        </article>
      ))}
    </PageWrapper>
  )
}
