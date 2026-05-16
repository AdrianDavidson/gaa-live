import { redis }       from '../_redis.js'
import { supabase }    from '../_supabase.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  const auth = await requireAuth(req, res, ['admin'])
  if (!auth) return

  if (req.method === 'POST') {
    const { homeClubId, awayClubId, competitionId, venue, startTime, assignedProId } = req.body
    const { data, error } = await supabase
      .from('games')
      .upsert({
        home_club_id:    homeClubId    || null,
        away_club_id:    awayClubId    || null,
        competition_id:  competitionId || null,
        venue,
        start_time:      startTime,
        assigned_pro_id: assignedProId || null,
      }, { onConflict: 'home_club_id,away_club_id,start_time', ignoreDuplicates: true })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    await bustGameCache(startTime)
    return res.json(data)
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    const { homeClubId, awayClubId, competitionId, venue, startTime, assignedProId } = req.body
    const { data, error } = await supabase
      .from('games')
      .update({
        home_club_id:    homeClubId    || null,
        away_club_id:    awayClubId    || null,
        competition_id:  competitionId || null,
        venue,
        start_time:      startTime,
        assigned_pro_id: assignedProId || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    await bustGameCache(startTime)
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const { data: game } = await supabase.from('games').select('start_time').eq('id', id).single()
    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    if (game?.start_time) await bustGameCache(game.start_time)
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

async function bustGameCache(startTime) {
  if (!startTime) return
  const date = new Date(startTime).toISOString().split('T')[0]
  const keys = await redis.keys(`games:cache:*:${date}`)
  if (keys.length) await redis.del(...keys)
}
