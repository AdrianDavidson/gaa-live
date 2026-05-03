// All times in Irish Standard Time (UTC+1). ISO 8601 with +01:00 offset so
// date-fns formats correctly in the user's local timezone (Ireland).

export const MOCK_FIXTURES = [
  // --- Saturday 3 May 2026 ---
  {
    id:          'fix-001',
    homeTeam:    'Kildare',
    awayTeam:    'Westmeath',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Leinster SFC Semi-Final',
    venue:       "Glenisk O'Connor Park",
    sport:       'football',
    tvChannel:   'GAA+',
  },
  {
    id:          'fix-002',
    homeTeam:    'Clare',
    awayTeam:    'Limerick',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Munster SHC Round 3',
    venue:       'Páirc Chíosóg',
    sport:       'hurling',
    tvChannel:   'RTÉ',
  },
  {
    id:          'fix-003',
    homeTeam:    'Galway',
    awayTeam:    'Mayo',
    startDate:   '2026-05-03T15:00:00+01:00',
    competition: 'Ladies Connacht SFC Final',
    venue:       'Páirc Seán Mac Diarmada',
    sport:       'ladies',
    tvChannel:   'TG4',
  },
  {
    id:          'fix-004',
    homeTeam:    'Armagh',
    awayTeam:    'Down',
    startDate:   '2026-05-03T16:00:00+01:00',
    competition: 'Ulster SFC Semi-Final',
    venue:       'Clones',
    sport:       'football',
    tvChannel:   'RTÉ',
  },
  {
    id:          'fix-005',
    homeTeam:    'Dublin',
    awayTeam:    'Kildare',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Ladies Leinster SFC',
    venue:       'Parnell Park',
    sport:       'ladies',
    tvChannel:   null,
  },
  {
    id:          'fix-006',
    homeTeam:    'Cork',
    awayTeam:    'Waterford',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Ladies Munster SFC',
    venue:       'Páirc Uí Rinn',
    sport:       'ladies',
    tvChannel:   null,
  },
  {
    id:          'fix-007',
    homeTeam:    'Tipperary',
    awayTeam:    'Kerry',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Ladies Munster SFC',
    venue:       'Clonmel Sportsfield',
    sport:       'ladies',
    tvChannel:   null,
  },
  {
    id:          'fix-008',
    homeTeam:    'Donegal',
    awayTeam:    'Tyrone',
    startDate:   '2026-05-03T14:00:00+01:00',
    competition: 'Ladies Ulster SFC',
    venue:       'Lifford',
    sport:       'ladies',
    tvChannel:   'TG4',
  },
]

function isToday(dateStr) {
  const d   = new Date(dateStr)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  )
}

function isLive(dateStr) {
  const kickoff  = new Date(dateStr).getTime()
  const now      = Date.now()
  return now >= kickoff - 30 * 60 * 1000 && now <= kickoff + 110 * 60 * 1000
}

export const TODAY_FIXTURES = MOCK_FIXTURES.filter((f) => isToday(f.startDate))
export const LIVE_FIXTURES  = MOCK_FIXTURES.filter((f) => isLive(f.startDate))
