const BASE = 'https://www.thesportsdb.com/api/v1/json/3'

// TheSportsDB stores team names as "Cork GAA Hurling" — strip the suffix.
function cleanTeamName(raw) {
  return raw
    .replace(/ GAA Hurling$/i, '')
    .replace(/ GAA$/i, '')
    .replace(/ Hurling$/i, '')
    .trim()
}

// Parse "1-18 (21)" into { gp: "1-18", total: 21 }
function parseGAAScore(fragment) {
  if (!fragment) return null
  const m = fragment.match(/(\d+-\d+)\s*\((\d+)\)/)
  if (!m) return null
  return { gp: m[1], total: parseInt(m[2], 10) }
}

// Parse strResult "1-18 (21) 3-27 (36)" into home + away score objects
function parseResult(strResult) {
  if (!strResult) return { home: null, away: null }
  const parts = strResult.match(/(\d+-\d+\s*\(\d+\))\s*(\d+-\d+\s*\(\d+\))/)
  if (!parts) return { home: null, away: null }
  return {
    home: parseGAAScore(parts[1]),
    away: parseGAAScore(parts[2]),
  }
}

// TheSportsDB times are UTC. Combine dateEvent + strTime into a proper ISO string.
function buildISODate(dateEvent, strTime) {
  if (!dateEvent) return null
  const time = strTime?.substring(0, 5) ?? '00:00'  // "HH:MM"
  return `${dateEvent}T${time}:00Z`  // UTC
}

function normalizeEvent(event, competition) {
  const scores = parseResult(event.strResult)
  const isFinished =
    event.strStatus === 'Match Finished' ||
    event.intHomeScore !== null ||
    event.intAwayScore !== null

  return {
    id:             `tsdb-${event.idEvent}`,
    homeTeam:       cleanTeamName(event.strHomeTeam ?? ''),
    awayTeam:       cleanTeamName(event.strAwayTeam ?? ''),
    startDate:      buildISODate(event.dateEvent, event.strTime),
    homeScore:      scores.home,  // { gp: "1-18", total: 21 } or null
    awayScore:      scores.away,
    competition:    competition.name,
    competitionId:  competition.id,
    competitionShort: competition.short,
    group:          competition.group,
    venue:          event.strVenue ?? null,
    status:         isFinished ? 'finished' : 'upcoming',
    source:         'thesportsdb',
    tvChannel:      null,
  }
}

async function fetchEvents(endpoint, competition) {
  try {
    const res  = await fetch(`${BASE}/${endpoint}?id=${competition.theSportsDbId}`)
    const data = await res.json()
    if (!data?.events?.length) return []
    return data.events.map((e) => normalizeEvent(e, competition))
  } catch (err) {
    console.error(`TheSportsDB fetch failed for ${competition.name}:`, err.message)
    return []
  }
}

export async function fetchCompetitionResults(competition) {
  return fetchEvents('eventspastleague.php', competition)
}

export async function fetchCompetitionFixtures(competition) {
  return fetchEvents('eventsnextleague.php', competition)
}

export async function fetchAllHurlingData(competitions) {
  const results  = await Promise.all(competitions.map(fetchCompetitionResults))
  const fixtures = await Promise.all(competitions.map(fetchCompetitionFixtures))
  return {
    results:  results.flat().sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
    fixtures: fixtures.flat().sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
  }
}
