import webpush         from 'web-push'
import { redis } from './_redis.js'
import { supabase }    from './_supabase.js'
import { requireAuth } from './_auth.js'



async function notifyClubFollowers(homeClub, awayClub, homeScore, awayScore, period) {
  webpush.setVapidDetails(
    'mailto:admin@gaaapp.ie',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const [homeSubs, awaySubs] = await Promise.all([
    redis.get(`minor:push:club:${homeClub}`) ?? [],
    redis.get(`minor:push:club:${awayClub}`) ?? [],
  ])
  const seen = new Set()
  const subs = [...(homeSubs ?? []), ...(awaySubs ?? [])].filter((s) => {
    if (seen.has(s.endpoint)) return false
    seen.add(s.endpoint); return true
  })
  const payload = JSON.stringify({
    title: `Minor · ${period}`,
    body:  `${homeClub} ${homeScore}  –  ${awayClub} ${awayScore}`,
    url:   '/',
  })
  for (const sub of subs) {
    try { await webpush.sendNotification(sub, payload) } catch (_) {}
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuth(req, res, ['pro', 'admin'])
  if (!auth) return

  const { gameId, homeScore, awayScore, period } = req.body
  if (!gameId || !homeScore || !awayScore || !period) {
    return res.status(400).json({ error: 'gameId, homeScore, awayScore, period required' })
  }

  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id, competition_id, home_club:clubs!home_club_id(name), away_club:clubs!away_club_id(name), assigned_pro_id')
    .eq('id', gameId)
    .single()

  if (gameErr || !game) return res.status(404).json({ error: 'Game not found' })

  if (auth.role === 'pro') {
    const { data: pro } = await supabase
      .from('pros')
      .select('id')
      .eq('clerk_id', auth.userId)
      .single()
    if (!pro || game.assigned_pro_id !== pro.id) {
      return res.status(403).json({ error: 'Not assigned to this game' })
    }

    const { data: scoreRow, error: insertErr } = await supabase
      .from('score_updates')
      .insert({ game_id: gameId, home_score: homeScore, away_score: awayScore, period, submitted_by: pro.id })
      .select()
      .single()
    if (insertErr) return res.status(500).json({ error: insertErr.message })
  } else {
    const { error: insertErr } = await supabase
      .from('score_updates')
      .insert({ game_id: gameId, home_score: homeScore, away_score: awayScore, period })
    if (insertErr) return res.status(500).json({ error: insertErr.message })
  }

  const today = new Date().toISOString().split('T')[0]
  const dateKeys = await redis.keys(`games:cache:*:${today}`)
  if (dateKeys.length) await redis.del(...dateKeys)
  await redis.del(`standings:cache:${game.competition_id}`)

  const homeTeam = game.home_club?.name
  const awayTeam = game.away_club?.name
  if (homeTeam && awayTeam) {
    notifyClubFollowers(homeTeam, awayTeam, homeScore, awayScore, period).catch(() => {})
  }

  return res.json({ ok: true })
}
