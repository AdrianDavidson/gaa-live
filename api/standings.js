import { redis } from './_redis.js'
import { supabase } from './_supabase.js'



function parseGAA(score) {
  if (!score) return 0
  const [g, p] = score.split('-').map(Number)
  return g * 3 + (p || 0)
}

function ensure(table, team) {
  if (!table[team]) {
    table[team] = { team, played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, pts: 0 }
  }
}

function calculateStandings(games) {
  const table = {}
  for (const game of games) {
    const homeTotal = parseGAA(game.home_score)
    const awayTotal = parseGAA(game.away_score)

    ensure(table, game.home_team)
    ensure(table, game.away_team)

    table[game.home_team].played++
    table[game.away_team].played++
    table[game.home_team].for     += homeTotal
    table[game.home_team].against += awayTotal
    table[game.away_team].for     += awayTotal
    table[game.away_team].against += homeTotal

    if (homeTotal > awayTotal) {
      table[game.home_team].won++;  table[game.home_team].pts += 2
      table[game.away_team].lost++
    } else if (awayTotal > homeTotal) {
      table[game.away_team].won++;  table[game.away_team].pts += 2
      table[game.home_team].lost++
    } else {
      table[game.home_team].drawn++; table[game.home_team].pts++
      table[game.away_team].drawn++; table[game.away_team].pts++
    }
  }
  return Object.values(table).sort(
    (a, b) => b.pts - a.pts || (b.for - b.against) - (a.for - a.against)
  )
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { competitionId } = req.query
  if (!competitionId) return res.status(400).json({ error: 'competitionId required' })

  const cacheKey = `standings:cache:${competitionId}`
  const cached   = await redis.get(cacheKey)
  if (cached) return res.json(cached)

  // Step 1: get game IDs for this competition (can't filter joined tables via .eq in Supabase JS)
  const { data: gameRows, error: gErr } = await supabase
    .from('games')
    .select('id, home_club:clubs!home_club_id(name), away_club:clubs!away_club_id(name)')
    .eq('competition_id', competitionId)

  if (gErr) return res.status(500).json({ error: gErr.message })
  const gameIds = (gameRows ?? []).map((g) => g.id)
  if (!gameIds.length) { await redis.set(cacheKey, [], { ex: 300 }); return res.json([]) }

  const nameByGameId = {}
  for (const g of gameRows ?? []) {
    nameByGameId[g.id] = { home: g.home_club?.name, away: g.away_club?.name }
  }

  // Step 2: get all FT score_updates for those games
  const { data: scores, error: sErr } = await supabase
    .from('score_updates')
    .select('game_id, home_score, away_score, period, created_at')
    .in('game_id', gameIds)
    .eq('period', 'FT')
    .order('created_at', { ascending: false })

  if (sErr) return res.status(500).json({ error: sErr.message })

  // Latest FT update per game wins
  const latestByGame = {}
  for (const s of scores ?? []) {
    if (!latestByGame[s.game_id]) latestByGame[s.game_id] = s
  }

  const ftGames = Object.values(latestByGame)
    .map((su) => ({
      home_team:  nameByGameId[su.game_id]?.home,
      away_team:  nameByGameId[su.game_id]?.away,
      home_score: su.home_score,
      away_score: su.away_score,
    }))
    .filter((g) => g.home_team && g.away_team)

  const standings = calculateStandings(ftGames)
  await redis.set(cacheKey, standings, { ex: 300 })
  return res.json(standings)
}
