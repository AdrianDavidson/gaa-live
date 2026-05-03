import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const data      = await redis.get('gaa:rss:latest')
  const updatedAt = await redis.get('gaa:rss:updatedAt')

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
  res.json({ items: data ? JSON.parse(data) : [], updatedAt })
}
