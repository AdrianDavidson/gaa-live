import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const subscription = req.body
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  const existing = (await redis.get('gaa:push:subscriptions')) ?? []
  const already  = existing.some((s) => s.endpoint === subscription.endpoint)

  if (!already) {
    await redis.set('gaa:push:subscriptions', [...existing, subscription])
  }

  res.status(201).json({ ok: true })
}
