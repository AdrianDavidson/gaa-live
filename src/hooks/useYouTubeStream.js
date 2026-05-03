import { useQuery } from '@tanstack/react-query'
import { findYouTubeLiveStream } from '../services/youtubeService'

export function useYouTubeStream(searchTerm, enabled = true) {
  return useQuery({
    queryKey: ['yt-stream', searchTerm],
    queryFn:  () => findYouTubeLiveStream(searchTerm),
    refetchInterval: 60_000,
    enabled: enabled && !!searchTerm,
  })
}
