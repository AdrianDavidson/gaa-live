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

export default async function handler(req, res) {
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

  if (fresh !== previous) {
    await redis.set('gaa:rss:latest', fresh)
    await redis.set('gaa:rss:updatedAt', new Date().toISOString())
    await triggerPushNotifications(allItems, previous ? JSON.parse(previous) : [])
  }

  res.json({ ok: true, itemCount: allItems.length, changed: fresh !== previous })
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
