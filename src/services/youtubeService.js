const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const GAA_CHANNEL_ID = 'UC14eltCtgNDkBCTbGIYcRpg'

export async function findYouTubeLiveStream(searchTerm) {
  if (!YT_KEY) return null
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('type', 'video')
    url.searchParams.set('eventType', 'live')
    url.searchParams.set('q', searchTerm)
    url.searchParams.set('channelId', GAA_CHANNEL_ID)
    url.searchParams.set('maxResults', '3')
    url.searchParams.set('key', YT_KEY)

    const res  = await fetch(url.toString())
    const data = await res.json()
    if (!data.items?.length) return null

    const item = data.items[0]
    return {
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      channelName: item.snippet.channelTitle,
      embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}?autoplay=0`,
      watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }
  } catch (err) {
    console.error('YouTube API error:', err)
    return null
  }
}
