// Sample fixtures — replace with live Foireann/GAA API data in production
const now = new Date()

function hoursFromNow(h) {
  return new Date(now.getTime() + h * 60 * 60 * 1000).toISOString()
}

export const MOCK_FIXTURES = [
  {
    id: 'fix-001',
    homeTeam:    'Kerry',
    awayTeam:    'Dublin',
    startDate:   hoursFromNow(-1),
    competition: 'All Ireland SFC',
    venue:       'Croke Park',
    sport:       'football',
  },
  {
    id: 'fix-002',
    homeTeam:    'Kilkenny',
    awayTeam:    'Tipperary',
    startDate:   hoursFromNow(2),
    competition: 'All Ireland SHC',
    venue:       'Nowlan Park',
    sport:       'hurling',
  },
  {
    id: 'fix-003',
    homeTeam:    'Galway',
    awayTeam:    'Mayo',
    startDate:   hoursFromNow(24),
    competition: 'Connacht SFC',
    venue:       'Pearse Stadium',
    sport:       'football',
  },
  {
    id: 'fix-004',
    homeTeam:    'Cork',
    awayTeam:    'Limerick',
    startDate:   hoursFromNow(-3),
    competition: 'Munster SHC',
    venue:       'Páirc Uí Chaoimh',
    sport:       'hurling',
  },
  {
    id: 'fix-005',
    homeTeam:    'Donegal',
    awayTeam:    'Tyrone',
    startDate:   hoursFromNow(48),
    competition: 'Ulster SFC',
    venue:       "MacCumhaill Park",
    sport:       'football',
  },
]

export const TODAY_FIXTURES = MOCK_FIXTURES.filter((f) => {
  const diff = Math.abs(new Date(f.startDate).getTime() - now.getTime())
  return diff < 24 * 60 * 60 * 1000
})

export const LIVE_FIXTURES = MOCK_FIXTURES.filter((f) => {
  const kickoff  = new Date(f.startDate).getTime()
  const earliest = kickoff - 30 * 60 * 1000
  const latest   = kickoff + 110 * 60 * 1000
  const t        = now.getTime()
  return t >= earliest && t <= latest
})
