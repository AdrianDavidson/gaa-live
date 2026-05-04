// Vercel serverless function — fetches full-season GAA data for all active competitions
// and caches in Upstash Redis for 5 minutes.

const BASE      = 'https://www.thesportsdb.com/api/v1/json/3'
const CACHE_TTL = 300  // 5 minutes

const COMPETITIONS = [
  // ── Hurling ──────────────────────────────────────────────────────────────
  { id: 'ai-shc',       theSportsDbId: 5565, name: 'All-Ireland Senior Hurling Championship', short: 'AI SHC',      group: 'senior', code: 'hurling' },
  { id: 'munster-shc',  theSportsDbId: 5570, name: 'Munster Senior Hurling Championship',     short: 'Munster SHC', group: 'senior', code: 'hurling' },
  { id: 'leinster-shc', theSportsDbId: 5571, name: 'Leinster Senior Hurling Championship',    short: 'Leinster SHC',group: 'senior', code: 'hurling' },
  { id: 'mcdonagh-cup', theSportsDbId: 5572, name: 'Joe McDonagh Cup',                        short: 'McDonagh',    group: 'senior', code: 'hurling' },
  { id: 'christy-ring', theSportsDbId: 5573, name: 'Christy Ring Cup',                        short: 'Christy Ring',group: 'senior', code: 'hurling' },

  // ── Football ─────────────────────────────────────────────────────────────
  { id: 'ai-sfc',       theSportsDbId: 5564, name: 'All-Ireland Senior Football Championship', short: 'AI SFC',      group: 'senior', code: 'football' },
  { id: 'connacht-sfc', theSportsDbId: 5566, name: 'Connacht Senior Football Championship',    short: 'Connacht SFC',group: 'senior', code: 'football' },
  { id: 'munster-sfc',  theSportsDbId: 5568, name: 'Munster Senior Football Championship',     short: 'Munster SFC', group: 'senior', code: 'football' },
  { id: 'leinster-sfc', theSportsDbId: 5567, name: 'Leinster Senior Football Championship',    short: 'Leinster SFC',group: 'senior', code: 'football' },
  { id: 'ulster-sfc',   theSportsDbId: 5569, name: 'Ulster Senior Football Championship',      short: 'Ulster SFC',  group: 'senior', code: 'football' },
  { id: 'tailteann',    theSportsDbId: 5576, name: 'Tailteann Cup',                            short: 'Tailteann',   group: 'senior', code: 'football' },
]

function cleanTeamName(raw) {
  return (raw ?? '')
    .replace(/ GAA Hurling$/i, '')
    .replace(/ GAA Football$/i, '')
    .replace(/ GAA$/i, '')
    .replace(/ Hurling$/i, '')
    .replace(/ Football$/i, '')
    .trim()
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
    code:             competition.code,
    venue:            event.strVenue ?? null,
    leagueBadge:      event.strLeagueBadge ?? null,
    season:           event.strSeason ?? null,
    status:           isFinished ? 'finished' : 'upcoming',
    source:           'thesportsdb',
    tvChannel:        null,
  }
}

async function fetchSeasonEvents(competition, season) {
  try {
    const res  = await fetch(`${BASE}/eventsseason.php?id=${competition.theSportsDbId}&s=${season}`)
    const data = await res.json()
    return data?.events?.map((e) => normalizeEvent(e, competition)) ?? []
  } catch {
    return []
  }
}

async function detectSeason() {
  const year     = new Date().getFullYear()
  const firstId  = COMPETITIONS[0].theSportsDbId
  for (const y of [year, year - 1]) {
    try {
      const res  = await fetch(`${BASE}/eventsseason.php?id=${firstId}&s=${y}`)
      const data = await res.json()
      if (data?.events?.length) return String(y)
    } catch {}
  }
  return String(year)
}

async function buildPayload() {
  const season    = await detectSeason()
  const allEvents = await Promise.all(COMPETITIONS.map((c) => fetchSeasonEvents(c, season)))
  const flat      = allEvents.flat()
  const now       = new Date()

  return {
    results:  flat.filter((e) => e.status === 'finished')
                  .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
    fixtures: flat.filter((e) => e.status === 'upcoming' && new Date(e.startDate) > now)
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    season,
    fetchedAt: new Date().toISOString(),
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`)

  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import('@upstash/redis')
      const redis     = new Redis({ url: redisUrl, token: redisToken })
      const cached    = await redis.get('gaa:fixtures')
      if (cached) return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached)

      const payload = await buildPayload()
      await redis.set('gaa:fixtures', JSON.stringify(payload), { ex: CACHE_TTL })
      return res.json(payload)
    } catch (err) {
      console.error('Redis error, falling back to direct fetch:', err.message)
    }
  }

  res.json(await buildPayload())
}
