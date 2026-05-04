// Vercel serverless function — aggregates TheSportsDB data for all hurling
// competitions and caches the result in Upstash Redis for 5 minutes.
// Falls back to direct TheSportsDB fetch if Redis is not configured.

const BASE    = 'https://www.thesportsdb.com/api/v1/json/3'
const CACHE_TTL = 300  // 5 minutes — faster score pickup after games end

const COMPETITIONS = [
  { id: 'ai-shc',      theSportsDbId: 5565, name: 'All-Ireland Senior Hurling Championship', short: 'AI SHC',     group: 'senior' },
  { id: 'munster-shc', theSportsDbId: 5570, name: 'Munster Senior Hurling Championship',     short: 'Munster SHC', group: 'senior' },
  { id: 'leinster-shc',theSportsDbId: 5571, name: 'Leinster Senior Hurling Championship',    short: 'Leinster SHC',group: 'senior' },
  { id: 'mcdonagh-cup',theSportsDbId: 5572, name: 'Joe McDonagh Cup',                        short: 'McDonagh',    group: 'senior' },
  { id: 'christy-ring',theSportsDbId: 5573, name: 'Christy Ring Cup',                        short: 'Christy Ring',group: 'senior' },
]

function cleanTeamName(raw) {
  return (raw ?? '').replace(/ GAA Hurling$/i, '').replace(/ GAA$/i, '').replace(/ Hurling$/i, '').trim()
}

function parseResult(strResult) {
  if (!strResult) return { home: null, away: null }
  const parts = strResult.match(/(\d+-\d+\s*\(\d+\))\s*(\d+-\d+\s*\(\d+\))/)
  if (!parts) return { home: null, away: null }
  const parse = (s) => {
    const m = s.match(/(\d+-\d+)\s*\((\d+)\)/)
    return m ? { gp: m[1], total: parseInt(m[2], 10) } : null
  }
  return { home: parse(parts[1]), away: parse(parts[2]) }
}

function normalizeEvent(event, competition) {
  const scores     = parseResult(event.strResult)
  const isFinished = event.strStatus === 'Match Finished' || event.intHomeScore !== null
  const time       = event.strTime?.substring(0, 5) ?? '00:00'
  return {
    id:               `tsdb-${event.idEvent}`,
    homeTeam:         cleanTeamName(event.strHomeTeam),
    awayTeam:         cleanTeamName(event.strAwayTeam),
    startDate:        event.dateEvent ? `${event.dateEvent}T${time}:00Z` : null,
    homeScore:        scores.home,
    awayScore:        scores.away,
    competition:      competition.name,
    competitionId:    competition.id,
    competitionShort: competition.short,
    group:            competition.group,
    venue:            event.strVenue ?? null,
    leagueBadge:      event.strLeagueBadge ?? null,
    season:           event.strSeason ?? null,
    status:           isFinished ? 'finished' : 'upcoming',
    source:           'thesportsdb',
    tvChannel:        null,
  }
}

async function fetchFromTSDB(endpoint, competition) {
  try {
    const res  = await fetch(`${BASE}/${endpoint}?id=${competition.theSportsDbId}`)
    const data = await res.json()
    return data?.events?.map((e) => normalizeEvent(e, competition)) ?? []
  } catch {
    return []
  }
}

async function buildPayload() {
  const allResults  = await Promise.all(COMPETITIONS.map((c) => fetchFromTSDB('eventspastleague.php', c)))
  const allFixtures = await Promise.all(COMPETITIONS.map((c) => fetchFromTSDB('eventsnextleague.php', c)))
  return {
    results:  allResults.flat().sort((a, b)  => new Date(b.startDate) - new Date(a.startDate)),
    fixtures: allFixtures.flat().sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    fetchedAt: new Date().toISOString(),
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`)

  // Try Redis cache first
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import('@upstash/redis')
      const redis     = new Redis({ url: redisUrl, token: redisToken })
      const cached    = await redis.get('gaa:hurling:fixtures')
      if (cached) return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached)

      const payload = await buildPayload()
      await redis.set('gaa:hurling:fixtures', JSON.stringify(payload), { ex: CACHE_TTL })
      return res.json(payload)
    } catch (err) {
      console.error('Redis error, falling back to direct fetch:', err.message)
    }
  }

  // No Redis configured — fetch directly (fine for dev / low traffic)
  const payload = await buildPayload()
  res.json(payload)
}
