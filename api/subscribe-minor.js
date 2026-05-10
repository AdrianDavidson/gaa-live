import { redis } from './_redis.js'



export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { subscription, clubs } = req.body
  if (!subscription?.endpoint || !Array.isArray(clubs)) {
    return res.status(400).json({ error: 'subscription and clubs[] required' })
  }

  const allKeys = await redis.keys('minor:push:club:*')
  for (const key of allKeys) {
    const subs = (await redis.get(key)) ?? []
    const filtered = subs.filter((s) => s.endpoint !== subscription.endpoint)
    if (filtered.length !== subs.length) {
      await redis.set(key, filtered)
    }
  }

  for (const club of clubs) {
    const key  = `minor:push:club:${club}`
    const subs = (await redis.get(key)) ?? []
    subs.push(subscription)
    await redis.set(key, subs)
  }

  return res.json({ ok: true })
}
