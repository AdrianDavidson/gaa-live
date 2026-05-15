import { redis }    from './_redis.js'
import { supabase } from './_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const county = req.query.county ?? 'Cork'
  const grade  = req.query.grade  ?? 'minor'
  const code   = req.query.code   ?? 'hurling'
  const season = req.query.season ?? null   // null = all seasons
  const limit  = Math.min(parseInt(req.query.limit ?? '150', 10), 300)

  const cacheKey = `results:${county}:${grade}:${code}:${season ?? 'all'}:${limit}`
  try {
    const cached = await redis.get(cacheKey)
    if (cached) return res.json(cached)
  } catch (_) {}

  try {
    const now = new Date().toISOString()

    let compQuery = supabase
      .from('competitions')
      .select('id')
      .eq('county', county)
      .eq('grade',  grade)
      .eq('code',   code)
    if (season) compQuery = compQuery.eq('season', parseInt(season, 10))

    const { data: comps, error: compErr } = await compQuery
    if (compErr) return res.status(500).json({ error: compErr.message })

    const compIds = (comps ?? []).map((c) => c.id)
    if (!compIds.length) {
      try { await redis.set(cacheKey, [], { ex: 300 }) } catch (_) {}
      return res.json([])
    }

    const { data: rows, error: gErr } = await supabase
      .from('games')
      .select(`
        id, venue, start_time,
        competition:competitions!competition_id ( id, name, short_name, format, season ),
        home_club:clubs!home_club_id ( id, name, primary_colour, secondary_colour, crest_url ),
        away_club:clubs!away_club_id ( id, name, primary_colour, secondary_colour, crest_url )
      `)
      .in('competition_id', compIds)
      .lt('start_time', now)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (gErr) return res.status(500).json({ error: gErr.message })

    const ids = (rows ?? []).map((g) => g.id)
    if (!ids.length) {
      try { await redis.set(cacheKey, [], { ex: 300 }) } catch (_) {}
      return res.json([])
    }

    const { data: scores } = await supabase
      .from('score_updates')
      .select('game_id, home_score, away_score, period, created_at')
      .in('game_id', ids)
      .eq('period', 'FT')

    const ftByGame = {}
    for (const s of scores ?? []) {
      ftByGame[s.game_id] = s
    }

    const results = (rows ?? [])
      .filter((g) => ftByGame[g.id])
      .map((g) => ({
        id:                 g.id,
        venue:              g.venue,
        start_time:         g.start_time,
        competition_id:     g.competition?.id,
        competition_short:  g.competition?.short_name,
        competition_name:   g.competition?.name,
        competition_format: g.competition?.format,
        competition_season: g.competition?.season,
        home_club:          g.home_club,
        away_club:          g.away_club,
        home_team:          g.home_club?.name,
        home_colour:        g.home_club?.primary_colour,
        away_team:          g.away_club?.name,
        away_colour:        g.away_club?.primary_colour,
        home_score:         ftByGame[g.id].home_score,
        away_score:         ftByGame[g.id].away_score,
        period:             'FT',
      }))

    try { await redis.set(cacheKey, results, { ex: 300 }) } catch (_) {}
    return res.json(results)
  } catch (err) {
    console.error('[results] unhandled error:', err?.message)
    return res.status(500).json({ error: err?.message ?? 'Internal server error' })
  }
}
