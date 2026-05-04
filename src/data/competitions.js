// TheSportsDB free key is "3" — no registration needed.
// IDs confirmed via live API probe May 2026.
// Times from TheSportsDB are UTC — converted to IST (+01:00) at fetch time.

export const HURLING_COMPETITIONS = [
  {
    id:             'ai-shc',
    theSportsDbId:  5565,
    name:           'All-Ireland Senior Hurling Championship',
    short:          'AI SHC',
    group:          'senior',
    code:           'hurling',
  },
  {
    id:             'munster-shc',
    theSportsDbId:  5570,
    name:           'Munster Senior Hurling Championship',
    short:          'Munster SHC',
    group:          'senior',
    code:           'hurling',
  },
  {
    id:             'leinster-shc',
    theSportsDbId:  5571,
    name:           'Leinster Senior Hurling Championship',
    short:          'Leinster SHC',
    group:          'senior',
    code:           'hurling',
  },
  {
    id:             'mcdonagh-cup',
    theSportsDbId:  5572,
    name:           'Joe McDonagh Cup',
    short:          'McDonagh',
    group:          'senior',
    code:           'hurling',
  },
  {
    id:             'christy-ring',
    theSportsDbId:  5573,
    name:           'Christy Ring Cup',
    short:          'Christy Ring',
    group:          'senior',
    code:           'hurling',
  },
]

export const FOOTBALL_COMPETITIONS = [
  {
    id:             'ai-sfc',
    theSportsDbId:  5564,
    name:           'All-Ireland Senior Football Championship',
    short:          'AI SFC',
    group:          'senior',
    code:           'football',
  },
  {
    id:             'connacht-sfc',
    theSportsDbId:  5566,
    name:           'Connacht Senior Football Championship',
    short:          'Connacht SFC',
    group:          'senior',
    code:           'football',
  },
  {
    id:             'munster-sfc',
    theSportsDbId:  5568,
    name:           'Munster Senior Football Championship',
    short:          'Munster SFC',
    group:          'senior',
    code:           'football',
  },
  {
    id:             'leinster-sfc',
    theSportsDbId:  5567,
    name:           'Leinster Senior Football Championship',
    short:          'Leinster SFC',
    group:          'senior',
    code:           'football',
  },
  {
    id:             'ulster-sfc',
    theSportsDbId:  5569,
    name:           'Ulster Senior Football Championship',
    short:          'Ulster SFC',
    group:          'senior',
    code:           'football',
  },
  {
    id:             'tailteann',
    theSportsDbId:  5576,
    name:           'Tailteann Cup',
    short:          'Tailteann',
    group:          'senior',
    code:           'football',
  },
]

// Unified list — use this for filtering by code
export const competitions = [...HURLING_COMPETITIONS, ...FOOTBALL_COMPETITIONS]

export function getCompetitionById(id) {
  return competitions.find((c) => c.id === id)
}

export function competitionsByCode(code) {
  return code === 'all'
    ? competitions
    : competitions.filter((c) => c.code === code)
}

export const ACTIVE_TSDB_COMPETITIONS = competitions.filter(
  (c) => c.theSportsDbId !== null
)
