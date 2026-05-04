import Parser  from 'rss-parser'
import { Redis } from '@upstash/redis'
import webpush  from 'web-push'

const parser = new Parser()
const redis  = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const RSS_SOURCES = [
  { name: 'rte',        url: 'https://www.rte.ie/sport/gaa/rss/' },
  { name: 'bbc',        url: 'https://feeds.bbci.co.uk/sport/gaelic-games/rss.xml' },
  { name: 'hoganstand', url: 'https://www.hoganstand.com/feed' },
]

// Minimum gap between real RSS fetches — prevents hammering sources
// during match windows when many clients call this endpoint simultaneously.
const MIN_REFRESH_MS = 2 * 60 * 1000  // 2 minutes

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  // Check freshness before hitting RSS sources
  const updatedAt = await redis.get('gaa:rss:updatedAt')
  const ageMs     = updatedAt ? Date.now() - new Date(updatedAt).getTime() : Infinity

  if (ageMs < MIN_REFRESH_MS) {
    const cached = await redis.get('gaa:rss:latest')
    const items  = cached ? (typeof cached === 'string' ? JSON.parse(cached) : cached) : []
    return res.json({ ok: true, fresh: false, items, updatedAt })
  }

  // Stale — fetch from all RSS sources
  const allItems = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      feed.items.forEach((item) =>
        allItems.push({
          source:  source.name,
          title:   item.title,
          link:    item.link,
          pubDate: item.pubDate,
          content: item.contentSnippet,
        })
      )
    } catch (err) {
      console.error(`RSS fetch failed for ${source.name}:`, err.message)
    }
  }

  const fresh    = JSON.stringify(allItems)
  const previous = await redis.get('gaa:rss:latest')
  const changed  = fresh !== (typeof previous === 'string' ? previous : JSON.stringify(previous))
  const now      = new Date().toISOString()

  if (changed) {
    await redis.set('gaa:rss:latest', fresh)
    await redis.set('gaa:rss:updatedAt', now)
    await triggerPushNotifications(allItems, previous ? JSON.parse(previous) : [])
  } else {
    // Even if content is same, update the timestamp so staleness resets
    await redis.set('gaa:rss:updatedAt', now)
  }

  res.json({ ok: true, fresh: true, items: allItems, updatedAt: now, changed })
}

async function triggerPushNotifications(fresh, previous) {
  const prevTitles = new Set(previous.map((i) => i.title))
  const newResults = fresh.filter((i) => !prevTitles.has(i.title))
  if (!newResults.length) return

  const subscriptions = (await redis.get('gaa:push:subscriptions')) ?? []

  webpush.setVapidDetails(
    'mailto:admin@gaaapp.ie',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  for (const result of newResults.slice(0, 3)) {
    const payload = JSON.stringify({
      title: result.title,
      body:  'New GAA result — tap to view',
      url:   '/results',
    })
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload)
      } catch (_) {}
    }
  }
}
